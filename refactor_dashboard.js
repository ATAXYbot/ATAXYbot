const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

const newVoiceRoomsTab = `        const VoiceRoomsTab = ({ tgUser, voiceState }) => {
            const { activeRoom, leaveRoom, availableRooms, fetchRooms, createRoom, joinRoom, isProcessing } = voiceState;
            const [showCreateModal, setShowCreateModal] = useState(false);
            const [selectedRoomToJoin, setSelectedRoomToJoin] = useState(null);
            const [isRefreshing, setIsRefreshing] = useState(false);
            const [dashboardFilter, setDashboardFilter] = useState('active');

            const tgUserId = String(window.Telegram?.WebApp?.initDataUnsafe?.user?.id || tgUser?.id || "1001");
            const verifiedUserId = "5182808926";
            
            // The official room is the permanent room owned by the verified user.
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
                    // Hide official room from generic list
                    if (officialRoom && room.id === officialRoom.id) return false;
                    return true;
                });
            } else {
                displayRooms = [];
            }

            return (
                <div className="pb-[80px] animate-in fade-in flex flex-col h-full bg-[#010a17] text-white">
                    <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                        {/* ATAXY OFFICIAL ROOM BANNER */}
                        {officialRoom && officialRoom.seats_occupied > 0 && (
                            <div className="relative mx-4 mt-6 p-[2px] rounded-[1.5rem] bg-gradient-to-br from-[#00FFFF] via-blue-500 to-purple-600 shadow-[0_10px_30px_rgba(0,255,255,0.3)] group overflow-hidden">
                                <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none"></div>
                                <div className="relative bg-gradient-to-br from-[#021633] to-[#010a17] rounded-[1.4rem] p-5 flex flex-col gap-4 overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FFFF]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-[#00FFFF] to-blue-600 shadow-[0_0_15px_rgba(0,255,255,0.5)]">
                                            <div className="w-full h-full rounded-full bg-[#021633] flex items-center justify-center overflow-hidden border-2 border-[#021633]">
                                                {officialRoom.room_dp_url ? <img src={officialRoom.room_dp_url} className="w-full h-full object-cover" /> : <AtaxyLogo className="w-10 h-10" />}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-xl font-black text-white flex items-center gap-1.5 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] uppercase tracking-wide">
                                                {officialRoom.channel_name} <VerifiedBadge className="w-4 h-4 shadow-sm" />
                                            </h2>
                                            <p className="text-[10px] font-bold text-[#00FFFF]/80 flex items-center gap-1.5 mt-1">
                                                Room ID: {officialRoom.id} <span className="text-white/30">•</span> Permanent Voice Lounge
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleJoinClick(officialRoom)} className="w-full py-3.5 bg-gradient-to-r from-[#00FFFF] to-blue-500 hover:from-[#00FFFF] hover:to-blue-400 text-[#010a17] rounded-xl font-black text-sm uppercase tracking-widest shadow-[0_5px_15px_rgba(0,255,255,0.4)] transition-all flex items-center justify-center gap-2 relative z-10 active:scale-[0.98]">
                                        <i className="fa-solid fa-satellite-dish animate-pulse"></i> Join Official Room
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 px-4 mt-6">
                            <button onClick={() => setShowCreateModal(true)} className="flex-1 bg-[#021633] border border-[#00FFFF]/30 hover:bg-[#00FFFF]/10 py-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
                                <i className="fa-solid fa-plus text-[#00FFFF] text-xl"></i>
                                <span className="text-[10px] font-black text-white uppercase tracking-wider">Create Voice Room</span>
                            </button>
                            <button onClick={() => {
                                const id = prompt("Enter Room ID to join:");
                                if (id) {
                                    const r = availableRooms.find(rm => String(rm.id) === id);
                                    if (r) handleJoinClick(r);
                                    else safeAlert("Room not found!");
                                }
                            }} className="flex-1 bg-[#021633] border border-[#00FFFF]/30 hover:bg-[#00FFFF]/10 py-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
                                <i className="fa-solid fa-hashtag text-[#00FFFF] text-xl"></i>
                                <span className="text-[10px] font-black text-white uppercase tracking-wider">Join By ID</span>
                            </button>
                        </div>

                        {/* Live Rooms Section */}
                        <div className="px-4 mt-8 flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black text-white flex items-center gap-2 tracking-wide">
                                Live Rooms <span className="bg-[#00FFFF] text-[#010a17] text-[10px] px-2 py-0.5 rounded-full font-black shadow-[0_0_10px_rgba(0,255,255,0.3)]">{displayRooms.length}</span>
                            </h3>
                            <button onClick={handleRefresh} className="text-[#00FFFF] hover:text-white transition-colors p-2">
                                <i className={\`fa-solid fa-sync-alt \${isRefreshing ? 'animate-spin' : ''}\`}></i>
                            </button>
                        </div>

                        <div className="px-4 space-y-3">
                            {displayRooms.length === 0 ? (
                                <div className="text-center py-10 bg-[#021633] rounded-2xl border border-white/5">
                                    <i className="fa-solid fa-microphone-slash text-3xl text-gray-600 mb-3 block"></i>
                                    <p className="text-gray-400 font-bold text-sm">No live rooms right now.</p>
                                </div>
                            ) : (
                                displayRooms.map(room => (
                                    <div key={room.id} onClick={() => handleJoinClick(room)} className={\`bg-gradient-to-r from-[#021633] to-[#010a17] rounded-[1.2rem] p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-all border border-white/5 shadow-md relative overflow-hidden group \${isProcessing ? 'opacity-50 pointer-events-none' : ''}\`}>
                                        <div className="w-14 h-14 rounded-2xl bg-[#00FFFF]/10 flex items-center justify-center font-bold text-[#00FFFF] text-xl border border-[#00FFFF]/20 relative shrink-0">
                                            {room.room_dp_url ? <img src={room.room_dp_url} className="w-full h-full object-cover rounded-2xl" /> : room.channel_name.charAt(0).toUpperCase()}
                                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#021633] animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-base text-white truncate flex items-center gap-2">
                                                {room.channel_name}
                                                {room.password && <i className="fa-solid fa-lock text-gray-500 text-[10px]"></i>}
                                            </h3>
                                            <p className="text-[10px] text-gray-400 font-medium truncate mb-1">
                                                Host: {String(room.host_user_id) === verifiedUserId ? "ATAXY" : (String(room.owner_id) === tgUserId ? "You" : room.owner_id)}
                                            </p>
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-[#00FFFF]">
                                                <i className="fa-solid fa-headphones"></i> {room.seats_occupied || 0}/12
                                            </div>
                                        </div>
                                        <button className="px-5 py-2 rounded-full bg-[#00FFFF]/10 text-[#00FFFF] border border-[#00FFFF]/30 text-xs font-black uppercase tracking-wider group-hover:bg-[#00FFFF] group-hover:text-[#010a17] transition-all shrink-0 shadow-sm">
                                            Join
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    {showCreateModal && <CreateRoomModal onClose={() => setShowCreateModal(false)} onCreate={createRoom} />}
                    {selectedRoomToJoin && <JoinRoomModal room={selectedRoomToJoin} onClose={() => setSelectedRoomToJoin(null)} onJoin={joinRoom} />}
                </div>
            );
        };`;

lines.splice(7088, 149, newVoiceRoomsTab); // From VoiceRoomsTab starts at line: 7089

// Now for temporary room layout
const newTemporaryRoomLayout = `                        ) : (
                            <div className="grid grid-cols-2 gap-y-12 gap-x-8 justify-items-center pt-10 px-8">
                                {[0, 1, 2, 3].map(i => (
                                    <React.Fragment key={i}>
                                        {renderSeat(i, participants.find(p => p.seat_number !== null && p.seat_number !== undefined && Number(p.seat_number) === i) || (i === 0 && activeRoom.is_offline_host_pinned ? { is_offline_host: true, user_id: activeRoom.host_user_id } : undefined), i === 0 ? "Host" : \`Seat \${i}\`, true)}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>`;

// Wait, the line numbers for temporary layout have shifted because we spliced VoiceRoomsTab!
// 149 lines deleted, but newVoiceRoomsTab has how many lines?
fs.writeFileSync('index.html', lines.join('\n'));
console.log('VoiceRoomsTab updated successfully.');
