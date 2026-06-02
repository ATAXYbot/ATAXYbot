// LAYER 4: PREMIUM INTERFACE 
import React, { useState } from 'react';
import { useVoiceRoom } from '../services/roomService';

export const VoiceRoomsTab = ({ tgUser }) => {
    const { activeRoom, participants, remoteUsers, isMuted, activeSpeakers, chatMessages, leaveRoom, toggleMute, sendChat, hostAction } = useVoiceRoom();
    const [chatInput, setChatInput] = useState('');

    // --- 1. ACTIVE ROOM LAYOUT (Inside Room) ---
    if (activeRoom) {
        const isHost = String(activeRoom.host_user_id) === String(tgUser.id);
        const hostSeat = participants.find(p => p.seat_number === 0);
        const partnerSeat = participants.find(p => p.seat_number === 1);
        const micSeats = Array.from({length: 8}, (_, i) => participants.find(p => p.seat_number === i + 2) || null);

        const renderSeat = (seatNum, occupant, label, isLarge=false) => {
            const isMe = occupant?.user_id === String(tgUser.id);
            const speaking = occupant && activeSpeakers[occupant.user_id];
            
            return (
                <div className={`flex flex-col items-center gap-1 cursor-pointer transition-transform hover:scale-105 ${isLarge ? 'w-24' : 'w-16'}`}>
                    {occupant ? (
                        <div className="relative">
                            <div className={`rounded-full flex items-center justify-center font-bold border-2 transition-all bg-gradient-to-br from-[#00FFFF] to-blue-600 ${isLarge ? 'w-20 h-20 text-2xl' : 'w-14 h-14 text-xl'} ${speaking ? 'border-[#00FFFF] shadow-[0_0_20px_rgba(0,255,255,0.8)] scale-110 text-[#010B1C]' : 'border-transparent text-white'}`}>
                                {occupant.user_name.charAt(0)}
                            </div>
                            {(isMe ? isMuted : remoteUsers.find(r=>r.uid===occupant.user_id) && !remoteUsers.find(r=>r.uid===occupant.user_id).hasAudio) && (
                                <div className="absolute -bottom-1 -right-1 bg-[#010B1C] rounded-full w-5 h-5 flex items-center justify-center border border-gray-600">
                                    <i className="fa-solid fa-microphone-slash text-[10px] text-red-400"></i>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={`rounded-full border-2 border-dashed border-[#0AE0D0]/40 flex items-center justify-center bg-[#021633] ${isLarge ? 'w-20 h-20 text-3xl' : 'w-14 h-14 text-xl'} hover:bg-[#0AE0D0]/10`}>
                            <i className="fa-solid fa-microphone-lines text-[#0AE0D0]/40"></i>
                        </div>
                    )}
                    <span className="text-[10px] text-center font-semibold text-[#E0F7FA] truncate w-full px-1">{occupant ? (isMe ? "Me" : occupant.user_name) : label}</span>
                </div>
            );
        };

        return (
            <div className="flex-1 flex flex-col relative z-10 bg-[#010B1C] min-h-screen">
                {/* Header */}
                <div className="px-4 py-4 flex items-center justify-between border-b border-[#0AE0D0]/20 bg-[#010B1C]/90 backdrop-blur">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black text-[#E0F7FA] drop-shadow-[0_0_5px_rgba(0,255,255,0.3)]">{activeRoom.channel_name}</h2>
                        <p className="text-xs text-[#00FFFF] font-bold">
                            <span className="w-2 h-2 inline-block rounded-full bg-[#00FFFF] animate-pulse mr-1"></span> Live
                        </p>
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
            </div>
        );
    }

    // --- 2. DISCOVERY DASHBOARD (Outside Room) ---
    // Note: availableRooms array sorting and querying would be handled in the Context or Parent.
    // For modularity, assuming `availableRooms` is passed via props or context hook.
    const { availableRooms = [] } = useVoiceRoom(); 

    return (
        <div className="pb-[80px] flex flex-col h-[calc(100vh_-_60px_-_env(safe-area-inset-top,_0px))] bg-[#010B1C] text-white">
            <div className="p-4 flex-1 overflow-y-auto">
                <h2 className="text-2xl font-black mb-1 text-[#00FFFF] drop-shadow-[0_0_8px_rgba(0,255,255,0.4)] tracking-wide">Voice Lounges</h2>
                <p className="text-xs text-[#A4DFE6] mb-5">Join active voice rooms to discuss and study live.</p>
                
                <div className="flex gap-2 mb-6">
                    <button className="flex-1 bg-white/5 hover:bg-white/10 border border-[#0AE0D0]/30 py-3 rounded-xl font-bold transition-all text-[11px] uppercase tracking-wider">
                        + Create Temp (Free)
                    </button>
                    <button className="flex-1 bg-gradient-to-r from-[#00A7A7] to-[#00FFFF] text-[#010B1C] shadow-[0_0_15px_rgba(0,255,255,0.4)] py-3 rounded-xl font-bold transition-all text-[11px] uppercase tracking-wider">
                        <i className="fa-solid fa-crown mr-1"></i> Unlock Advanced
                    </button>
                </div>

                <div className="space-y-4 pb-20">
                    {availableRooms.map(room => {
                        const isPremium = room.room_type === 'permanent';
                        return (
                            <div key={room.id} className={`bg-[#021633] rounded-2xl p-4 cursor-pointer relative overflow-hidden group transition-all ${isPremium ? 'border-2 border-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.2)]' : 'border border-[#0AE0D0]/30 hover:border-[#00FFFF]'}`}>
                                {isPremium && <span className="absolute top-0 right-0 bg-[#00FFFF] text-[#010B1C] text-[9px] font-black px-2 py-1 rounded-bl-lg uppercase tracking-wider">ADVANCED LOUNGE</span>}
                                <div className="relative z-10 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg text-white mb-1 flex items-center gap-2">
                                            {room.channel_name} 
                                            {room.password && <i className="fa-solid fa-lock text-[#00FFFF] text-xs"></i>}
                                        </h3>
                                        <div className="flex text-sm text-[#A4DFE6]">
                                            <span><i className={`fa-solid fa-crown ${isPremium ? 'text-[#F9D33A]' : 'text-[#00FFFF]'} mr-1`}></i> Host ID: {room.host_user_id.substring(0,5)}</span>
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
        </div>
    );
};