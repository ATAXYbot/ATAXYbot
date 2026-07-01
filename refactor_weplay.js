const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

const vTabStart = 7088;
const vTabEnd = 7236;

const newVoiceRoomsTab = `        const VoiceRoomsTab = ({ tgUser, voiceState }) => {
            const { activeRoom, leaveRoom, availableRooms, fetchRooms, createRoom, joinRoom, isProcessing } = voiceState;
            const [showCreateModal, setShowCreateModal] = useState(false);
            const [selectedRoomToJoin, setSelectedRoomToJoin] = useState(null);
            const [isRefreshing, setIsRefreshing] = useState(false);
            const [dashboardFilter, setDashboardFilter] = useState('active');

            const tgUserId = String(window.Telegram?.WebApp?.initDataUnsafe?.user?.id || tgUser?.id || "1001");
            const verifiedUserId = "5182808926";
            
            const officialRoom = availableRooms.find(r => String(r.owner_id) === verifiedUserId && (r.room_type === 'permanent' || r.room_type === 'advance'));

            useEffect(() => {
                const handleBackEvent = (e) => {
                    if (showCreateModal) { e.preventDefault(); setShowCreateModal(false); }
                    else if (selectedRoomToJoin) { e.preventDefault(); setSelectedRoomToJoin(null); }
                };
                window.addEventListener('ataxy_back_requested', handleBackEvent);
                return () => window.removeEventListener('ataxy_back_requested', handleBackEvent);
            }, [showCreateModal, selectedRoomToJoin]);

            const handleRefresh = async () => {
                setIsRefreshing(true);
                await fetchRooms();
                setTimeout(() => setIsRefreshing(false), 500);
            };

            const handleJoinClick = (room) => {
                if (isProcessing) return;
                if (room.password) {
                    setSelectedRoomToJoin(room);
                } else {
                    joinRoom(room);
                }
            };

            const { roomParticipants } = voiceState || { roomParticipants: [] }; 
            let displayRooms = [];
            if (dashboardFilter === 'active') {
                displayRooms = availableRooms.filter(room => {
                    if (officialRoom && room.id === officialRoom.id) return false;
                    return true;
                });
            } else {
                displayRooms = [];
            }

            return (
                <div className="pb-[80px] animate-in fade-in flex flex-col h-full bg-[#1A1A24] text-white">
                    <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                        
                        {/* WePlay Style Top Curved Header */}
                        <div className="relative bg-gradient-to-br from-[#9147ff] via-[#b359ff] to-[#ff3b8f] px-6 pt-10 pb-16 rounded-b-[3rem] shadow-[0_10px_30px_rgba(255,59,143,0.3)]">
                            <h2 className="text-3xl font-black text-white drop-shadow-md">Party Rooms</h2>
                            <p className="text-white/80 text-sm font-bold mt-1">Hang out & meet new friends!</p>
                            
                            <div className="absolute top-10 right-6 w-16 h-16 bg-white/20 rounded-full blur-xl pointer-events-none"></div>
                            <div className="absolute bottom-5 right-10 w-12 h-12 bg-white/20 rounded-full blur-lg pointer-events-none"></div>
                        </div>

                        <div className="px-4 -mt-10 relative z-10">
                            {/* WePlay Official Room Massive Card */}
                            {officialRoom && officialRoom.seats_occupied > 0 && (
                                <div onClick={() => handleJoinClick(officialRoom)} className="bg-white rounded-[2rem] p-4 flex flex-col gap-4 shadow-xl mb-6 cursor-pointer transform hover:scale-[1.02] transition-transform active:scale-95 border-2 border-transparent hover:border-[#ff3b8f] overflow-hidden relative group">
                                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity"></div>
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#ff3b8f] to-[#9147ff] shadow-md">
                                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white">
                                                    {officialRoom.room_dp_url ? <img src={officialRoom.room_dp_url} className="w-full h-full object-cover" /> : <AtaxyLogo className="w-8 h-8" />}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-black text-gray-900 text-lg flex items-center gap-1">
                                                    {officialRoom.channel_name} <VerifiedBadge className="w-4 h-4 text-[#ff3b8f]" />
                                                </h3>
                                                <p className="text-xs font-bold text-[#ff3b8f] bg-[#ff3b8f]/10 px-2 py-0.5 rounded-full inline-block mt-0.5">
                                                    ID: {officialRoom.id} • Official
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff3b8f] to-[#9147ff] text-white flex items-center justify-center shadow-lg group-hover:shadow-[0_0_15px_rgba(255,59,143,0.5)] transition-shadow">
                                            <i className="fa-solid fa-play ml-1"></i>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons (WePlay Style) */}
                            <div className="flex gap-4">
                                <button onClick={() => setShowCreateModal(true)} className="flex-1 bg-gradient-to-br from-[#FF8A00] to-[#FF4E00] rounded-3xl p-4 flex flex-col items-center justify-center gap-2 shadow-[0_8px_20px_rgba(255,78,0,0.3)] active:scale-95 transition-transform relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-12 h-12 bg-white/20 rounded-full blur-md"></div>
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                        <i className="fa-solid fa-plus text-white text-xl"></i>
                                    </div>
                                    <span className="font-black text-white text-sm">Create Room</span>
                                </button>
                                <button onClick={() => {
                                    const id = prompt("Enter Room ID to join:");
                                    if (id) {
                                        const r = availableRooms.find(rm => String(rm.id) === id);
                                        if (r) handleJoinClick(r);
                                        else safeAlert("Room not found!");
                                    }
                                }} className="flex-1 bg-gradient-to-br from-[#00C6FF] to-[#0072FF] rounded-3xl p-4 flex flex-col items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,114,255,0.3)] active:scale-95 transition-transform relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-12 h-12 bg-white/20 rounded-full blur-md"></div>
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                        <i className="fa-solid fa-hashtag text-white text-xl"></i>
                                    </div>
                                    <span className="font-black text-white text-sm">Join by ID</span>
                                </button>
                            </div>

                            {/* Live Rooms Title */}
                            <div className="flex items-center justify-between mt-8 mb-4">
                                <h3 className="text-xl font-black text-white">Trending Now</h3>
                                <button onClick={handleRefresh} className="text-white/50 hover:text-white transition-colors bg-white/5 w-8 h-8 rounded-full flex items-center justify-center">
                                    <i className={\`fa-solid fa-rotate-right \${isRefreshing ? 'animate-spin' : ''}\`}></i>
                                </button>
                            </div>

                            {/* Live Rooms List (WePlay Large Cards) */}
                            <div className="space-y-4">
                                {displayRooms.length === 0 ? (
                                    <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/10">
                                        <img src="https://cdn3d.iconscout.com/3d/premium/thumb/ghost-5026046-4185521.png" className="w-24 h-24 mx-auto mb-2 opacity-50" />
                                        <p className="text-white/50 font-bold">No trending rooms right now</p>
                                    </div>
                                ) : (
                                    displayRooms.map((room, idx) => {
                                        const bgUrl = room.room_dp_url || \`https://picsum.photos/seed/\${room.id}/400/200\`;
                                        return (
                                        <div key={room.id} onClick={() => handleJoinClick(room)} className={\`bg-[#252533] rounded-[2rem] h-32 relative overflow-hidden cursor-pointer group shadow-lg active:scale-[0.98] transition-transform \${isProcessing ? 'opacity-50 pointer-events-none' : ''}\`}>
                                            <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity" style={{ backgroundImage: \`url('\${bgUrl}')\` }}></div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A24] via-[#1A1A24]/60 to-transparent"></div>
                                            
                                            <div className="absolute inset-0 p-4 flex flex-col justify-between">
                                                <div className="flex justify-between items-start">
                                                    <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/10">
                                                        <span className="w-1.5 h-1.5 bg-[#00FFFF] rounded-full animate-pulse shadow-[0_0_5px_rgba(0,255,255,0.8)]"></span> Room
                                                    </span>
                                                    <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10">
                                                        <i className="fa-solid fa-users text-white/70"></i> {room.seats_occupied || 0}/12
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-white text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] truncate">
                                                        {room.channel_name} {room.password && <i className="fa-solid fa-lock text-white/50 text-xs ml-1"></i>}
                                                    </h3>
                                                    <p className="text-[10px] text-white/70 font-bold truncate flex items-center gap-1">
                                                        Host: {String(room.owner_id) === tgUserId ? "You" : (room.host_user_name || room.owner_id)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                    {showCreateModal && <CreateRoomModal onClose={() => setShowCreateModal(false)} onCreate={createRoom} />}
                    {selectedRoomToJoin && <JoinRoomModal room={selectedRoomToJoin} onClose={() => setSelectedRoomToJoin(null)} onJoin={joinRoom} />}
                </div>
            );
        };`;


