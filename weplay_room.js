const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

const renderSeatStart = 7415;
const renderSeatEnd = 7463;

const newRenderSeat = `            const renderSeat = (seatNum, occupant, label, isLarge = false) => {
                const isOfflineHost = occupant?.is_offline_host;
                const isMe = String(occupant?.user_id) === currentUserId;
                const volume = activeSpeakers[String(occupant?.user_id)] || 0;
                const isSpeaking = volume > 5;
                const isHostSeat = seatNum === 0;
                const isPartnerSeat = seatNum === 1;
                const dpUrl = isMe ? (window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url || tgUser.photo_url) : (isOfflineHost ? activeRoom.room_dp_url : occupant?.photo_url);
                const isLocked = lockedSeats[seatNum];
                const isSeatMuted = mutedSeats[seatNum];
                const occupantName = occupant ? (isOfflineHost ? 'Host' : (occupant.user_name || "Unknown")) : (isLocked ? 'Locked' : label);
                
                // WePlay specific styling based on screenshots
                const seatSize = isLarge ? 'w-[75px] h-[75px]' : 'w-[55px] h-[55px]';
                const avatarSize = isLarge ? 'w-[68px] h-[68px]' : 'w-[50px] h-[50px]';

                return (
                    <div onClick={() => handleSeatClick(seatNum, occupant)} className="flex flex-col items-center gap-1 cursor-pointer shrink-0">
                        {occupant ? (
                            <div className={\`relative flex items-center justify-center \${seatSize}\`}>
                                {/* Golden glowing border for host/partner */}
                                {(isHostSeat || isPartnerSeat) && (
                                    <div className="absolute inset-0 rounded-full border-[2px] border-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.5)] z-0"></div>
                                )}
                                
                                <div className={\`relative z-10 \${avatarSize} rounded-full flex items-center justify-center font-bold bg-[#1a1a24] overflow-hidden shadow-lg border border-white/20\`}>
                                    {dpUrl ? <img src={dpUrl} alt="DP" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} /> : null}
                                    <span className={\`w-full h-full flex items-center justify-center text-white \${dpUrl ? 'hidden' : 'flex'} \${isLarge ? 'text-2xl' : 'text-xl'}\`}>{occupantName.charAt(0).toUpperCase()}</span>
                                </div>
                                
                                {((isMe ? isMuted : occupant.is_muted) || isSeatMuted) && (
                                    <div className="absolute bottom-0 right-0 bg-black/60 backdrop-blur-md rounded-full w-5 h-5 flex items-center justify-center border border-white/20 z-20">
                                        <i className="fa-solid fa-microphone-slash text-[8px] text-white"></i>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className={\`relative flex items-center justify-center group \${seatSize}\`}>
                                <div className={\`absolute inset-0 rounded-full border-[1.5px] \${isLocked ? 'border-dashed border-white/30' : 'border-white/50'} bg-black/20 backdrop-blur-sm group-hover:bg-white/10 transition-colors z-10 flex items-center justify-center\`}>
                                    <i className={\`fa-solid \${isLocked ? 'fa-lock text-white/30 text-sm' : 'fa-plus text-white/50 text-xl'}\`}></i>
                                </div>
                                {isSeatMuted && (
                                    <div className="absolute bottom-0 right-0 bg-black/60 backdrop-blur-md rounded-full w-5 h-5 flex items-center justify-center border border-white/20 z-20">
                                        <i className="fa-solid fa-microphone-slash text-[8px] text-white"></i>
                                    </div>
                                )}
                            </div>
                        )}
                        <span className={\`text-[11px] text-center font-bold truncate max-w-[80px] px-2 \${occupant ? (isHostSeat ? 'text-[#FFD700]' : 'text-white') : 'text-white/60'}\`}>
                            {occupantName}
                        </span>
                        {occupant && (isHostSeat || isPartnerSeat) && (
                            <span className="text-[9px] text-[#00FFFF] font-bold -mt-1"><i className="fa-solid fa-user text-[8px]"></i> {isHostSeat ? 'Owner' : 'Admin'}</span>
                        )}
                    </div>
                );
            };`;

