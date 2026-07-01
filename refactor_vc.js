const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Inject PeerJS script if missing
if (!html.includes('peerjs.min.js')) {
    html = html.replace(
        '<script src="https://download.agora.io/sdk/release/AgoraRTC_N-4.20.2.js"></script>',
        '<script src="https://download.agora.io/sdk/release/AgoraRTC_N-4.20.2.js"></script>\n    <script src="https://unpkg.com/peerjs@1.5.1/dist/peerjs.min.js"></script>'
    );
}

const visibilityFix = `
            const { roomParticipants } = voiceState || { roomParticipants: [] }; 
            let displayRooms = [];
            if (dashboardFilter === 'active') {
                displayRooms = availableRooms.filter(room => {
                    if (room.id === myAdvanceRoom?.id) return false;
                    
                    if (room.room_type === 'advance' || room.room_type === 'permanent') {
                        if (room.seats_occupied === 0) return false;
                    }
                    return true;
                });
            } else {
                displayRooms = [];
            }
`;

html = html.replace(
    /let displayRooms = \[\];\s*if \(dashboardFilter === 'active'\) \{\s*displayRooms = availableRooms\.filter\(r => r\.id !== myAdvanceRoom\?\.id\);\s*\} else \{\s*displayRooms = \[\]; \/\/ Mock recent\/joined\s*\}/g,
    visibilityFix
);

const oldSeatNode = `const renderSeat = (seatNum, occupant, label, isLarge = false) => {
            const isOfflineHost = occupant?.is_offline_host;
            const isMe = String(occupant?.user_id) === currentUserId;
            const volume = activeSpeakers[String(occupant?.user_id)] || 0;
            const isSpeaking = volume > 5;
            const isHostSeat = seatNum === 0;

            const baseScale = isLarge ? 1.05 : 1;
            
            const dpUrl = isMe ? (window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url || tgUser.photo_url) : (isOfflineHost ? activeRoom.room_dp_url : occupant?.photo_url);

            return (
                <div key={seatNum} onClick={() => handleSeatClick(seatNum, occupant)} className={\`flex flex-col items-center gap-1 cursor-pointer transition-transform hover:scale-105 \${isLarge ? 'w-24' : 'w-16'}\`} style={{ transform: \`scale(\${isSpeaking ? baseScale + 0.05 : baseScale})\` }}>
                    {occupant ? (
                        <div className="relative weplay-voice-ring w-full aspect-square flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-[3px] border-[#00FFFF] pointer-events-none transition-all duration-75 ease-out" style={{ transform: \`scale(\${volume > 0 ? 1.05 + (volume / 100) * 0.15 : 1})\`, opacity: volume > 0 ? 0.3 + (volume / 100) * 0.7 : 0, boxShadow: volume > 0 ? \`0 0 \${10 + (volume / 100) * 20}px rgba(0,255,255,\${0.3 + (volume / 100) * 0.7})\` : 'none' }}></div>
                            <div className={\`relative z-10 rounded-full flex items-center justify-center font-bold border-2 transition-all bg-gradient-to-br from-[#00FFFF] to-blue-600 overflow-hidden \${isLarge ? 'w-20 h-20 text-2xl' : 'w-14 h-14 text-xl'} \${isSpeaking ? 'border-[#00FFFF] text-[#010B1C]' : 'border-transparent text-white'}\`}>
                                {dpUrl ? <img src={dpUrl} alt="DP" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} /> : null}
                                <span className={\`w-full h-full flex items-center justify-center \${dpUrl ? 'hidden' : 'flex'}\`}>{occupantName.charAt(0).toUpperCase()}</span>
                            </div>
                            {((isMe ? isMuted : occupant.is_muted) || isSeatMuted) && (
                                <div className="absolute -bottom-1 -right-1 bg-[#010B1C] rounded-full w-5 h-5 flex items-center justify-center border border-gray-600 z-20">
                                    <i className="fa-solid fa-microphone-slash text-[10px] text-red-400"></i>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="relative w-full aspect-square flex items-center justify-center">
                            <div className={\`rounded-full border-2 border-dashed \${isLocked ? 'border-red-500/40 bg-red-500/10' : 'border-[#0AE0D0]/40 bg-[#021633] hover:bg-[#0AE0D0]/10'} flex items-center justify-center \${isLarge ? 'w-20 h-20 text-3xl' : 'w-14 h-14 text-xl'}\`}>
                                <i className={\`fa-solid \${isLocked ? 'fa-lock text-red-400/50' : 'fa-microphone-lines text-[#0AE0D0]/40'}\`}></i>
                            </div>
                            {isSeatMuted && (
                                <div className="absolute -bottom-1 -right-1 bg-[#010B1C] rounded-full w-5 h-5 flex items-center justify-center border border-gray-600 z-10">
                                    <i className="fa-solid fa-microphone-slash text-[10px] text-red-400"></i>
                                </div>
                            )}
                        </div>
                    )}
                    <span className="text-[10px] text-center font-semibold text-[#E0F7FA] truncate w-full px-1 mt-1">{occupantName}</span>
                </div>
            );
        };`;

