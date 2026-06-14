import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useVoiceRoom } from '../services/roomService';
import { useAudioAnalyser } from './useAudioAnalyser';
import { ProfileCardModal } from './ProfileCardModal';
import { PersonalChatSystem } from './PersonalChatSystem';
import { RoomChatContainer } from './RoomChatContainer';

export const VoiceRoomsTab = ({ tgUser }) => {
    const {
        activeRoom, roomParticipants, remoteUsers, isMuted, activeSpeakers, chatMessages,
        leaveRoom, toggleMute, sendChat, hostAction, isMinimized, setIsMinimized,
        availableRooms, takeSeat, leaveSeat, lockedSeats, mutedSeats, createRoom,
        updateRoomSettings, tgId, joinRoom, fetchAvailableRooms,
        sendFriendRequest, acceptFriendRequest, sendPrivateDM, dataConnectionsRef
    } = useVoiceRoom();

    const [vcSubTab, setVcSubTab] = useState('rooms'); // 'rooms' | 'chats'
    const [profileOverlayTarget, setProfileOverlayTarget] = useState(null);
    const [localRefresh, setLocalRefresh] = useState(0);
    const [localChatMessages, setLocalChatMessages] = useState([]);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [createRoomType, setCreateRoomType] = useState('temporary');
    const [dashboardFilter, setDashboardFilter] = useState('active');

    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [editRoomName, setEditRoomName] = useState('');
    const [editAnnouncement, setEditAnnouncement] = useState('');
    const [editDpUrl, setEditDpUrl] = useState('');

    const activeRoomRef = useRef(activeRoom);
    const leaveRoomRef = useRef(leaveRoom);
    useEffect(() => {
        activeRoomRef.current = activeRoom;
        leaveRoomRef.current = leaveRoom;
    }, [activeRoom, leaveRoom]);

    useEffect(() => {
        const handleUnload = () => { if (activeRoomRef.current) leaveRoomRef.current(); };
        window.addEventListener('beforeunload', handleUnload);
        return () => { window.removeEventListener('beforeunload', handleUnload); if (activeRoomRef.current) leaveRoomRef.current(); };
    }, []);

    // Feature 2: In-Memory Sorting Rules & Main-Seat Terminate Rule Hide
    const sortedActiveRooms = useMemo(() => {
        return availableRooms
            .filter(room => {
                const participantsList = room.room_participants || [];
                const totalParticipants = (room.seats_occupied || 0) + (room.audience_count || participantsList.length || 0);
                
                // Active Audience Retention & Terminate Condition
                if (totalParticipants === 0 && room.room_type === 'temporary') return false;
                
                // Main-Seat Terminate Rule Hide Condition
                const hostEmpty = !participantsList.some(p => p.seat_number === 0 && p.user_id !== null);
                if (hostEmpty && room.room_type === 'temporary') return false;

                return true;
            })
            .sort((a, b) => {
                const countA = (a.seats_occupied || 0) + (a.audience_count || a.room_participants?.length || 0);
                const countB = (b.seats_occupied || 0) + (b.audience_count || b.room_participants?.length || 0);
                
                const isAFull = countA >= 12;
                const isBFull = countB >= 12;

                if (isAFull && !isBFull) return 1;
                if (!isAFull && isBFull) return -1;
                
                return countB - countA;
            });
    }, [availableRooms, localRefresh]);

    // --- 1. ACTIVE ROOM LAYOUT (Inside Room) ---
    if (activeRoom && !isMinimized) {
        const isHost = String(activeRoom.host_user_id) === tgId;
        const myParticipant = roomParticipants.find(p => String(p.user_id) === String(tgId));
        const isAdmin = isHost || myParticipant?.is_admin;
        const WEPLAY_SEATS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

        const SeatNode = ({ seatNum, occupant, label, isLarge=false }) => {
            const isMe = occupant?.user_id === tgId;
            const remoteUser = remoteUsers.find(r => r.uid === occupant?.user_id);
            
            const mediaStream = useMemo(() => {
                const track = remoteUser?.audioTrack?.getMediaStreamTrack?.();
                if (track) return new MediaStream([track]);
                return null;
            }, [remoteUser]);

            const volume = useAudioAnalyser(mediaStream);
            const isSpeaking = volume > 0 || (occupant && activeSpeakers[occupant.user_id]);
            const isLocked = lockedSeats[seatNum];
            const isSeatMuted = mutedSeats[seatNum];
            
            return (
                <div onClick={() => {
                    if (occupant) { setProfileOverlayTarget(occupant); }
                    else {
                        if (isHost && seatNum !== 0) {
                            // Host empty seat logic (like unlocking) handled in profile overlay if we want, but WePlay shows direct options for empty seat
                        } else if (!isLocked) takeSeat(seatNum);
                    }
                }} className={`flex flex-col items-center gap-1 cursor-pointer transition-transform hover:scale-105 ${isLarge ? 'w-24' : 'w-16'}`}>
                    {occupant ? (
                        <div className="relative weplay-voice-ring w-full aspect-square flex items-center justify-center">
                            <div 
                                className="absolute inset-0 rounded-full border-[3px] border-[#00FFFF] pointer-events-none transition-all duration-75 ease-out"
                                style={{
                                    transform: `scale(${volume > 0 ? 1.05 + (volume / 100) * 0.15 : 1})`,
                                    opacity: volume > 0 ? 0.3 + (volume / 100) * 0.7 : 0,
                                    boxShadow: volume > 0 ? `0 0 ${10 + (volume / 100) * 20}px rgba(0,255,255,${0.3 + (volume / 100) * 0.7})` : 'none'
                                }}
                            ></div>
                            <div className={`relative z-10 rounded-full flex items-center justify-center font-bold border-2 transition-all bg-gradient-to-br from-[#00FFFF] to-blue-600 overflow-hidden ${isLarge ? 'w-20 h-20 text-2xl' : 'w-14 h-14 text-xl'} ${isSpeaking ? 'border-[#00FFFF] text-[#010B1C]' : 'border-transparent text-white'}`}>
                                {occupant.photo_url ? <img src={occupant.photo_url} alt="DP" className="w-full h-full object-cover" /> : occupant.user_name.charAt(0)}
                            </div>
                            {((isMe ? isMuted : remoteUser && !remoteUser.hasAudio) || isSeatMuted) && (
                                <div className="absolute -bottom-1 -right-1 bg-[#010B1C] rounded-full w-5 h-5 flex items-center justify-center border border-gray-600 z-20">
                                    <i className="fa-solid fa-microphone-slash text-[10px] text-red-400"></i>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="relative w-full aspect-square flex items-center justify-center">
                            <div className={`rounded-full border-2 border-dashed ${isLocked ? 'border-red-500/40 bg-red-500/10' : 'border-[#0AE0D0]/40 bg-[#021633] hover:bg-[#0AE0D0]/10'} flex items-center justify-center ${isLarge ? 'w-20 h-20 text-3xl' : 'w-14 h-14 text-xl'}`}>
                                <i className={`fa-solid ${isLocked ? 'fa-lock text-red-400/50' : 'fa-microphone-lines text-[#0AE0D0]/40'}`}></i>
                            </div>
                            {isSeatMuted && (
                                <div className="absolute -bottom-1 -right-1 bg-[#010B1C] rounded-full w-5 h-5 flex items-center justify-center border border-gray-600 z-10">
                                    <i className="fa-solid fa-microphone-slash text-[10px] text-red-400"></i>
                                </div>
                            )}
                        </div>
                    )}
                    <span className="text-[10px] text-center font-semibold text-[#E0F7FA] truncate w-full px-1 mt-1">{occupant ? (isMe ? "Me" : occupant.user_name) : (isLocked ? 'Locked' : label)}</span>
                </div>
            );
        };

        return (
            <div className="flex-1 flex flex-col relative z-10 bg-[#010B1C] min-h-screen">
                <div className="px-4 py-4 flex items-center justify-between border-b border-[#0AE0D0]/20 bg-[#010B1C]/90 backdrop-blur">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsMinimized(true)} className="text-[#00FFFF] text-xl px-2 hover:bg-white/10 rounded-lg transition-colors">
                            <i className="fa-solid fa-chevron-down"></i>
                        </button>
                        <div className="flex flex-col">
                            <h2 className="text-xl font-black text-[#E0F7FA] drop-shadow-[0_0_5px_rgba(0,255,255,0.3)] flex items-center">
                                {activeRoom.channel_name}
                                {isHost && activeRoom.room_type === 'advance' && (
                                    <button onClick={() => {
                                        setEditRoomName(activeRoom.channel_name || '');
                                        setEditAnnouncement(activeRoom.announcement || '');
                                        setEditDpUrl(activeRoom.room_dp_url || '');
                                        setShowSettingsModal(true);
                                    }} className="ml-2 text-[#0AE0D0] hover:text-white text-base transition-colors"><i className="fa-solid fa-gear"></i></button>
                                )}
                            </h2>
                            <p className="text-xs text-[#00FFFF] font-bold">
                                <span className="w-2 h-2 inline-block rounded-full bg-[#00FFFF] animate-pulse mr-1"></span> Live
                            </p>
                        </div>
                    </div>
                    <button onClick={leaveRoom} className="bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-[0_0_10px_rgba(255,0,0,0.2)] transition-colors">Leave</button>
                </div>

                {activeRoom.announcement && (
                    <div className="mx-6 mt-4 p-3 bg-[#021633]/80 rounded-xl border border-[#0AE0D0]/20 text-xs text-[#A4DFE6] shadow-lg backdrop-blur">
                        <i className="fa-solid fa-bullhorn text-[#00FFFF] mr-2 animate-pulse"></i>
                        {activeRoom.announcement}
                    </div>
                )}
                
                <div className="p-6 pb-2">
                    <div className="flex justify-center gap-8 mb-8">
                    {WEPLAY_SEATS.slice(0, 2).map(seatNum => {
                        if (seatNum === 1 && !activeRoom.is_partner_seat_open) return null;
                        const occupant = roomParticipants.find(p => p.seat_number === seatNum);
                        return <SeatNode key={seatNum} seatNum={seatNum} occupant={occupant} label={seatNum === 0 ? "Host" : "Partner"} isLarge={true} />;
                    })}
                    </div>
                    <div className="grid grid-cols-4 gap-y-6 gap-x-4 justify-items-center">
                    {WEPLAY_SEATS.slice(2).map(seatNum => {
                        const occupant = roomParticipants.find(p => p.seat_number === seatNum);
                        return <SeatNode key={seatNum} seatNum={seatNum} occupant={occupant} label={`Seat ${seatNum}`} />;
                    })}
                    </div>
                </div>

                <RoomChatContainer tgId={tgId} tgName={tgUser?.first_name} dataConnectionsRef={dataConnectionsRef} chatMessages={localChatMessages.length ? localChatMessages : chatMessages} setChatMessages={setLocalChatMessages} activeRoom={activeRoom} isHost={isHost} toggleMute={toggleMute} isMuted={isMuted} setProfileOverlayTarget={setProfileOverlayTarget} />

                {/* Profile Card Overlay replacing old Context Modal */}
                {profileOverlayTarget && (
                    <ProfileCardModal user={profileOverlayTarget} tgId={tgId} activeRoom={activeRoom} onClose={() => setProfileOverlayTarget(null)} sendFriendRequest={sendFriendRequest} setIsMinimized={setIsMinimized} setVcSubTab={setVcSubTab} leaveSeat={leaveSeat} toggleMute={toggleMute} isMuted={isMuted} hostAction={hostAction} mutedSeats={mutedSeats} />
                )}

                {showSettingsModal && (
                    <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                        <div className="bg-[#021633] rounded-3xl p-6 w-full max-w-sm border border-[#0AE0D0]/30 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                            <h3 className="text-xl font-black text-[#00FFFF] mb-4">Room Settings</h3>
                            <div className="mb-4">
                                <label className="text-xs text-[#A4DFE6] font-bold mb-1 block">Room Title</label>
                                <input value={editRoomName} onChange={e=>setEditRoomName(e.target.value)} className="w-full bg-[#010B1C] border border-[#0AE0D0]/30 rounded-xl px-3 py-2 text-white text-sm focus:border-[#00FFFF]" />
                            </div>
                            <div className="mb-4">
                                <label className="text-xs text-[#A4DFE6] font-bold mb-1 block">Display Picture URL</label>
                                <input value={editDpUrl} onChange={e=>setEditDpUrl(e.target.value)} placeholder="https://..." className="w-full bg-[#010B1C] border border-[#0AE0D0]/30 rounded-xl px-3 py-2 text-white text-sm focus:border-[#00FFFF]" />
                            </div>
                            <div className="mb-6">
                                <label className="text-xs text-[#A4DFE6] font-bold mb-1 block">Announcement</label>
                                <textarea value={editAnnouncement} onChange={e=>setEditAnnouncement(e.target.value)} rows="3" className="w-full bg-[#010B1C] border border-[#0AE0D0]/30 rounded-xl px-3 py-2 text-white text-sm focus:border-[#00FFFF]" />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowSettingsModal(false)} className="flex-1 p-3 bg-white/5 text-gray-400 rounded-xl font-bold border border-white/10">Cancel</button>
                                <button onClick={() => { updateRoomSettings({ channel_name: editRoomName, room_dp_url: editDpUrl, announcement: editAnnouncement }); setShowSettingsModal(false); }} className="flex-1 p-3 bg-[#00FFFF] text-[#010B1C] rounded-xl font-bold shadow-[0_0_10px_rgba(0,255,255,0.3)] text-black">Save Settings</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- 2. DISCOVERY DASHBOARD (Outside Room) ---
    const myAdvanceRoom = availableRooms.find(r => String(r.owner_id) === String(tgId) && (r.room_type === 'advance' || r.room_type === 'permanent'));

    return (
        <div className="pb-[80px] flex flex-col h-[calc(100vh_-_60px_-_env(safe-area-inset-top,_0px))] bg-[#010B1C] text-white relative">
            {/* Sub-tabs Header */}
            <div className="p-4 flex items-center justify-between border-b border-[#0AE0D0]/20 bg-[#021633]">
                <div className="flex gap-4">
                    <button onClick={() => setVcSubTab('rooms')} className={`text-lg font-black transition-all ${vcSubTab === 'rooms' ? 'text-[#00FFFF] drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]' : 'text-gray-500'}`}>Rooms</button>
                    <button onClick={() => setVcSubTab('chats')} className={`text-lg font-black transition-all ${vcSubTab === 'chats' ? 'text-[#00FFFF] drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]' : 'text-gray-500'}`}>Chats</button>
                </div>
                {vcSubTab === 'rooms' && (
                    <button onClick={() => { setLocalRefresh(r => r + 1); fetchAvailableRooms(); }} className="text-[#00FFFF] text-xl px-2 hover:bg-[#00FFFF]/10 rounded-lg transition-colors">
                        <i className="fa-solid fa-arrows-rotate"></i>
                    </button>
                )}
            </div>
            
            {vcSubTab === 'rooms' ? (
                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="mb-6">
                        {myAdvanceRoom ? (
                            <div onClick={() => joinRoom(myAdvanceRoom)} className="bg-gradient-to-br from-[#1a1c02] to-[#010B1C] rounded-2xl p-4 cursor-pointer relative overflow-hidden group transition-all border-2 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                                <span className="absolute top-0 right-0 bg-gradient-to-r from-[#D4AF37] to-[#F9D33A] text-[#010B1C] text-[9px] font-black px-2 py-1 rounded-bl-lg uppercase tracking-wider">My Advance Room</span>
                                <div className="relative z-10 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F9D33A] flex items-center justify-center font-bold text-[#010B1C] text-xl shadow-[0_0_10px_rgba(212,175,55,0.5)]">
                                            {myAdvanceRoom.channel_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-white mb-1 flex items-center gap-2">
                                                {myAdvanceRoom.channel_name} 
                                                {myAdvanceRoom.password && <i className="fa-solid fa-lock text-[#F9D33A] text-xs"></i>}
                                            </h3>
                                            <div className="flex text-sm text-[#F9D33A] gap-3">
                                                <span><i className="fa-solid fa-crown mr-1"></i> Host: You</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-[#010B1C] transition-colors">
                                        <i className="fa-solid fa-arrow-right"></i>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => { setCreateRoomType('advance'); setShowCreateModal(true); }} className="w-full bg-gradient-to-r from-[#D4AF37]/20 to-[#F9D33A]/10 hover:from-[#D4AF37]/30 hover:to-[#F9D33A]/20 border border-[#D4AF37]/50 border-dashed py-4 rounded-2xl font-bold transition-all text-sm uppercase tracking-wider text-[#F9D33A] flex flex-col items-center justify-center gap-2">
                                <i className="fa-solid fa-crown text-2xl drop-shadow-[0_0_8px_rgba(249,211,58,0.5)]"></i>
                                Create Premium Advance Room
                            </button>
                        )}
                    </div>

                    <div className="flex gap-2 mb-6 bg-[#021633] p-1.5 rounded-xl border border-[#0AE0D0]/20">
                        <button onClick={() => setDashboardFilter('active')} className={`flex-1 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${dashboardFilter === 'active' ? 'bg-[#00FFFF] text-[#010B1C] shadow-[0_0_10px_rgba(0,255,255,0.3)]' : 'text-[#A4DFE6] hover:text-white hover:bg-white/5'}`}>
                            Active
                        </button>
                        <button onClick={() => setDashboardFilter('recent')} className={`flex-1 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${dashboardFilter === 'recent' ? 'bg-[#00FFFF] text-[#010B1C] shadow-[0_0_10px_rgba(0,255,255,0.3)]' : 'text-[#A4DFE6] hover:text-white hover:bg-white/5'}`}>
                            Recent
                        </button>
                    </div>
                    
                    <div className="space-y-4 pb-20">
                        {sortedActiveRooms.length > 0 ? sortedActiveRooms.map(room => {
                            const isPremium = room.room_type === 'permanent' || room.room_type === 'advance';
                            const totalCapacity = (room.seats_occupied || 0) + (room.audience_count || room.room_participants?.length || 0);
                            // Capacity Badge Feature 2
                            return (
                                <div key={room.id} onClick={() => joinRoom(room)} className={`bg-[#021633] rounded-2xl p-4 cursor-pointer relative overflow-hidden group transition-all ${isPremium ? 'border-2 border-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.2)]' : 'border border-[#0AE0D0]/30 hover:border-[#00FFFF] hover:shadow-[0_0_10px_rgba(0,255,255,0.3)]'}`}>
                                    {isPremium && <span className="absolute top-0 right-0 bg-[#00FFFF] text-[#010B1C] text-[9px] font-black px-2 py-1 rounded-bl-lg uppercase tracking-wider">ADVANCED LOUNGE</span>}
                                    <div className="relative z-10 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00FFFF] to-blue-600 flex items-center justify-center font-bold text-[#010B1C] text-xl shadow-[0_0_10px_rgba(0,255,255,0.5)]">
                                                {room.channel_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-white mb-1 flex items-center gap-2">
                                                    {room.channel_name} 
                                                    {room.password && <i className="fa-solid fa-lock text-[#00FFFF] text-xs"></i>}
                                                </h3>
                                                <div className="flex text-sm text-[#A4DFE6] gap-3">
                                                    <span><i className={`fa-solid fa-crown ${isPremium ? 'text-[#F9D33A]' : 'text-[#00FFFF]'} mr-1`}></i> Host: {String(room.host_user_id).substring(0,5)}</span>
                                                    <span><i className="fa-solid fa-users mr-1 text-[#00FFFF]"></i> {totalCapacity}/12</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-[#00FFFF]/10 text-[#00FFFF] flex items-center justify-center group-hover:bg-[#00FFFF] group-hover:text-[#010B1C] transition-colors">
                                            <i className="fa-solid fa-arrow-right"></i>
                                        </div>
                                    </div>
                                </div>
                            )
                        }) : (
                            <div className="text-center py-10 text-gray-500">
                                <i className="fa-solid fa-folder-open text-4xl mb-3 opacity-50"></i>
                                <p>No rooms found for this filter.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <PersonalChatSystem tgId={tgId} sendPrivateDM={sendPrivateDM} acceptFriendRequest={acceptFriendRequest} dataConnectionsRef={dataConnectionsRef} />
            )}

            {showCreateModal && (
                <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-[#021633] rounded-3xl p-6 w-full max-w-sm border border-[#0AE0D0]/30 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                        <h3 className="text-2xl font-black text-[#00FFFF] mb-4 drop-shadow-[0_0_5px_rgba(0,255,255,0.4)]">{createRoomType === 'advance' ? 'Create Premium Lounge' : 'Create Voice Lounge'}</h3>
                        <div className="flex gap-2 mb-5">
                            <button onClick={() => setCreateRoomType('temporary')} className={`flex-1 py-2 text-xs font-bold rounded-lg border ${createRoomType === 'temporary' ? 'bg-[#00FFFF]/20 border-[#00FFFF] text-[#00FFFF]' : 'border-transparent text-gray-400 bg-white/5'}`}>Temporary Room</button>
                            <button onClick={() => setCreateRoomType('advance')} className={`flex-1 py-2 text-xs font-bold rounded-lg border ${createRoomType === 'advance' ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-gray-400 bg-white/5'}`}>Advance Room</button>
                        </div>
                        <div className="mb-6">
                            <label className="text-xs text-[#A4DFE6] font-bold mb-2 block uppercase tracking-wider">Room Name</label>
                            <input value={newRoomName} onChange={e=>setNewRoomName(e.target.value)} className="w-full bg-[#010B1C] border border-[#0AE0D0]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00FFFF] focus:shadow-[0_0_10px_rgba(0,255,255,0.2)] transition-all placeholder:text-[#0AE0D0]/30" placeholder="e.g. Chill Beats & Chat" />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowCreateModal(false)} className="flex-1 p-3.5 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl font-bold transition-colors border border-white/10">Cancel</button>
                            <button onClick={async () => { if(newRoomName.trim()){ await createRoom(newRoomName, createRoomType); setShowCreateModal(false); setNewRoomName(''); } }} className="flex-1 p-3.5 bg-gradient-to-r from-[#00A7A7] to-[#00FFFF] text-[#010B1C] rounded-xl font-bold shadow-[0_0_15px_rgba(0,255,255,0.4)] hover:scale-105 transition-transform uppercase tracking-wider">Go Live</button>
                        </div>
                    </div>
                </div>
            )}

            {activeRoom && isMinimized && (
                <div className="absolute bottom-[20px] left-4 right-4 bg-[#010B1C] border border-[#00FFFF]/50 rounded-2xl p-3 shadow-[0_10px_30px_rgba(0,0,0,0.8),_0_0_15px_rgba(0,255,255,0.2)] flex items-center gap-3 z-40 cursor-pointer hover:border-[#00FFFF] transition-colors group" onClick={() => setIsMinimized(false)}>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00FFFF] to-blue-600 flex items-center justify-center relative shadow-[0_0_10px_rgba(0,255,255,0.5)]">
                        <i className="fa-solid fa-music text-[#010B1C] animate-pulse text-lg"></i>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <h4 className="font-bold text-[#00FFFF] truncate text-base group-hover:drop-shadow-[0_0_5px_rgba(0,255,255,0.5)] transition-all">{activeRoom.channel_name}</h4>
                        <p className="text-xs text-[#A4DFE6] truncate">Tap to return to room</p>
                    </div>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <button onClick={toggleMute} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-[#021633] text-gray-400 border border-gray-600 hover:text-white' : 'bg-[#00FFFF] text-[#010B1C] shadow-[0_0_10px_rgba(0,255,255,0.5)]'}`}>
                            <i className={`fa-solid ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
                        </button>
                        <button onClick={() => { leaveRoom(); setIsMinimized(false); }} className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white transition-colors">
                            <i className="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};