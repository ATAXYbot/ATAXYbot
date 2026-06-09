import React, { useState, useEffect } from 'react';
import { useVoiceRoomAudio } from './useVoiceRoomAudio';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kwzpnupjtvfrevpwfaao.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_...';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function VoiceRoomTab({ tgUser }) {
    const currentUserId = String(tgUser?.id || Math.floor(Math.random() * 10000));

    const [activeRoom, setActiveRoom] = useState(null);
    const [seats, setSeats] = useState([null, null, null, null]);
    const [audience, setAudience] = useState([]);
    const [joinRoomId, setJoinRoomId] = useState('');
    const [showJoinModal, setShowJoinModal] = useState(false);
    
    const [isLocalMuted, setIsLocalMuted] = useState(true);

    useEffect(() => {
        if (!activeRoom) return;

        const fetchRoomData = async () => {
            const { data: seatData } = await supabase.from('room_seats').select('*').eq('room_id', activeRoom.id);
            const { data: audienceData } = await supabase.from('room_audience').select('*').eq('room_id', activeRoom.id);
            
            const newSeats = [null, null, null, null];
            if (seatData) {
                seatData.forEach(s => {
                    newSeats[s.seat_index] = s;
                });
            }
            setSeats(newSeats);
            setAudience(audienceData || []);
        };

        fetchRoomData();

        const channel = supabase.channel(`room_data_${activeRoom.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'room_seats', filter: `room_id=eq.${activeRoom.id}` }, fetchRoomData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'room_audience', filter: `room_id=eq.${activeRoom.id}` }, fetchRoomData)
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'active_rooms', filter: `id=eq.${activeRoom.id}` }, () => setActiveRoom(null))
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [activeRoom]);

    const mySeat = seats.find(s => s && s.user_id === currentUserId);
    const mySeatIndex = mySeat ? mySeat.seat_index : null;
    const isMutedByHost = mySeat ? mySeat.is_muted_by_host : false;
    const isHost = activeRoom && activeRoom.host_id === currentUserId;
    const totalParticipants = seats.filter(s => s && s.user_id).length + audience.length;

    const { remoteStreams } = useVoiceRoomAudio(supabase, activeRoom?.id, mySeatIndex, currentUserId, isMutedByHost, isLocalMuted);

    useEffect(() => {
        Object.entries(remoteStreams).forEach(([peerId, stream]) => {
            const audioEl = document.getElementById(`audio-${peerId}`);
            if (audioEl && audioEl.srcObject !== stream) {
                audioEl.srcObject = stream;
            }
        });
    }, [remoteStreams]);

    const handleCreateRoom = async () => {
        const { data, error } = await supabase.from('active_rooms').insert({
            room_name: 'NEET Physics Doubt Session',
            host_id: currentUserId
        }).select().single();

        if (data) {
            const initialSeats = [0, 1, 2, 3].map(i => ({
                room_id: data.id,
                seat_index: i,
                user_id: i === 0 ? currentUserId : null
            }));
            await supabase.from('room_seats').insert(initialSeats);
            setActiveRoom(data);
        }
    };

    const joinRoomBy5Digit = async (roomId5Digit) => {
        const { data: room } = await supabase.from('active_rooms').select('*').eq('room_id_5_digit', roomId5Digit).single();
        if (!room) {
            alert('Room not found');
            return;
        }

        const { error } = await supabase.from('room_audience').insert({
            room_id: room.id,
            user_id: currentUserId
        });

        if (error) {
            if (error.message.includes('full capacity')) {
                alert("Room is Full! Please join another room or create your own.");
            } else if (error.code === '23505') {
                setActiveRoom(room);
                setShowJoinModal(false);
            } else {
                alert("Error joining room: " + error.message);
            }
        } else {
            setActiveRoom(room);
            setShowJoinModal(false);
        }
    };

    const handleExitRoom = async () => {
        if (!activeRoom) return;
        if (mySeatIndex !== null) {
            await supabase.from('room_seats').update({ user_id: null, is_muted_by_host: false }).eq('room_id', activeRoom.id).eq('seat_index', mySeatIndex);
        } else {
            await supabase.from('room_audience').delete().eq('room_id', activeRoom.id).eq('user_id', currentUserId);
        }
        if (isHost) {
            const nextHostSeat = seats.find(s => s && s.user_id && s.user_id !== currentUserId);
            if (nextHostSeat) {
                await supabase.from('active_rooms').update({ host_id: nextHostSeat.user_id }).eq('id', activeRoom.id);
            } else {
                await supabase.from('active_rooms').delete().eq('id', activeRoom.id);
            }
        }
        setActiveRoom(null);
    };

    const takeSeat = async (index) => {
        // Optimistic UI Update (Zero lag)
        setSeats(prev => prev.map((s, i) => i === index ? { ...s, user_id: currentUserId } : (s?.user_id === currentUserId ? { ...s, user_id: null } : s)));
        setAudience(prev => prev.filter(u => u.user_id !== currentUserId));
        setIsLocalMuted(true);
        
        const { error } = await supabase.rpc('move_to_seat', { 
            p_room_id: activeRoom.id, 
            p_seat_index: index, 
            p_user_id: currentUserId,
            p_user_name: tgUser?.first_name || tgUser?.username || "Student",
            p_photo_url: tgUser?.photo_url || ""
        });
        if (error) {
            alert("Failed to take seat: " + error.message);
            // Refresh to restore correct state
            const { data: seatData } = await supabase.from('room_seats').select('*').eq('room_id', activeRoom.id);
            if (seatData) setSeats([null, null, null, null].map((_, i) => seatData.find(s => s.seat_index === i) || null));
        }
    };

    const moveToAudience = async (userIdToMove, seatIndex) => {
        await supabase.from('room_seats').update({ user_id: null, is_muted_by_host: false }).eq('room_id', activeRoom.id).eq('seat_index', seatIndex);
        try { await supabase.from('room_audience').insert({ room_id: activeRoom.id, user_id: userIdToMove }); } catch(e) {}
    };

    const toggleSeatLock = async (index, currentLocked) => {
        await supabase.from('room_seats').update({ is_locked: !currentLocked }).eq('room_id', activeRoom.id).eq('seat_index', index);
    };

    const toggleSeatMuteByHost = async (index, currentMuted) => {
        await supabase.from('room_seats').update({ is_muted_by_host: !currentMuted }).eq('room_id', activeRoom.id).eq('seat_index', index);
    };

    if (!activeRoom) {
        return (
            <div className="p-6 text-center space-y-4">
                <h2 className="text-2xl font-bold">VC Rooms</h2>
                <button onClick={handleCreateRoom} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Create Room</button>
                <button onClick={() => setShowJoinModal(true)} className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-bold">Join by ID</button>

                {showJoinModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                        <div className="bg-white p-6 rounded-2xl w-full max-w-sm text-black">
                            <h3 className="text-lg font-bold mb-4">Enter 5-digit Room ID</h3>
                            <input type="number" value={joinRoomId} onChange={e => setJoinRoomId(e.target.value)} className="w-full border p-3 rounded-lg mb-4" />
                            <div className="flex gap-2">
                                <button onClick={() => setShowJoinModal(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">Cancel</button>
                                <button onClick={() => joinRoomBy5Digit(joinRoomId)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Join</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white relative">
            {Object.keys(remoteStreams).map(peerId => (
                <audio key={peerId} id={`audio-${peerId}`} autoPlay />
            ))}
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
                <div>
                    <h2 className="font-bold text-lg">{activeRoom.room_name}</h2>
                    <p className="text-xs text-gray-400">ID: {activeRoom.room_id_5_digit} • {totalParticipants} / 12</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowJoinModal(true)} className="bg-gray-800 p-2 rounded-lg"><i className="fa-solid fa-search"></i></button>
                    <button onClick={handleExitRoom} className="bg-red-500/20 text-red-500 px-4 py-2 rounded-lg font-bold text-sm">Exit</button>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-6 p-8 justify-items-center">
                {seats.map((seat, idx) => {
                    const isOccupied = seat && seat.user_id;
                    const isLocked = seat && seat.is_locked;
                    const isHostSeat = idx === 0;
                    return (
                        <div key={idx} className="flex flex-col items-center gap-2 relative">
                            {isOccupied ? (
                                <div className="relative cursor-pointer" onClick={() => { if (seat.user_id === currentUserId) { if (confirm("Move to Audience?")) moveToAudience(currentUserId, idx); } else if (isHost) { const action = prompt("1. Mute/Unmute Mic\n2. Boot to Audience\nEnter 1 or 2:"); if (action === '1') toggleSeatMuteByHost(idx, seat.is_muted_by_host); if (action === '2') moveToAudience(seat.user_id, idx); } }}>
                                    <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-2xl font-bold bg-blue-600 ${isHostSeat ? 'border-yellow-400' : 'border-blue-400'}`}>{seat.user_id.substring(0, 2)}</div>
                                    {isHostSeat && <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] px-2 py-0.5 rounded-full font-bold">Host</span>}
                                    {seat.is_muted_by_host && <div className="absolute -bottom-1 -right-1 bg-red-600 w-6 h-6 rounded-full flex items-center justify-center border-2 border-gray-900"><i className="fa-solid fa-microphone-slash text-[10px]"></i></div>}
                                </div>
                            ) : (
                                <div className={`w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer ${isLocked ? 'border-red-500 bg-red-500/10' : 'border-gray-500 bg-gray-800'}`} onClick={() => { if (isHost) { const action = prompt("1. Lock/Unlock\n2. Pre-mute Seat\nEnter 1 or 2:"); if (action === '1') toggleSeatLock(idx, isLocked); if (action === '2') toggleSeatMuteByHost(idx, seat ? seat.is_muted_by_host : false); } else if (!isLocked) { takeSeat(idx); } }}>
                                    <i className={`fa-solid ${isLocked ? 'fa-lock text-red-500' : 'fa-plus text-gray-400'} text-2xl`}></i>
                                </div>
                            )}
                            <span className="text-xs font-bold text-gray-400">{isOccupied ? `User ${seat.user_id.substring(0,4)}` : `Seat ${idx}`}</span>
                        </div>
                    );
                })}
            </div>
            <div className="flex-1 bg-gray-800 rounded-t-3xl p-6">
                <h3 className="font-bold mb-4">Audience ({audience.length})</h3>
                <div className="grid grid-cols-4 gap-4">
                    {audience.map(m => (
                        <div key={m.user_id} className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => { if (isHost) alert(`Invitation sent to ${m.user_id}`); }}>
                            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">{m.user_id.substring(0, 2)}</div>
                            <span className="text-[10px] text-gray-400 truncate w-full text-center">User {m.user_id.substring(0, 4)}</span>
                        </div>
                    ))}
                </div>
            </div>
            {mySeatIndex !== null && <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4"><button onClick={() => setIsLocalMuted(!isLocalMuted)} className={`w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-lg transition-colors ${isLocalMuted ? 'bg-red-500 text-white' : 'bg-white text-gray-900'}`}><i className={`fa-solid ${isLocalMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i></button></div>}
        </div>
    );
}