const newSeatNode = `const renderSeat = (seatNum, occupant, label, isLarge = false) => {
            const isOfflineHost = occupant?.is_offline_host;
            const isMe = String(occupant?.user_id) === currentUserId;
            const volume = activeSpeakers[String(occupant?.user_id)] || 0;
            const isSpeaking = volume > 5;
            const isHostSeat = seatNum === 0;

            const baseScale = isLarge ? 1.05 : 1;
            
            const dpUrl = isMe ? (window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url || tgUser.photo_url) : (isOfflineHost ? activeRoom.room_dp_url : occupant?.photo_url);

            const isLocked = lockedSeats[seatNum];
            const isSeatMuted = mutedSeats[seatNum];
            const occupantName = occupant ? (isOfflineHost ? 'Host' : (occupant.user_name || "Unknown")) : (isLocked ? 'Locked' : label);

            return (
                <div key={seatNum} onClick={() => handleSeatClick(seatNum, occupant)} className={\`flex flex-col items-center gap-1 cursor-pointer transition-transform hover:scale-105 \${isLarge ? 'w-24' : 'w-16'}\`} style={{ transform: \`scale(\${isSpeaking ? baseScale + 0.05 : baseScale})\` }}>
                    {occupant ? (
                        <div className="relative weplay-voice-ring w-full aspect-square flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-2 border-[#ff3b8f] pointer-events-none transition-all duration-75 ease-out" style={{ transform: \`scale(\${volume > 0 ? 1.1 + (volume / 100) * 0.2 : 1})\`, opacity: volume > 0 ? 0.4 + (volume / 100) * 0.6 : 0, boxShadow: volume > 0 ? \`0 0 \${15 + (volume / 100) * 20}px rgba(255,59,143,\${0.4 + (volume / 100) * 0.6})\` : 'none' }}></div>
                            <div className={\`relative z-10 rounded-full flex items-center justify-center font-bold border-2 transition-all bg-[#010a17] overflow-hidden \${isLarge ? 'w-20 h-20 text-2xl' : 'w-14 h-14 text-xl'} \${isSpeaking ? 'border-[#ff3b8f]' : 'border-white/20'}\`}>
                                {dpUrl ? <img src={dpUrl} alt="DP" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} /> : null}
                                <span className={\`w-full h-full flex items-center justify-center \${dpUrl ? 'hidden' : 'flex'}\`}>{occupantName.charAt(0).toUpperCase()}</span>
                            </div>
                            {((isMe ? isMuted : occupant.is_muted) || isSeatMuted) && (
                                <div className="absolute -bottom-0 -right-0 bg-[#010a17] rounded-full w-5 h-5 flex items-center justify-center border border-gray-600 z-20 shadow-md">
                                    <i className="fa-solid fa-microphone-slash text-[9px] text-red-500"></i>
                                </div>
                            )}
                            {isHostSeat && (
                                <div className="absolute -top-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-[9px] font-black px-2 py-0.5 rounded-full z-20 shadow-sm border border-yellow-300 uppercase tracking-widest">Host</div>
                            )}
                        </div>
                    ) : (
                        <div className="relative w-full aspect-square flex items-center justify-center">
                            <div className={\`rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center \${isLarge ? 'w-20 h-20' : 'w-14 h-14'}\`}>
                                <i className={\`fa-solid \${isLocked ? 'fa-lock text-white/30 text-lg' : 'fa-plus text-white/40 text-xl'}\`}></i>
                            </div>
                            {isSeatMuted && (
                                <div className="absolute -bottom-0 -right-0 bg-[#010a17] rounded-full w-5 h-5 flex items-center justify-center border border-gray-600 z-10 shadow-md">
                                    <i className="fa-solid fa-microphone-slash text-[9px] text-red-500"></i>
                                </div>
                            )}
                        </div>
                    )}
                    <span className="text-[10px] text-center font-bold text-white truncate max-w-full px-2 py-0.5 mt-1 bg-black/40 rounded-full shadow-sm">{occupantName}</span>
                </div>
            );
        };`;

