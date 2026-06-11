import React, { useState, useEffect } from 'react';

export const ProfileCardModal = ({ targetUser, onClose, tgId, activeRoom, sendFriendRequest, setIsMinimized, setVcSubTab, leaveSeat, toggleMute, isMuted, hostAction, mutedSeats }) => {
    const [friendState, setFriendState] = useState('none');
    
    useEffect(() => {
        if (window.Telegram?.WebApp?.CloudStorage) {
            window.Telegram.WebApp.CloudStorage.getItem('ataxy_friends', (err, val) => {
                const friends = val ? JSON.parse(val) : [];
                if (friends.includes(String(targetUser.user_id))) setFriendState('friends');
            });
            window.Telegram.WebApp.CloudStorage.getItem('ataxy_pending_friends', (err, val) => {
                const pending = val ? JSON.parse(val) : [];
                if (pending.includes(String(targetUser.user_id))) setFriendState('pending');
            });
        }
    }, [targetUser]);

    const isMe = String(targetUser.user_id) === String(tgId);
    const isHost = activeRoom && String(activeRoom.host_user_id) === String(tgId);
    const isHostAction = isHost && !isMe;

    const handleAddFriend = () => {
        sendFriendRequest(targetUser.user_id);
        setFriendState('pending');
    };

    const handleChat = () => {
        onClose();
        setIsMinimized(true);
        setVcSubTab('chats');
        window.dispatchEvent(new CustomEvent('open_dm_thread', { detail: targetUser.user_id }));
    };

    return (
        <div className="fixed inset-0 z-[99999] bg-black/70 flex flex-col justify-end animate-in fade-in" onClick={onClose}>
            <div className="bg-[#021633] rounded-t-3xl border-t border-[#0AE0D0]/30 shadow-[0_-10px_40px_rgba(0,255,255,0.1)] flex flex-col items-center w-full pb-[env(safe-area-inset-bottom,_12px)] overflow-hidden animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
                {/* Top Section: Hero Banner */}
                <div className="w-full h-[15vh] bg-gradient-to-r from-[#00A7A7] to-blue-600 relative"></div>
                
                {/* Identity Row */}
                <div className="w-full px-6 flex justify-between items-end -mt-10 mb-6 relative z-10">
                    {targetUser.photo_url ? (
                        <img src={targetUser.photo_url} className="w-24 h-24 rounded-full border-4 border-[#021633] bg-[#010B1C] object-cover shadow-lg" alt="Profile" />
                    ) : (
                        <div className="w-24 h-24 rounded-full border-4 border-[#021633] bg-gradient-to-br from-[#00A7A7] to-blue-600 flex items-center justify-center font-black text-[#010B1C] text-4xl shadow-lg">
                            {(targetUser.user_name || "U").charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="flex flex-col items-end pb-2">
                        <h2 className="text-xl font-black text-white drop-shadow-md">{targetUser.user_name || "Student"}</h2>
                        <div className="flex items-center gap-2 text-xs text-[#A4DFE6] bg-black/50 px-3 py-1.5 rounded-full mt-1 border border-[#0AE0D0]/20 shadow-inner">
                            <span className="font-mono">ID: {String(targetUser.user_id).substring(0,8)}</span>
                            <i className="fa-regular fa-copy cursor-pointer hover:text-white transition-colors" onClick={() => { navigator.clipboard.writeText(targetUser.user_id); alert('ID Copied!'); }}></i>
                        </div>
                    </div>
                </div>

                {/* Circular Social Action Buttons */}
                {!isMe && (
                    <div className="flex justify-center gap-6 mb-6 w-full px-6">
                        {friendState === 'none' ? (
                            <button onClick={handleAddFriend} className="flex flex-col items-center gap-2 group flex-1">
                                <div className="w-14 h-14 rounded-full bg-[#00FFFF]/10 text-[#00FFFF] border border-[#00FFFF]/40 flex items-center justify-center text-xl group-hover:bg-[#00FFFF] group-hover:text-[#010B1C] transition-all shadow-[0_0_15px_rgba(0,255,255,0.2)]"><i className="fa-solid fa-user-plus"></i></div>
                                <span className="text-[10px] font-bold text-[#A4DFE6] uppercase tracking-wider">Add Friend</span>
                            </button>
                        ) : (
                            <button onClick={handleChat} className="flex flex-col items-center gap-2 group flex-1">
                                <div className="w-14 h-14 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/40 flex items-center justify-center text-xl group-hover:bg-blue-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]"><i className="fa-solid fa-message"></i></div>
                                <span className="text-[10px] font-bold text-[#A4DFE6] uppercase tracking-wider">{friendState === 'pending' ? 'Pending' : 'Chat'}</span>
                            </button>
                        )}
                    </div>
                )}

                {/* Bottom Contextual Power Dashboard (Conditional Rows) */}
                {isMe && targetUser.seat_number != null && (
                    <div className="w-full bg-[#010B1C]/50 p-4 border-t border-[#0AE0D0]/10 grid grid-cols-2 gap-3">
                        <button onClick={() => { leaveSeat(); onClose(); }} className="py-3 bg-red-500/20 text-red-400 font-bold rounded-xl border border-red-500/30 hover:bg-red-500 hover:text-white transition-colors">Leave Seat</button>
                        <button onClick={() => { toggleMute(); onClose(); }} className={`py-3 font-bold rounded-xl border transition-colors ${isMuted ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500 hover:text-white' : 'bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500 hover:text-white'}`}>{isMuted ? 'Unmute Mic' : 'Mute Mic'}</button>
                    </div>
                )}

                {isHostAction && targetUser.seat_number != null && (
                    <div className="w-full bg-[#010B1C]/50 p-4 border-t border-[#0AE0D0]/10 grid grid-cols-2 gap-3">
                        <button onClick={() => { hostAction('force_mute', targetUser.user_id); onClose(); }} className="py-3 bg-orange-500/20 text-orange-400 font-bold rounded-xl border border-orange-500/30 hover:bg-orange-500 hover:text-white transition-colors">Mute User's Mic</button>
                        <button onClick={() => { hostAction('kick', targetUser.user_id); onClose(); }} className="py-3 bg-red-500/20 text-red-400 font-bold rounded-xl border border-red-500/30 hover:bg-red-500 hover:text-white transition-colors">Kick from Room</button>
                        <button onClick={() => { hostAction('seat_mute', null, { seatNumber: targetUser.seat_number, isMuted: !mutedSeats[targetUser.seat_number] }); onClose(); }} className={`py-3 font-bold rounded-xl border transition-colors ${mutedSeats[targetUser.seat_number] ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500 hover:text-white' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500 hover:text-white'}`}>{mutedSeats[targetUser.seat_number] ? 'Unmute Seat' : 'Mute Seat'}</button>
                        <button onClick={() => { hostAction('lift_user', targetUser.user_id); onClose(); }} className="py-3 bg-blue-500/20 text-blue-400 font-bold rounded-xl border border-blue-500/30 hover:bg-blue-500 hover:text-white transition-colors">Move to Audience</button>
                    </div>
                )}
            </div>
        </div>
    );
};