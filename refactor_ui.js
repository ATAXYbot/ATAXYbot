const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

const newSeatNode = `            const renderSeat = (seatNum, occupant, label, isLarge = false) => {
                if (occupant && !occupant.user_id) return null; // Safe guard
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
                    <div onClick={() => handleSeatClick(seatNum, occupant)} className={\`flex flex-col items-center gap-1 cursor-pointer transition-transform hover:-translate-y-1 hover:scale-105 \${isLarge ? 'w-24' : 'w-16'}\`} style={{ transform: \`scale(\${isSpeaking ? baseScale + 0.05 : baseScale})\` }}>
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

const newHeaderLayout = `                <div className="flex-1 flex flex-col relative z-10 bg-[#010a17] min-h-screen overflow-hidden">
                    {/* Immersive WePlay Blurred Background */}
                    <div className="absolute inset-0 z-0">
                        <img src={activeRoom.room_dp_url || "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop"} alt="bg" className="w-full h-full object-cover opacity-40 blur-xl scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#010a17]/80 to-[#010a17]"></div>
                    </div>

                    <div className="px-4 py-3 flex items-center justify-between z-10 relative pt-[calc(70px+env(safe-area-inset-top,0px))]">
                        <div className="flex items-center gap-2">
                            <button onClick={onMinimize} className="text-white text-xl px-2 opacity-80 hover:opacity-100 transition-opacity">
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
                            <div className="bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10 cursor-pointer" onClick={() => setShowParticipantsModal(true)}>
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-bold text-white">{(activeRoom.seats_occupied || 0) + (participants?.filter(p => p.seat_number === null || p.seat_number === undefined)?.length || 0)}</span>
                            </div>
                            <button onClick={() => { if (!isProcessing) leaveRoom(); }} disabled={isProcessing} className={\`bg-black/30 backdrop-blur-md w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:bg-red-500/40 hover:text-red-100 transition-colors border border-white/10 \${isProcessing ? 'opacity-50 cursor-wait' : ''}\`}>
                                <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
                            </button>
                        </div>
                    </div>

                    {activeRoom.announcement && (
                        <div className="mx-4 mt-3 p-3 bg-black/40 rounded-xl border border-[#D4AF37]/40 text-xs text-[#F9D33A] shadow-[0_0_10px_rgba(212,175,55,0.2)] backdrop-blur flex items-start gap-2 animate-in slide-in-from-top-2 z-20 relative">
                            <i className="fa-solid fa-bullhorn mt-0.5 animate-pulse"></i>
                            <span>{activeRoom.announcement}</span>
                        </div>
                    )}
                    {currentMusic && (
                        <div className="absolute top-[calc(64px+max(env(safe-area-inset-top),_24px))] left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md border border-[#00FFFF]/40 rounded-full px-4 py-1.5 flex items-center gap-2 z-20 shadow-[0_0_15px_rgba(0,255,255,0.2)] w-max max-w-[90%]">
                            <i className="fa-solid fa-music text-[#00FFFF] animate-pulse text-[10px]"></i>
                            <span className="text-white text-xs font-bold truncate">{currentMusic.title}</span>
                        </div>
                    )}
                    <div className="p-6 z-10 relative">
                        {activeRoom.room_type === 'advance' || activeRoom.room_type === 'permanent' ? (
                            <>
                                <div className="flex justify-center gap-12 mb-8 mt-4">
                                {[0, 1].map(seatNum => {
                                    if (seatNum === 1 && !activeRoom.is_partner_seat_open) return null;
                                    const occupant = participants.find(p => p.seat_number !== null && p.seat_number !== undefined && Number(p.seat_number) === seatNum) ||
                                    (seatNum === 0 && (activeRoom.room_type === 'advance' || activeRoom.room_type === 'permanent') && !participants.some(p => String(p.user_id) === String(activeRoom.host_user_id)) ? { is_offline_host: true, user_id: activeRoom.host_user_id, user_name: "Host" } : undefined);
                                    return renderSeat(seatNum, occupant, seatNum === 0 ? "Take Seat" : "Partner", true);
                                })}
                                </div>
                                <div className="grid grid-cols-4 gap-y-8 gap-x-2 justify-items-center px-2">
                                {[2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                                    <React.Fragment key={i}>
                                        {renderSeat(i, participants.find(p => p.seat_number !== null && p.seat_number !== undefined && Number(p.seat_number) === i), \`Seat \${i}\`)}
                                    </React.Fragment>
                                ))}
                                </div>
                            </>
                        ) : (
                            <div className="grid grid-cols-3 gap-y-10 gap-x-4 justify-items-center pt-8 px-4">
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <React.Fragment key={i}>
                                        {renderSeat(i, participants.find(p => p.seat_number !== null && p.seat_number !== undefined && Number(p.seat_number) === i) || (i === 0 && activeRoom.is_offline_host_pinned ? { is_offline_host: true, user_id: activeRoom.host_user_id } : undefined), i === 0 ? "Host" : \`Seat \${i}\`)}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>`;

// Splice Header + Layout first (higher index)
lines.splice(7456, 47, newHeaderLayout);

// Splice SeatNode (lower index)
lines.splice(7374, 73, newSeatNode);

fs.writeFileSync('index.html', lines.join('\n'));
console.log('UI successfully updated with direct splicing.');