html = html.replace(oldSeatNode, newSeatNode);

const oldLayout = `
                <div className="p-6 pb-2">
                    {activeRoom.room_type === 'advance' ? (
                        <>
                            <div className="flex justify-center gap-8 mb-8">
                            {[0, 1].map(seatNum => {
                                if (seatNum === 1 && !activeRoom.is_partner_seat_open) return null;
                                const occupant = participants.find(p => p.seat_number === seatNum) || (seatNum === 0 && activeRoom.is_offline_host_pinned ? { is_offline_host: true, user_id: activeRoom.host_user_id } : null);
                                return renderSeat(seatNum, occupant, seatNum === 0 ? "Host" : "Partner", true);
                            })}
                            </div>
                            <div className="grid grid-cols-4 gap-y-6 gap-x-4 justify-items-center">
                            {[2, 3, 4, 5, 6, 7, 8, 9].map(seatNum => {
                                const occupant = participants.find(p => p.seat_number === seatNum);
                                return renderSeat(seatNum, occupant, \`Seat \${seatNum}\`);
                            })}
                            </div>
                        </>
                    ) : (
                        <div className="grid grid-cols-3 gap-y-8 gap-x-4 justify-items-center pt-4">
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(seatNum => {
                                const occupant = participants.find(p => p.seat_number === seatNum) || (seatNum === 0 && activeRoom.is_offline_host_pinned ? { is_offline_host: true, user_id: activeRoom.host_user_id } : null);
                                return renderSeat(seatNum, occupant, seatNum === 0 ? "Host" : \`Seat \${seatNum}\`);
                            })}
                        </div>
                    )}
                </div>`;

const newLayout = `
                <div className="p-6 pb-2 z-10 relative">
                    {activeRoom.room_type === 'advance' || activeRoom.room_type === 'permanent' ? (
                        <>
                            <div className="flex justify-center gap-12 mb-8 mt-4">
                            {[0, 1].map(seatNum => {
                                if (seatNum === 1 && !activeRoom.is_partner_seat_open) return null;
                                const occupant = participants.find(p => p.seat_number === seatNum) || (seatNum === 0 && activeRoom.is_offline_host_pinned ? { is_offline_host: true, user_id: activeRoom.host_user_id } : null);
                                return renderSeat(seatNum, occupant, seatNum === 0 ? "Take Seat" : "Partner", true);
                            })}
                            </div>
                            <div className="grid grid-cols-4 gap-y-8 gap-x-2 justify-items-center px-2">
                            {[2, 3, 4, 5, 6, 7, 8, 9].map(seatNum => {
                                const occupant = participants.find(p => p.seat_number === seatNum);
                                return renderSeat(seatNum, occupant, \`Seat \${seatNum}\`);
                            })}
                            </div>
                        </>
                    ) : (
                        <div className="grid grid-cols-3 gap-y-10 gap-x-4 justify-items-center pt-8 px-4">
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(seatNum => {
                                const occupant = participants.find(p => p.seat_number === seatNum) || (seatNum === 0 && activeRoom.is_offline_host_pinned ? { is_offline_host: true, user_id: activeRoom.host_user_id } : null);
                                return renderSeat(seatNum, occupant, seatNum === 0 ? "Host" : \`Seat \${seatNum}\`);
                            })}
                        </div>
                    )}
                </div>`;

html = html.replace(oldLayout, newLayout);