const renderSeatStart = 7372;
const renderSeatEnd = 7421;

const newRenderSeat = `            const renderSeat = (seatNum, occupant, label, isLarge = false) => {
                const isOfflineHost = occupant?.is_offline_host;
                const isMe = String(occupant?.user_id) === currentUserId;
                const volume = activeSpeakers[String(occupant?.user_id)] || 0;
                const isSpeaking = volume > 5;
                const isHostSeat = seatNum === 0;
                const dpUrl = isMe ? (window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url || tgUser.photo_url) : (isOfflineHost ? activeRoom.room_dp_url : occupant?.photo_url);
                const isLocked = lockedSeats[seatNum];
                const isSeatMuted = mutedSeats[seatNum];
                const occupantName = occupant ? (isOfflineHost ? 'Host' : (occupant.user_name || "Unknown")) : (isLocked ? 'Locked' : label);
                const baseScale = isLarge ? 1.05 : 1;

                return (
                    <div onClick={() => handleSeatClick(seatNum, occupant)} className={\`flex flex-col items-center gap-1.5 cursor-pointer \${isLarge ? 'w-[84px]' : 'w-[68px]'}\`} style={{ transform: \`scale(\${isSpeaking ? baseScale + 0.05 : baseScale})\`, transition: 'transform 0.1s ease-out' }}>
                        {occupant ? (
                            <div className="relative w-full aspect-square flex items-center justify-center">
                                {/* WePlay Speaking Ripple */}
                                <div className="absolute inset-0 rounded-full border-[3px] border-[#ff3b8f] pointer-events-none transition-all duration-75 ease-out z-0" style={{ transform: \`scale(\${volume > 0 ? 1.1 + (volume / 100) * 0.25 : 1})\`, opacity: volume > 0 ? 0.6 + (volume / 100) * 0.4 : 0, boxShadow: volume > 0 ? \`0 0 \${20 + (volume / 100) * 30}px rgba(255,59,143,\${0.6 + (volume / 100) * 0.4})\` : 'none' }}></div>
                                
                                <div className={\`relative z-10 w-full h-full rounded-full flex items-center justify-center font-bold bg-[#1a1a24] overflow-hidden border-[3px] \${isSpeaking ? 'border-[#ff3b8f]' : 'border-white'} shadow-lg\`}>
                                    {dpUrl ? <img src={dpUrl} alt="DP" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} /> : null}
                                    <span className={\`w-full h-full flex items-center justify-center text-white \${dpUrl ? 'hidden' : 'flex'} \${isLarge ? 'text-3xl' : 'text-2xl'}\`}>{occupantName.charAt(0).toUpperCase()}</span>
                                </div>
                                
                                {((isMe ? isMuted : occupant.is_muted) || isSeatMuted) && (
                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full w-6 h-6 flex items-center justify-center border-2 border-gray-200 z-20 shadow-md">
                                        <i className="fa-solid fa-microphone-slash text-[10px] text-gray-500"></i>
                                    </div>
                                )}
                                {isHostSeat && (
                                    <div className="absolute -bottom-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black text-[9px] font-black px-2 py-0.5 rounded-full z-20 shadow-[0_2px_5px_rgba(255,215,0,0.5)] border border-white tracking-wider whitespace-nowrap">HOST</div>
                                )}
                            </div>
                        ) : (
                            <div className="relative w-full aspect-square flex items-center justify-center group">
                                <div className="absolute inset-0 rounded-full border-[3px] border-dashed border-white/40 bg-black/30 backdrop-blur-md group-hover:bg-white/20 group-hover:border-white transition-all z-10 flex items-center justify-center shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]">
                                    <i className={\`fa-solid \${isLocked ? 'fa-lock text-white/50 text-lg' : 'fa-plus text-white/80 text-xl drop-shadow-md'}\`}></i>
                                </div>
                                {isSeatMuted && (
                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full w-6 h-6 flex items-center justify-center border-2 border-gray-200 z-20 shadow-md">
                                        <i className="fa-solid fa-microphone-slash text-[10px] text-gray-500"></i>
                                    </div>
                                )}
                            </div>
                        )}
                        <span className="text-[10px] text-center font-bold text-white truncate max-w-[130%] px-2.5 py-0.5 mt-1 bg-black/50 backdrop-blur-md rounded-full shadow-md border border-white/10">{occupantName}</span>
                    </div>
                );
            };`;