const mainLayoutStart = 7472;
const mainLayoutEnd = 7614;

const newMainLayout = `            return (
                <div className="flex-1 flex flex-col relative z-10 bg-black min-h-screen overflow-hidden font-sans">
                    {/* WePlay Immersive Golden/Purple Background */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-[#2A0845] via-[#1D063A] to-[#0D0221]"></div>
                        <img src="https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover mix-blend-overlay opacity-30" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40 mix-blend-screen"></div>
                    </div>

                    {/* Top Header */}
                    <div className="px-4 py-3 flex items-center justify-between z-20 relative pt-[calc(30px+env(safe-area-inset-top,0px))]">
                        <div className="flex items-center gap-3">
                            <button onClick={onMinimize} className="w-8 h-8 flex items-center justify-center text-white text-lg">
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>
                            <div className="flex flex-col">
                                <h2 className="text-[15px] font-black text-white leading-tight flex items-center gap-1.5 drop-shadow-md">
                                    <i className="fa-solid fa-gem text-[#00FFFF] text-xs"></i> {activeRoom.channel_name}
                                </h2>
                                <p className="text-[10px] text-white/70 font-bold flex items-center gap-1">
                                    {activeRoom.room_type === 'advance' || activeRoom.room_type === 'permanent' ? 'Advanced Room' : 'Normal Room'} ID: {activeRoom.id} <i className="fa-regular fa-copy ml-1"></i>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <img src={currentUserPhoto || 'https://picsum.photos/100'} className="w-7 h-7 rounded-full border border-[#FFD700]" />
                                <div className="absolute -bottom-1 -right-2 bg-black/60 rounded-full px-1 flex items-center text-[8px] font-bold text-[#FFD700]"><i className="fa-solid fa-coins mr-0.5"></i>21.3k</div>
                            </div>
                            <span className="text-white/80 text-xs font-bold">{participants.length + audience.length}</span>
                            {isHost && (activeRoom.room_type === 'advance' || activeRoom.room_type === 'permanent') && (
                                <i className="fa-solid fa-ellipsis text-white text-lg cursor-pointer" onClick={() => setShowSettingsModal(true)}></i>
                            )}
                        </div>
                    </div>

                    {/* Seats Layout */}
                    <div className="w-full relative z-10 flex flex-col items-center pt-6 px-2">
                        {activeRoom.room_type === 'advance' || activeRoom.room_type === 'permanent' ? (
                            <div className="w-full flex flex-col gap-6">
                                {/* Top 2 Seats */}
                                <div className="flex justify-center gap-12 px-6">
                                    {renderSeat(0, participants.find(p => p.seat_number !== null && p.seat_number !== undefined && Number(p.seat_number) === 0) || (!participants.some(p => String(p.user_id) === String(activeRoom.host_user_id)) ? { is_offline_host: true, user_id: activeRoom.host_user_id, user_name: "Host" } : undefined), "Host", true)}
                                    {renderSeat(1, participants.find(p => p.seat_number !== null && p.seat_number !== undefined && Number(p.seat_number) === 1), "Xara", true)}
                                </div>
                                {/* Bottom 8 Seats (2 rows of 4) */}
                                <div className="grid grid-cols-4 gap-y-6 gap-x-2 w-full max-w-md mx-auto justify-items-center mt-2">
                                    {[2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                                        <React.Fragment key={i}>
                                            {renderSeat(i, participants.find(p => p.seat_number !== null && p.seat_number !== undefined && Number(p.seat_number) === i), i === 2 ? 'TARGET' : (i === 3 ? 'Shreya' : \`Seat \${i}\`), false)}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="w-full flex flex-col gap-8">
                                {/* Top 1 Seat (Host) */}
                                <div className="flex justify-center">
                                    {renderSeat(0, participants.find(p => p.seat_number !== null && p.seat_number !== undefined && Number(p.seat_number) === 0) || (activeRoom.is_offline_host_pinned ? { is_offline_host: true, user_id: activeRoom.host_user_id } : undefined), "Host", true)}
                                </div>
                                {/* Bottom 3 Seats */}
                                <div className="flex justify-center gap-8">
                                    {[1, 2, 3].map(i => (
                                        <React.Fragment key={i}>
                                            {renderSeat(i, participants.find(p => p.seat_number !== null && p.seat_number !== undefined && Number(p.seat_number) === i), \`Seat \${i}\`, false)}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chat Area & Toolbar */}
                    <div className="w-full h-[45vh] mt-auto relative z-20 flex flex-col justify-end pb-16">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"></div>
                        
                        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-8 flex flex-col justify-end space-y-3 pointer-events-auto relative z-10" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%)' }}>
                            {chatMessages.map((msg, idx) => {
                                if (msg.isSystem) {
                                    return (
                                        <div key={idx} className="bg-black/30 backdrop-blur-sm rounded-full px-4 py-1 self-start w-max">
                                            <p className="text-[10px] text-white/80 font-bold">
                                                <span className="text-[#FFD700]">{msg.text.split(' ')[0]}</span> {msg.text.substring(msg.text.indexOf(' ') + 1)}
                                            </p>
                                        </div>
                                    );
                                }
                                return (
                                    <div key={idx} className="bg-black/40 backdrop-blur-md rounded-2xl rounded-tl-sm p-3 w-max max-w-[85%] self-start border border-white/5 relative shadow-sm">
                                        <div className="flex items-center gap-1 mb-1">
                                            <i className="fa-solid fa-user text-[8px] text-[#FFD700]"></i>
                                            <span className="text-[12px] font-black text-[#FFD700] drop-shadow-sm">{msg.sender_name}</span>
                                            <span className="bg-[#00FFFF]/20 text-[#00FFFF] text-[8px] font-black px-1 rounded-sm border border-[#00FFFF]/40 ml-1">V3</span>
                                        </div>
                                        <p className="text-[13px] text-white/95 break-words font-medium leading-relaxed">{msg.text}</p>
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef} />
                        </div>
                    </div>

                    {/* Bottom Floating Toolbar */}
                    <div className="absolute bottom-0 left-0 right-0 px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] bg-transparent z-30 flex items-center justify-between gap-3">
                        <button onClick={() => { if (isSpeaker) toggleMute(); else safeAlert("You must take a seat to speak."); }} className="w-8 h-8 flex items-center justify-center text-white/80 active:scale-90 transition-transform">
                            <i className={\`fa-solid \${isMuted || !isSpeaker ? 'fa-volume-xmark text-white/50' : 'fa-volume-high'} text-xl\`}></i>
                        </button>
                        
                        <form onSubmit={(e) => { e.preventDefault(); if (chatInput.trim()) { sendChat(chatInput); setChatInput(''); } }} className="flex-1 max-w-[160px]">
                            <div className="bg-black/40 backdrop-blur-xl rounded-full px-4 py-2 flex items-center border border-white/20">
                                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type..." className="bg-transparent border-none outline-none text-[13px] text-white placeholder-white/50 flex-1 font-medium w-full" />
                            </div>
                        </form>
                        
                        <div className="flex items-center gap-3">
                            <i onClick={() => safeAlert("Gifts")} className="fa-solid fa-gift text-[#FF3B8F] text-2xl drop-shadow-[0_0_5px_rgba(255,59,143,0.8)] cursor-pointer active:scale-90 transition-transform"></i>
                            <i onClick={() => setShowRequestsModal(true)} className="fa-solid fa-hand text-white/90 text-xl cursor-pointer active:scale-90 relative">
                                {micRequests.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3 border border-black"></span>}
                            </i>
                            <i className="fa-solid fa-border-all text-white/90 text-xl cursor-pointer active:scale-90"></i>
                        </div>
                    </div>`;

lines.splice(mainLayoutStart, mainLayoutEnd - mainLayoutStart + 1, newMainLayout);
lines.splice(renderSeatStart, renderSeatEnd - renderSeatStart + 1, newRenderSeat);

fs.writeFileSync('index.html', lines.join('\n'));
console.log('Successfully applied WePlay ActiveVoiceRoom Replica.');
