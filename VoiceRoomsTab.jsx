// LAYER 4: PREMIUM INTERFACE 
import React, { useState, useEffect } from 'react';
import { useVoiceRoom } from '../services/roomService';

export const VoiceRoomsTab = ({ tgUser }) => {
    const { activeRoom, participants, remoteUsers, isMuted, activeSpeakers, chatMessages, leaveRoom, toggleMute, sendChat, hostAction, isMinimized, setIsMinimized, availableRooms, takeSeat, leaveSeat, lockedSeats, mutedSeats, createRoom, tgId, joinRoom } = useVoiceRoom();
    const [chatInput, setChatInput] = useState('');
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');

    // Strict WePlay-style Graceful Teardown on unmount
    const activeRoomRef = useRef(activeRoom);
    const leaveRoomRef = useRef(leaveRoom);
    useEffect(() => {
        activeRoomRef.current = activeRoom;
        leaveRoomRef.current = leaveRoom;
    }, [activeRoom, leaveRoom]);

    useEffect(() => {
        const handleUnload = () => {
            if (activeRoomRef.current) leaveRoomRef.current();
        };
        window.addEventListener('beforeunload', handleUnload);
        return () => {
            window.removeEventListener('beforeunload', handleUnload);
            if (activeRoomRef.current) leaveRoomRef.current();
        };
    }, []);

    // --- 1. ACTIVE ROOM LAYOUT (Inside Room) ---
    if (activeRoom && !isMinimized) {
        const isHost = String(activeRoom.host_user_id) === tgId;
        const hostSeat = participants.find(p => p.seat_number === 0);
        const partnerSeat = participants.find(p => p.seat_number === 1);
        const micSeats = Array.from({length: 8}, (_, i) => participants.find(p => p.seat_number === i + 2) || null);

        const renderSeat = (seatNum, occupant, label, isLarge=false) => {
            const isMe = occupant?.user_id === tgId;
            const speaking = occupant && activeSpeakers[occupant.user_id];
            const isLocked = lockedSeats[seatNum];
            const isSeatMuted = mutedSeats[seatNum];
            
            return (
                <div onClick={() => setSelectedSeat({ seatNum, occupant })} className={`flex flex-col items-center gap-1 cursor-pointer transition-transform hover:scale-105 ${isLarge ? 'w-24' : 'w-16'}`}>
                    {occupant ? (
                        <div className="relative">
                            <div className={`rounded-full flex items-center justify-center font-bold border-2 transition-all bg-gradient-to-br from-[#00FFFF] to-blue-600 overflow-hidden ${isLarge ? 'w-20 h-20 text-2xl' : 'w-14 h-14 text-xl'} ${speaking ? 'border-[#00FFFF] shadow-[0_0_20px_rgba(0,255,255,0.8)] scale-110 text-[#010B1C]' : 'border-transparent text-white'}`}>
                                {occupant.photo_url ? <img src={occupant.photo_url} alt="DP" className="w-full h-full object-cover" /> : occupant.user_name.charAt(0)}
                            </div>
                            {((isMe ? isMuted : remoteUsers.find(r=>r.uid===occupant.user_id) && !remoteUsers.find(r=>r.uid===occupant.user_id).hasAudio) || isSeatMuted) && (
                                <div className="absolute -bottom-1 -right-1 bg-[#010B1C] rounded-full w-5 h-5 flex items-center justify-center border border-gray-600 z-10">
                                    <i className="fa-solid fa-microphone-slash text-[10px] text-red-400"></i>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="relative">
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
                    <span className="text-[10px] text-center font-semibold text-[#E0F7FA] truncate w-full px-1">{occupant ? (isMe ? "Me" : occupant.user_name) : (isLocked ? 'Locked' : label)}</span>
                </div>
            );
        };

        return (
            <div className="flex-1 flex flex-col relative z-10 bg-[#010B1C] min-h-screen">
                {/* Header */}
                <div className="px-4 py-4 flex items-center justify-between border-b border-[#0AE0D0]/20 bg-[#010B1C]/90 backdrop-blur">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsMinimized(true)} className="text-[#00FFFF] text-xl px-2 hover:bg-white/10 rounded-lg transition-colors">
                            <i className="fa-solid fa-chevron-down"></i>
                        </button>
                        <div className="flex flex-col">
                            <h2 className="text-xl font-black text-[#E0F7FA] drop-shadow-[0_0_5px_rgba(0,255,255,0.3)]">{activeRoom.channel_name}</h2>
                            <p className="text-xs text-[#00FFFF] font-bold">
                                <span className="w-2 h-2 inline-block rounded-full bg-[#00FFFF] animate-pulse mr-1"></span> Live
                            </p>
                        </div>
                    </div>
                    <button onClick={leaveRoom} className="bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-[0_0_10px_rgba(255,0,0,0.2)] transition-colors">Leave</button>
                </div>
                
                {/* Spatial Seating Canvas */}
                <div className="p-6 pb-2">
                    {/* Upper Deck (Host & Partner) */}
                    <div className="flex justify-center gap-8 mb-8">
                        {renderSeat(0, hostSeat, "Host", true)}
                        {activeRoom.is_partner_seat_open && renderSeat(1, partnerSeat, "Partner", true)}
                    </div>
                    {/* Lower Deck (Seats 2-9) */}
                    <div className="grid grid-cols-4 gap-y-6 gap-x-4 justify-items-center">
                        {micSeats.map((occupant, i) => <React.Fragment key={i}>{renderSeat(i+2, occupant, `Seat ${i+2}`)}</React.Fragment>)}
                    </div>
                </div>

                {/* Ephemeral Live Chat Panel */}
                <div className="flex-1 bg-gradient-to-t from-[#021633] to-transparent p-4 flex flex-col justify-end overflow-hidden">
                    <div className="max-h-[180px] overflow-y-auto no-scrollbar space-y-2 mb-4">
                        {chatMessages.map((msg, idx) => (
                            <div key={idx} className="bg-[#010B1C]/80 backdrop-blur border border-[#0AE0D0]/20 rounded-xl px-3 py-2 text-sm w-fit max-w-[85%]">
                                <span className="font-bold text-[#A4DFE6] mr-2">{msg.userName}:</span>
                                <span className="text-white">{msg.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Bar */}
                <div className="w-full bg-[#010B1C]/95 backdrop-blur border-t border-[#0AE0D0]/30 p-3 flex gap-2 items-center z-20 pb-[env(safe-area-inset-bottom,_12px)]">
                    <input 
                        value={chatInput} onChange={e=>setChatInput(e.target.value)} 
                        placeholder="Say hi..." 
                        className="flex-1 bg-[#021633] border border-[#0AE0D0]/30 rounded-full px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00FFFF]"
                        onKeyDown={(e) => { if(e.key==='Enter') { sendChat(chatInput); setChatInput(''); } }}
                    />
                    <button onClick={toggleMute} className={`w-11 h-11 rounded-full flex items-center justify-center text-lg transition-all shadow-lg border-2 shrink-0 ${isMuted ? 'bg-[#021633] text-gray-400 border-gray-600' : 'bg-[#00FFFF] text-[#010B1C] border-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.6)]'}`}>
                        <i className={`fa-solid ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
                    </button>
                </div>

                {/* Seat Context Modal */}
                {selectedSeat && (
                    <div className="absolute inset-0 z-50 bg-black/60 flex flex-col justify-end" onClick={() => setSelectedSeat(null)}>
                        <div className="bg-[#021633] rounded-t-3xl p-6 border-t border-[#0AE0D0]/30 shadow-[0_-10px_30px_rgba(0,255,255,0.1)]" onClick={e => e.stopPropagation()}>
                            <h3 className="text-xl font-bold text-white mb-4">Seat {selectedSeat.seatNum}</h3>
                            <div className="flex flex-col gap-3">
                                {selectedSeat.occupant ? (
                                    selectedSeat.occupant.user_id === tgId ? (
                                        <button onClick={() => { leaveSeat(); setSelectedSeat(null); }} className="p-3 bg-red-500/20 text-red-400 rounded-xl font-bold border border-red-500/30">Move to Audience</button>
                                    ) : isHost ? (
                                        <>
                                            <button onClick={() => { hostAction('force_mute', selectedSeat.occupant.user_id); setSelectedSeat(null); }} className="p-3 bg-white/5 text-white hover:bg-white/10 rounded-xl font-bold border border-white/10">Mute User's Mic</button>
                                            <button onClick={() => { hostAction('seat_mute', null, { seatNumber: selectedSeat.seatNum, isMuted: !mutedSeats[selectedSeat.seatNum] }); setSelectedSeat(null); }} className={`p-3 rounded-xl font-bold border ${mutedSeats[selectedSeat.seatNum] ? 'bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white border-green-500/30' : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white border-orange-500/30'}`}>
                                                {mutedSeats[selectedSeat.seatNum] ? "Unmute Seat" : "Mute Seat"}
                                            </button>
                                            <button onClick={() => { hostAction('kick', selectedSeat.occupant.user_id); setSelectedSeat(null); }} className="p-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl font-bold border border-red-500/30">Kick from Room</button>
                                            <button onClick={() => { hostAction('assign_mod', selectedSeat.occupant.user_id); setSelectedSeat(null); }} className="p-3 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-xl font-bold border border-blue-500/30">Assign Admin/Mod</button>
                                        </>
                                    ) : null
                                ) : (
                                    <>
                                        <button onClick={() => { takeSeat(selectedSeat.seatNum); setSelectedSeat(null); }} className="p-3 bg-gradient-to-r from-[#00A7A7] to-[#00FFFF] text-[#010B1C] rounded-xl font-bold shadow-[0_0_15px_rgba(0,255,255,0.4)]">Take Mic Seat</button>
                                        {isHost && (
                                            <>
                                                <button onClick={() => { hostAction('seat_mute', null, { seatNumber: selectedSeat.seatNum, isMuted: !mutedSeats[selectedSeat.seatNum] }); setSelectedSeat(null); }} className={`p-3 rounded-xl font-bold border ${mutedSeats[selectedSeat.seatNum] ? 'bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white border-green-500/30' : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white border-orange-500/30'}`}>
                                                    {mutedSeats[selectedSeat.seatNum] ? "Unmute Seat" : "Mute Seat"}
                                                </button>
                                                <button onClick={() => { hostAction('seat_lock', null, { seatNumber: selectedSeat.seatNum, isLocked: !lockedSeats[selectedSeat.seatNum] }); setSelectedSeat(null); }} className="p-3 bg-white/5 text-white hover:bg-white/10 rounded-xl font-bold border border-white/10">{lockedSeats[selectedSeat.seatNum] ? "Unlock Seat" : "Lock Seat"}</button>
                                            </>
                                        )}
                                    </>
                                )}
                                <button onClick={() => setSelectedSeat(null)} className="p-3 bg-transparent text-gray-400 rounded-xl font-bold mt-2">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- 2. DISCOVERY DASHBOARD (Outside Room) ---
    return (
        <div className="pb-[80px] flex flex-col h-[calc(100vh_-_60px_-_env(safe-area-inset-top,_0px))] bg-[#010B1C] text-white relative">
            <div className="p-4 flex-1 overflow-y-auto">
                <h2 className="text-2xl font-black mb-1 text-[#00FFFF] drop-shadow-[0_0_8px_rgba(0,255,255,0.4)] tracking-wide">Voice Lounges</h2>
                <p className="text-xs text-[#A4DFE6] mb-5">Join active voice rooms to discuss and study live.</p>
                
                <div className="flex gap-2 mb-6">
                    <button onClick={() => setShowCreateModal(true)} className="flex-1 bg-white/5 hover:bg-white/10 border border-[#0AE0D0]/30 py-3 rounded-xl font-bold transition-all text-[11px] uppercase tracking-wider">
                        + Create Temp (Free)
                    </button>
                    <button className="flex-1 bg-gradient-to-r from-[#00A7A7] to-[#00FFFF] text-[#010B1C] shadow-[0_0_15px_rgba(0,255,255,0.4)] py-3 rounded-xl font-bold transition-all text-[11px] uppercase tracking-wider">
                        <i className="fa-solid fa-crown mr-1"></i> Unlock Advanced
                    </button>
                </div>

                <div className="space-y-4 pb-20">
                    {availableRooms.map(room => {
                        const isPremium = room.room_type === 'permanent';
                        const listenerCount = room.room_participants?.[0]?.count || room.room_participants?.length || 0;
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
                                                <span><i className={`fa-solid fa-crown ${isPremium ? 'text-[#F9D33A]' : 'text-[#00FFFF]'} mr-1`}></i> Host: {room.host_user_id.substring(0,5)}</span>
                                                <span><i className="fa-solid fa-headphones mr-1 text-[#00FFFF]"></i> {listenerCount} Listens</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-[#00FFFF]/10 text-[#00FFFF] flex items-center justify-center group-hover:bg-[#00FFFF] group-hover:text-[#010B1C] transition-colors">
                                        <i className="fa-solid fa-arrow-right"></i>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Room Creation Modal */}
            {showCreateModal && (
                <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-[#021633] rounded-3xl p-6 w-full max-w-sm border border-[#0AE0D0]/30 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                        <h3 className="text-2xl font-black text-[#00FFFF] mb-4 drop-shadow-[0_0_5px_rgba(0,255,255,0.4)]">Create Voice Lounge</h3>
                        <div className="mb-6">
                            <label className="text-xs text-[#A4DFE6] font-bold mb-2 block uppercase tracking-wider">Room Name</label>
                            <input value={newRoomName} onChange={e=>setNewRoomName(e.target.value)} className="w-full bg-[#010B1C] border border-[#0AE0D0]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00FFFF] focus:shadow-[0_0_10px_rgba(0,255,255,0.2)] transition-all placeholder:text-[#0AE0D0]/30" placeholder="e.g. Chill Beats & Chat" />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowCreateModal(false)} className="flex-1 p-3.5 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl font-bold transition-colors border border-white/10">Cancel</button>
                            <button onClick={async () => { if(newRoomName.trim()){ await createRoom(newRoomName); setShowCreateModal(false); setNewRoomName(''); } }} className="flex-1 p-3.5 bg-gradient-to-r from-[#00A7A7] to-[#00FFFF] text-[#010B1C] rounded-xl font-bold shadow-[0_0_15px_rgba(0,255,255,0.4)] hover:scale-105 transition-transform uppercase tracking-wider">Go Live</button>
                        </div>
                    </div>
                </div>
            )}

            {/* FLOATING MINI-PLAYER */}
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