const mainLayoutStart = 7430;
const mainLayoutEnd = 7785;

const newMainLayout = `            return (
                <div className="flex-1 flex flex-col relative z-10 bg-[#1A1A24] min-h-screen overflow-hidden">
                    {/* WePlay Full Screen Immersive Background */}
                    <div className="absolute inset-0 z-0 bg-[#1A1A24]">
                        <img src={activeRoom.room_dp_url || "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop"} alt="bg" className="w-full h-full object-cover opacity-80 scale-[1.05]" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none"></div>
                        <div className="absolute inset-0 backdrop-blur-[4px] pointer-events-none"></div>
                    </div>

                    {/* WePlay Top Header */}
                    <div className="px-4 py-3 flex items-center justify-between z-20 relative pt-[calc(30px+env(safe-area-inset-top,0px))]">
                        <div className="flex items-center gap-3">
                            <button onClick={onMinimize} className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90 hover:bg-black/60 transition-colors shadow-lg border border-white/20">
                                <i className="fa-solid fa-chevron-left text-sm"></i>
                            </button>
                            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full pr-3 pl-1 py-1 border border-white/20 shadow-lg">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff3b8f] to-[#9147ff] p-[1px] flex items-center justify-center overflow-hidden">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
                                        {activeRoom.room_dp_url ? <img src={activeRoom.room_dp_url} className="w-full h-full object-cover" /> : <i className="fa-solid fa-hashtag text-white/50 text-xs"></i>}
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-xs font-black text-white leading-tight max-w-[130px] truncate drop-shadow-md">
                                        {activeRoom.channel_name}
                                    </h2>
                                    <p className="text-[9px] text-white/80 font-bold flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-[#00FFFF] rounded-full animate-pulse shadow-[0_0_5px_rgba(0,255,255,0.8)]"></span> {activeRoom.room_type}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20 shadow-lg cursor-pointer hover:bg-black/60 transition-colors" onClick={() => setShowParticipantsModal(true)}>
                                <i className="fa-solid fa-users text-white/90 text-[10px]"></i>
                                <span className="text-[11px] font-black text-white">{(activeRoom.seats_occupied || 0) + (audience?.length || 0)}</span>
                            </div>
                            {isHost && (activeRoom.room_type === 'advance' || activeRoom.room_type === 'permanent') && (
                                <button onClick={() => setShowSettingsModal(true)} className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90 hover:bg-black/60 transition-colors border border-white/20 shadow-lg">
                                    <i className="fa-solid fa-gear text-sm"></i>
                                </button>
                            )}
                            <button onClick={() => { if (!isProcessing) leaveRoom(); }} disabled={isProcessing} className="w-8 h-8 rounded-full bg-red-500/30 backdrop-blur-md flex items-center justify-center text-red-100 hover:bg-red-500/50 transition-colors border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                                <i className="fa-solid fa-power-off text-sm"></i>
                            </button>
                        </div>
                    </div>

                    {activeRoom.announcement && (
                        <div className="mx-4 mt-2 p-3 bg-black/40 rounded-2xl border border-[#FFD700]/50 text-xs text-[#FFD700] backdrop-blur-xl flex items-start gap-2 z-20 relative font-bold shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
                            <i className="fa-solid fa-bullhorn mt-0.5 animate-pulse text-[#FFD700] drop-shadow-[0_0_5px_rgba(255,215,0,0.8)]"></i>
                            <span className="leading-relaxed">{activeRoom.announcement}</span>
                        </div>
                    )}
                    {currentMusic && (
                        <div className="absolute top-[calc(90px+env(safe-area-inset-top,0px))] right-4 bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-xl border border-[#ff3b8f]/50 rounded-full px-4 py-2 flex items-center gap-2 z-20 shadow-[0_0_15px_rgba(255,59,143,0.3)] max-w-[180px]">
                            <div className="w-4 h-4 rounded-full bg-[#ff3b8f] flex items-center justify-center shadow-[0_0_10px_rgba(255,59,143,0.8)]">
                                <i className="fa-solid fa-music text-white animate-pulse text-[8px]"></i>
                            </div>
                            <span className="text-white text-[11px] font-bold truncate drop-shadow-md">{currentMusic.title}</span>
                        </div>
                    )}

                    {/* Main Seats Area */}
                    <div className="w-full flex-1 relative z-10 flex flex-col items-center pt-10 px-4">
                        {activeRoom.room_type === 'advance' || activeRoom.room_type === 'permanent' ? (
                            <>
                                <div className="flex justify-center gap-12 mb-10 w-full max-w-sm">
                                {[0, 1].map(seatNum => {
                                    if (seatNum === 1 && !activeRoom.is_partner_seat_open) return null;
                                    const occupant = participants.find(p => p.seat_number !== null && p.seat_number !== undefined && Number(p.seat_number) === seatNum) ||
                                    (seatNum === 0 && (activeRoom.room_type === 'advance' || activeRoom.room_type === 'permanent') && !participants.some(p => String(p.user_id) === String(activeRoom.host_user_id)) ? { is_offline_host: true, user_id: activeRoom.host_user_id, user_name: "Host" } : undefined);
                                    return renderSeat(seatNum, occupant, seatNum === 0 ? "Take Seat" : "Partner", true);
                                })}
                                </div>
                                <div className="grid grid-cols-4 gap-y-10 gap-x-2 w-full max-w-sm justify-items-center">
                                {[2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                                    <React.Fragment key={i}>
                                        {renderSeat(i, participants.find(p => p.seat_number !== null && p.seat_number !== undefined && Number(p.seat_number) === i), \`Seat \${i}\`)}
                                    </React.Fragment>
                                ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex justify-center gap-x-10 gap-y-12 pt-12 px-6 flex-wrap w-full max-w-sm">
                                {[0, 1, 2, 3].map(i => (
                                    <React.Fragment key={i}>
                                        {renderSeat(i, participants.find(p => p.seat_number !== null && p.seat_number !== undefined && Number(p.seat_number) === i) || (i === 0 && activeRoom.is_offline_host_pinned ? { is_offline_host: true, user_id: activeRoom.host_user_id } : undefined), i === 0 ? "Host" : \`Seat \${i}\`, true)}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Chat Area & Toolbar (WePlay Transparent Style) */}
                    <div className="w-full h-[45vh] mt-auto relative z-20 flex flex-col pt-4">
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none"></div>
                        
                        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4 pt-8 flex flex-col justify-end space-y-3 pointer-events-auto overscroll-contain relative z-10" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%)' }}>
                            {chatMessages.map((msg, idx) => {
                                if (msg.isSystem) {
                                    return (
                                        <div key={idx} className="bg-black/40 backdrop-blur-md rounded-full px-5 py-2 self-center text-center max-w-[85%] border border-white/10 shadow-sm">
                                            <p className="text-[11px] text-[#A4DFE6] font-bold">
                                                <i className="fa-solid fa-bell text-[#00FFFF] mr-1.5"></i> {msg.text}
                                            </p>
                                        </div>
                                    );
                                }
                                const isMeMsg = msg.sender_id === currentUserId;
                                return (
                                    <div key={idx} className="bg-black/40 backdrop-blur-md rounded-2xl rounded-tl-sm px-4 py-2.5 w-max max-w-[85%] self-start border border-white/10 shadow-md">
                                        <div className="flex items-center gap-2 mb-1">
                                            {msg.sender_dp && <img src={msg.sender_dp} className="w-5 h-5 rounded-full object-cover border border-white/20" />}
                                            <span className={\`text-[11px] font-black \${isMeMsg ? 'text-[#00FFFF]' : 'text-[#ff3b8f] drop-shadow-[0_0_2px_rgba(255,59,143,0.5)]'}\`}>{msg.sender_name}</span>
                                        </div>
                                        <p className="text-sm text-white/95 break-words font-medium drop-shadow-sm">{msg.text}</p>
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef} />
                        </div>

                        {/* WePlay Bottom Floating Toolbar */}
                        <div className="px-4 py-3 pb-8 relative z-10 flex items-center gap-3">
                            <form onSubmit={(e) => { e.preventDefault(); if (chatInput.trim()) { sendChat(chatInput); setChatInput(''); } }} className="flex-1">
                                <div className="bg-black/50 backdrop-blur-xl rounded-full px-5 py-3 flex items-center gap-3 border border-white/20 focus-within:border-[#ff3b8f]/80 focus-within:bg-black/60 transition-all shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
                                    <i className="fa-regular fa-comment-dots text-white/60 text-sm"></i>
                                    <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Say something nice..." className="bg-transparent border-none outline-none text-sm text-white placeholder-white/50 flex-1 font-medium" />
                                    <button type="submit" className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00FFFF] to-[#0072FF] text-[#010a17] flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.4)] active:scale-95 transition-transform">
                                        <i className="fa-solid fa-paper-plane text-[11px]"></i>
                                    </button>
                                </div>
                            </form>
                            
                            <button onClick={() => { if (isSpeaker) toggleMute(); else safeAlert("You must take a seat to speak."); }} className={\`w-12 h-12 rounded-full flex items-center justify-center shrink-0 backdrop-blur-xl border border-white/20 shadow-xl transition-all active:scale-90 \${!isSpeaker ? 'bg-black/50 text-white/30' : isMuted ? 'bg-white text-black' : 'bg-gradient-to-br from-[#ff3b8f] to-[#9147ff] text-white shadow-[0_0_20px_rgba(255,59,143,0.5)]'}\`}>
                                <i className={\`fa-solid \${isMuted || !isSpeaker ? 'fa-microphone-slash' : 'fa-microphone'} text-lg\`}></i>
                            </button>
                            
                            <button onClick={() => safeAlert("Gifts coming soon!")} className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF8C00] text-black flex items-center justify-center shrink-0 backdrop-blur-xl shadow-[0_5px_20px_rgba(255,215,0,0.5)] transition-transform active:scale-90 border border-white/50">
                                <i className="fa-solid fa-gift text-lg animate-[wiggle_2s_ease-in-out_infinite]"></i>
                            </button>
                        </div>
                    </div>`;


lines.splice(mainLayoutStart, mainLayoutEnd - mainLayoutStart + 1, newMainLayout); 
lines.splice(renderSeatStart, renderSeatEnd - renderSeatStart + 1, newRenderSeat); 
lines.splice(vTabStart, vTabEnd - vTabStart, newVoiceRoomsTab); 

fs.writeFileSync('index.html', lines.join('\n'));
console.log('Successfully refactored entire VC tab to 1:1 WePlay Replica.');
