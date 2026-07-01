const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

const vTabStart = lines.findIndex(l => l.includes('const VoiceRoomsTab = ({ tgUser, voiceState }) => {'));
const vTabEnd = lines.findIndex((l, i) => i > vTabStart && l.includes('const RoomSettingsModal = ({'));
if (vTabStart === -1 || vTabEnd === -1) {
    console.error('Could not find VoiceRoomsTab');
    process.exit(1);
}

const newVoiceRoomsTab = `        const VoiceRoomsTab = ({ tgUser, voiceState }) => {
            const { activeRoom, leaveRoom, availableRooms, fetchRooms, createRoom, joinRoom, isProcessing } = voiceState;
            const [showCreateModal, setShowCreateModal] = useState(false);
            const [selectedRoomToJoin, setSelectedRoomToJoin] = useState(null);
            const [isRefreshing, setIsRefreshing] = useState(false);
            const [dashboardFilter, setDashboardFilter] = useState('All');

            const tgUserId = String(window.Telegram?.WebApp?.initDataUnsafe?.user?.id || tgUser?.id || "1001");
            const verifiedUserId = "5182808926";
            
            const officialRoom = availableRooms.find(r => String(r.owner_id) === verifiedUserId && (r.room_type === 'permanent' || r.room_type === 'advance'));
            // Only show official room if seats are occupied (meaning someone, likely host, is in it)
            const isOfficialRoomLive = officialRoom && officialRoom.seats_occupied > 0;

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

            let displayRooms = availableRooms.filter(room => {
                if (officialRoom && room.id === officialRoom.id && !isOfficialRoomLive) return false; // Hide if not live
                return true;
            });

            return (
                <div className="pb-[80px] animate-in fade-in flex flex-col h-full bg-white text-black font-sans">
                    {/* Top Navigation WePlay Style */}
                    <div className="flex items-center justify-between px-5 pt-4 pb-2 bg-white sticky top-0 z-20">
                        <div className="flex gap-6 items-baseline">
                            <h2 className="text-gray-400 font-bold text-lg cursor-pointer">Related</h2>
                            <h2 className="text-black font-black text-2xl cursor-pointer">All</h2>
                            <h2 className="text-gray-400 font-bold text-lg cursor-pointer">Popular</h2>
                        </div>
                        <div className="flex gap-4 items-center">
                            <i className="fa-solid fa-magnifying-glass text-xl text-black cursor-pointer" onClick={() => {
                                const id = prompt("Enter Room ID to join:");
                                if (id) {
                                    const r = availableRooms.find(rm => String(rm.id) === id);
                                    if (r) handleJoinClick(r);
                                    else safeAlert("Room not found!");
                                }
                            }}></i>
                            <div onClick={() => setShowCreateModal(true)} className="w-8 h-8 rounded-full bg-[#00D8D6] flex items-center justify-center cursor-pointer active:scale-95 transition-transform shadow-md">
                                <i className="fa-solid fa-plus text-white text-lg"></i>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-10">
                        
                        {/* WePlay Banner */}
                        <div className="w-full h-32 rounded-3xl mt-2 mb-4 overflow-hidden shadow-lg relative bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]">
                            <img src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                <h1 className="text-white text-4xl font-black italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wider">Gold Tycoon</h1>
                                <p className="text-white font-bold text-xs mt-1 bg-black/30 px-3 py-0.5 rounded-full backdrop-blur-sm border border-white/20">Recharge Bonus & Surprise Rewards!</p>
                            </div>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-white"></span>
                                <span className="w-2 h-2 rounded-full bg-white/40"></span>
                                <span className="w-2 h-2 rounded-full bg-white/40"></span>
                                <span className="w-2 h-2 rounded-full bg-white/40"></span>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex gap-6 overflow-x-auto no-scrollbar py-2 mb-2 items-center">
                            {['All', 'Friends', 'PK', 'Music', 'Video', 'Game'].map(filter => (
                                <span key={filter} onClick={() => setDashboardFilter(filter)} className={\`cursor-pointer whitespace-nowrap font-bold text-[15px] pb-1 \${dashboardFilter === filter ? 'text-[#00D8D6] border-b-2 border-[#00D8D6]' : 'text-gray-400'}\`}>
                                    {filter}
                                </span>
                            ))}
                        </div>

                        {/* Room List (WePlay List Style) */}
                        <div className="space-y-5 mt-2">
                            {displayRooms.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-400 font-bold">No trending rooms right now</p>
                                </div>
                            ) : (
                                displayRooms.map(room => {
                                    const isOfficial = room.id === officialRoom?.id;
                                    const dpUrl = room.room_dp_url || \`https://picsum.photos/seed/\${room.id}/200\`;
                                    
                                    return (
                                        <div key={room.id} onClick={() => handleJoinClick(room)} className="flex items-center gap-4 cursor-pointer active:bg-gray-50 p-2 rounded-xl transition-colors">
                                            {/* Avatar Square */}
                                            <div className="relative w-16 h-16 shrink-0">
                                                <img src={dpUrl} className="w-full h-full object-cover rounded-[1.2rem] shadow-sm" />
                                                {isOfficial && (
                                                    <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm border border-white">OFFICIAL</div>
                                                )}
                                                {room.password && (
                                                    <div className="absolute top-1 right-1 bg-black/60 rounded-full w-4 h-4 flex items-center justify-center backdrop-blur-sm">
                                                        <i className="fa-solid fa-lock text-white text-[8px]"></i>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 text-lg truncate flex items-center gap-1.5">
                                                    {room.channel_name}
                                                    {isOfficial && <i className="fa-solid fa-circle-check text-blue-500 text-sm"></i>}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full \${isOfficial ? 'bg-red-50 text-red-500' : 'bg-[#E5F9F9] text-[#00D8D6]'}\`}>
                                                        {isOfficial ? 'Event' : (room.room_type === 'advance' ? 'Friends' : 'Chats')}
                                                    </span>
                                                    <span className="text-gray-400 text-[11px] font-bold flex items-center gap-1">
                                                        <i className="fa-solid fa-user"></i> {room.seats_occupied || 0}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Badges/Icons on Right */}
                                            <div className="flex items-center gap-1 shrink-0">
                                                {isOfficial ? (
                                                    <>
                                                        <img src="https://cdn-icons-png.flaticon.com/512/5738/5738077.png" className="w-5 h-5 object-contain" />
                                                        <img src="https://cdn-icons-png.flaticon.com/512/2850/2850785.png" className="w-5 h-5 object-contain" />
                                                        <img src="https://cdn-icons-png.flaticon.com/512/2583/2583344.png" className="w-5 h-5 object-contain" />
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center"><i className="fa-solid fa-shield-cat text-blue-500 text-[10px]"></i></div>
                                                        <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center"><i className="fa-solid fa-microphone text-purple-500 text-[10px]"></i></div>
                                                        <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center"><i className="fa-solid fa-bullseye text-orange-500 text-[10px]"></i></div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Bottom Nav Placeholder - Just visual to match WePlay screenshot */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)] z-20 flex justify-between px-6 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                        <div className="flex flex-col items-center gap-1 text-gray-400 cursor-not-allowed">
                            <i className="fa-solid fa-gamepad text-xl"></i>
                            <span className="text-[10px] font-bold">WePlay</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 text-[#00D8D6]">
                            <i className="fa-solid fa-house text-xl"></i>
                            <span className="text-[10px] font-bold">Voice Room</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 text-gray-400 cursor-not-allowed relative">
                            <i className="fa-regular fa-comments text-xl"></i>
                            <span className="text-[10px] font-bold">Chats</span>
                            <div className="absolute -top-1 -right-2 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">34</div>
                        </div>
                        <div className="flex flex-col items-center gap-1 text-gray-400 cursor-not-allowed relative">
                            <i className="fa-regular fa-compass text-xl"></i>
                            <span className="text-[10px] font-bold">Discover</span>
                            <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 border border-white"></div>
                        </div>
                        <div className="flex flex-col items-center gap-1 text-gray-400 cursor-not-allowed">
                            <i className="fa-regular fa-user text-xl"></i>
                            <span className="text-[10px] font-bold">Me</span>
                        </div>
                    </div>

                    {showCreateModal && <CreateRoomModal onClose={() => setShowCreateModal(false)} onCreate={createRoom} />}
                    {selectedRoomToJoin && <JoinRoomModal room={selectedRoomToJoin} onClose={() => setSelectedRoomToJoin(null)} onJoin={joinRoom} />}
                </div>
            );
        };`;

lines.splice(vTabStart, vTabEnd - vTabStart, newVoiceRoomsTab);
fs.writeFileSync('index.html', lines.join('\n'));
console.log('Successfully applied WePlay VoiceRoomsTab.');