const oldHeader = `
            <div className="flex-1 flex flex-col relative z-10 bg-[#010B1C] min-h-screen">
                <div className="px-4 py-4 flex items-center justify-between border-b border-[#0AE0D0]/20 bg-[#010B1C]/90 backdrop-blur">
                    <div className="flex items-center gap-3">
                        <button onClick={handleBackEvent} className="text-[#00FFFF] text-xl px-2 hover:bg-white/10 rounded-lg transition-colors">
                            <i className="fa-solid fa-chevron-down"></i>
                        </button>
                        <div className="flex flex-col">
                            <h2 className="text-xl font-black text-[#E0F7FA] drop-shadow-[0_0_5px_rgba(0,255,255,0.3)] flex items-center">
                                {activeRoom.channel_name}
                                {isHost && (activeRoom.room_type === 'advance' || activeRoom.room_type === 'permanent') && (
                                    <button onClick={() => setShowSettingsModal(true)} className="ml-2 text-[#0AE0D0] hover:text-white text-base transition-colors"><i className="fa-solid fa-gear"></i></button>
                                )}
                            </h2>
                            <p className="text-xs text-[#00FFFF] font-bold flex items-center gap-2">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 inline-block rounded-full bg-[#00FFFF] animate-pulse"></span> Live</span>
                                <span className="text-gray-400">|</span>
                                <span>ID: {activeRoom.id}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {myParticipant?.seat_number !== null && myParticipant?.seat_number !== undefined && (
                            <button onClick={toggleMute} className={\`w-9 h-9 rounded-xl flex items-center justify-center transition-colors \${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-[#00FFFF]/20 text-[#00FFFF] hover:bg-[#00FFFF] hover:text-[#010B1C]'}\`}><i className={\`fa-solid \${isMuted ? 'fa-microphone-slash' : 'fa-microphone'} text-xs\`}></i></button>
                        )}
                        <button onClick={toggleSpeaker} className={\`w-9 h-9 rounded-xl flex items-center justify-center transition-colors \${isSpeakerMuted ? 'bg-gray-700 text-gray-400' : 'bg-gray-800 text-white hover:bg-gray-700'}\`}><i className={\`fa-solid \${isSpeakerMuted ? 'fa-volume-xmark' : 'fa-volume-high'} text-xs\`}></i></button>
                        <button onClick={() => { if (!isProcessing) leaveRoom(); }} disabled={isProcessing} className={\`bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-xl text-sm font-bold shadow-[0_0_10px_rgba(255,0,0,0.2)] transition-colors \${isProcessing ? 'opacity-50 cursor-wait' : ''}\`}>Leave</button>
                    </div>
                </div>`;

const newHeader = `
            <div className="flex-1 flex flex-col relative z-10 bg-[#010a17] min-h-screen overflow-hidden">
                {/* Immersive WePlay Blurred Background */}
                <div className="absolute inset-0 z-0">
                    <img src={activeRoom.room_dp_url || "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop"} alt="bg" className="w-full h-full object-cover opacity-40 blur-xl scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#010a17]/80 to-[#010a17]"></div>
                </div>

                <div className="px-4 py-3 flex items-center justify-between z-10 relative">
                    <div className="flex items-center gap-2">
                        <button onClick={handleBackEvent} className="text-white text-xl px-2 opacity-80 hover:opacity-100 transition-opacity">
                            <i className="fa-solid fa-chevron-down"></i>
                        </button>
                        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-full pr-4 pl-1 py-1 border border-white/10">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                                {activeRoom.room_dp_url ? <img src={activeRoom.room_dp_url} className="w-full h-full object-cover" /> : <i className="fa-solid fa-hashtag text-white/50 text-xs"></i>}
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-sm font-bold text-white leading-tight">
                                    {activeRoom.channel_name}
                                </h2>
                                <p className="text-[10px] text-white/60 font-medium">
                                    ID: {activeRoom.id}
                                </p>
                            </div>
                            {isHost && (activeRoom.room_type === 'advance' || activeRoom.room_type === 'permanent') && (
                                <button onClick={() => setShowSettingsModal(true)} className="ml-1 text-white/70 hover:text-white"><i className="fa-solid fa-gear"></i></button>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-bold text-white">{(activeRoom.seats_occupied || 0) + (audience?.length || 0)}</span>
                        </div>
                        <button onClick={() => { if (!isProcessing) leaveRoom(); }} disabled={isProcessing} className={\`bg-black/30 backdrop-blur-md w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:bg-red-500/40 hover:text-red-100 transition-colors border border-white/10 \${isProcessing ? 'opacity-50 cursor-wait' : ''}\`}>
                            <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
                        </button>
                    </div>
                </div>`;

html = html.replace(oldHeader, newHeader);

const bypassAgoraStr = `
                    if (roomData.room_type === 'temporary') {
                        // Bypass Agora entirely, use basic Supabase presence only
                        setIsProcessing(false);
                        return true;
                    }`;

if (!html.includes("roomData.room_type === 'temporary'")) {
    html = html.replace(
        'if (roomData.password && roomData.password !== password) {',
        bypassAgoraStr + '\n                    if (roomData.password && roomData.password !== password) {'
    );
}

fs.writeFileSync('index.html', html);
console.log('Successfully injected WePlay UI, Visibility Fix, and PeerJS Script into index.html');
