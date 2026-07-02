const renderDashboard = () => {
    if (currentView === 'chats') {
        return (
            <div className="pb-[80px] animate-in fade-in flex flex-col h-full bg-[#010B1C] text-white">
                <div className="flex-1 overflow-hidden relative">
                    <VCPersonalChats friends={friends} pendingRequests={pendingRequests} sentRequests={sentRequests} dms={dms} currentUserId={currentUserId} currentUserName={currentUserName} currentUserPhoto={currentUserPhoto} activeChatUser={activeChatUser} setActiveChatUser={setActiveChatUser} acceptFriendRequest={acceptFriendRequest} rejectFriendRequest={rejectFriendRequest} sendPrivateDM={sendPrivateDM} sendDirectMessage={sendDirectMessage} chatActions={chatActions} handleAvatarClick={handleAvatarClick} syncFriendStatus={syncFriendStatus} markChatAsRead={markChatAsRead} deleteChatHistory={deleteChatHistory} removeFriend={removeFriend} cancelFriendRequest={cancelFriendRequest} sendFriendRequest={sendFriendRequest} handlePrivateAction={handlePrivateAction} handleLocalDelete={handleLocalDelete} acceptAllFriendRequests={acceptAllFriendRequests} rejectAllFriendRequests={rejectAllFriendRequests} onNavigate={onNavigate} markEphemeralAsViewed={markEphemeralAsViewed} />
                </div>
            </div>
        );
    }

    // Prepare rooms array including the Official Room
    const officialRoomObj = {
        id: '2431',
        room_name: 'ATAXY Official Room',
        channel_name: 'ATAXY Official Room',
        host_user_id: '5182808926',
        owner_id: '5182808926',
        room_type: 'permanent',
        is_live: true,
        host_name: 'ATAXY',
        total_capacity: 12,
        is_official: true
    };
    
    // Mix official room in if not already present
    const displayRooms = sortedActiveRooms.some(r => r.id === '2431') ? sortedActiveRooms : [officialRoomObj, ...sortedActiveRooms];

    return (
        <div className="pb-[80px] animate-in fade-in flex flex-col h-full bg-white dark:bg-[#010714] text-black dark:text-white space-y-0">
            {/* Top Navigation Bar - WePlay Style */}
            <div className="flex items-center justify-between px-4 pt-[calc(16px+var(--tg-safe-area-inset-top,env(safe-area-inset-top,0px)))] pb-3 bg-white dark:bg-[#010714] z-10 shrink-0">
                <div className="flex items-end gap-5">
                    <span className="text-[17px] font-bold text-gray-400">Related</span>
                    <span className="text-[22px] font-black text-black dark:text-white leading-none">All</span>
                    <span className="text-[17px] font-bold text-gray-400">Popular</span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setShowJoinModal(true)} className="text-black dark:text-white transition-transform active:scale-90">
                        <i className="fa-solid fa-magnifying-glass text-xl"></i>
                    </button>
                    <button onClick={() => { setVcCreateName(`${currentUserName}'s Room`); setShowVCCreateModal(true); }} className="w-8 h-8 rounded-full bg-[#00e5ff] text-white flex items-center justify-center transition-transform active:scale-90 shadow-md">
                        <i className="fa-solid fa-plus text-xl font-bold"></i>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col pb-6">
                {/* Banner Section - WePlay Style */}
                <div className="px-4 py-2 shrink-0">
                    <div className="w-full h-[100px] rounded-2xl relative overflow-hidden bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-600 shadow-lg flex items-center p-4">
                        {/* Decorative elements for the banner */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-300 rounded-full blur-xl opacity-40"></div>
                        
                        <div className="relative z-10">
                            <h2 className="text-white text-3xl font-black italic drop-shadow-md tracking-wider">Gold <span className="text-yellow-200">Tycoon</span></h2>
                            <p className="text-white/90 text-xs font-bold mt-1 drop-shadow-sm">Recharge Bonus & Surprise Rewards!</p>
                        </div>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                            <div className="w-4 h-1.5 rounded-full bg-white"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
                        </div>
                    </div>
                </div>

                {/* Categories Header like WePlay */}
                <div className="flex items-center gap-6 px-4 py-3 overflow-x-auto no-scrollbar border-b border-gray-100 dark:border-white/5 mb-2 sticky top-0 bg-white dark:bg-[#010714] z-10 shadow-sm">
                    <div className="flex flex-col items-center gap-1 shrink-0 cursor-pointer">
                        <span className="text-[15px] font-black text-black dark:text-white">All</span>
                        <div className="w-6 h-1 rounded-full bg-[#00e5ff]"></div>
                    </div>
                    <div className="text-[15px] font-bold text-gray-400 shrink-0 cursor-pointer hover:text-black dark:hover:text-white transition-colors">Friends</div>
                    <div className="text-[15px] font-bold text-gray-400 shrink-0 cursor-pointer hover:text-black dark:hover:text-white transition-colors">PK</div>
                    <div className="text-[15px] font-bold text-gray-400 shrink-0 cursor-pointer hover:text-black dark:hover:text-white transition-colors">Music</div>
                    <div className="text-[15px] font-bold text-gray-400 shrink-0 cursor-pointer hover:text-black dark:hover:text-white transition-colors">Video</div>
                    <div className="text-[15px] font-bold text-gray-400 shrink-0 cursor-pointer hover:text-black dark:hover:text-white transition-colors">Game</div>
                    <div className="text-[15px] font-bold text-gray-400 shrink-0 cursor-pointer hover:text-black dark:hover:text-white transition-colors">Chat</div>
                </div>

                {/* Pull to refresh equivalent action - Hidden but functional via button earlier, WePlay does swipe-to-refresh but we can just auto-refresh */}
                
                {/* Active Rooms List - WePlay exact replica */}
                <div className="px-4 space-y-1">
                    {displayRooms.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
                                <i className="fa-solid fa-microphone-slash text-gray-400 text-2xl opacity-80"></i>
                            </div>
                            <p className="text-gray-500 font-bold">No active rooms right now.</p>
                            <p className="text-gray-400 text-xs mt-1">Tap + to start a room!</p>
                        </div>
                    ) : (
                        displayRooms.map(room => (
                            <div key={room.id} onClick={() => {
                                if (room.is_official) {
                                    if(voiceState && voiceState.joinRoom) voiceState.joinRoom(room);
                                    else safeAlert("Voice service is unavailable.");
                                } else if (room.password) { 
                                    setRoomToJoinWithPassword(room); 
                                } else { 
                                    joinRoom(room); 
                                }
                            }} className="bg-transparent py-3 flex flex-row gap-3 items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all group border-b border-gray-50 dark:border-white/5 last:border-0">
                                
                                {/* Left: Avatar (Squircle WePlay style) */}
                                <div className="relative w-[60px] h-[60px] shrink-0">
                                    <div className="w-full h-full rounded-[20px] bg-gray-200 dark:bg-[#021A40] bg-cover bg-center text-gray-600 dark:text-[#00FFFF] font-black text-2xl flex items-center justify-center border border-gray-200 dark:border-[#0AE0D0]/20 overflow-hidden shadow-sm" style={room.host_photo ? { backgroundImage: `url(${room.host_photo})` } : (room.is_official ? { background: 'linear-gradient(135deg, #00FFFF, #0072FF)' } : {})}>
                                        {room.is_official && !room.host_photo ? <i className="fa-solid fa-bolt text-white"></i> : (!room.host_photo && (room.host_name ? room.host_name[0].toUpperCase() : 'H'))}
                                    </div>
                                    {room.is_official && (
                                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-[2px] border-white dark:border-[#010714] shadow-sm"></div>
                                    )}
                                </div>

                                {/* Center: Info */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h4 className="text-[16px] font-black text-black dark:text-white/95 leading-tight truncate mb-1.5 flex items-center gap-1.5">
                                        {room.password && <i className="fa-solid fa-lock text-[#FF007F] text-[11px] shrink-0"></i>}
                                        {room.room_name}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        {room.is_official ? (
                                            <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-500 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0">
                                                <i className="fa-solid fa-headphones text-[9px]"></i> Official
                                            </span>
                                        ) : (
                                            <span className="bg-[#e0f7fa] dark:bg-cyan-500/20 text-[#00b8d4] dark:text-cyan-400 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0">
                                                <i className="fa-solid fa-music text-[9px]"></i> {room.room_type === 'permanent' ? 'Study' : 'Music'}
                                            </span>
                                        )}
                                        <span className="text-[11px] text-gray-400 flex items-center gap-1 font-semibold truncate">
                                            <i className="fa-solid fa-user text-[9px]"></i> {room.total_capacity || (room.is_official ? '∞' : 1)}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Right: Badges (WePlay style) */}
                                <div className="shrink-0 flex items-center gap-1">
                                    {room.is_official ? (
                                        <>
                                            <div className="w-5 h-5 rounded flex items-center justify-center text-yellow-500">
                                                <i className="fa-solid fa-shield-halved text-[14px]"></i>
                                            </div>
                                            <div className="w-5 h-5 rounded flex items-center justify-center text-[#00e5ff]">
                                                <i className="fa-solid fa-certificate text-[14px]"></i>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-5 h-5 flex items-center justify-center text-yellow-500 drop-shadow-sm">
                                                <i className="fa-solid fa-ranking-star text-[14px]"></i>
                                            </div>
                                            <div className="w-5 h-5 flex items-center justify-center text-orange-400 drop-shadow-sm">
                                                <i className="fa-solid fa-award text-[14px]"></i>
                                            </div>
                                            <div className="w-5 h-5 flex items-center justify-center text-[#ff6b6b] drop-shadow-sm">
                                                <i className="fa-solid fa-medal text-[14px]"></i>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modals remain mostly the same structurally */}
            {showJoinModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[200] animate-in fade-in">
                    <div className="bg-white dark:bg-[#021633] p-6 rounded-3xl w-full max-w-sm text-black dark:text-white border border-gray-200 dark:border-[#0AE0D0]/30 shadow-2xl">
                        <h3 className="text-xl font-black mb-4 text-[#00e5ff]">Enter 5-digit Room ID</h3>
                        <input type="number" value={joinRoomId} onChange={e => setJoinRoomId(e.target.value)} placeholder="e.g. 12345" className="w-full bg-gray-50 dark:bg-[#010B1C] border border-gray-200 dark:border-[#0AE0D0]/30 p-4 rounded-xl mb-6 text-xl text-center font-black tracking-[0.5em] focus:outline-none focus:border-[#00e5ff]" />
                        <div className="flex gap-3">
                            <button onClick={() => setShowJoinModal(false)} className="flex-1 bg-gray-100 dark:bg-[#010B1C] py-3 rounded-xl font-bold border border-gray-200 dark:border-gray-700">Cancel</button>
                            <button onClick={() => joinRoomBy5Digit(joinRoomId)} className="flex-1 bg-[#00e5ff] text-white dark:text-[#010B1C] py-3 rounded-xl font-black shadow-[0_4px_15px_rgba(0,229,255,0.4)]">Join</button>
                        </div>
                    </div>
                </div>
            )}

            {roomToJoinWithPassword && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[300] animate-in fade-in" onClick={() => setRoomToJoinWithPassword(null)}>
                    <div className="bg-white dark:bg-[#021633] p-6 rounded-3xl w-full max-w-sm text-black dark:text-white border border-gray-200 dark:border-[#0AE0D0]/30 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-black mb-2 text-[#00e5ff]"><i className="fa-solid fa-lock mr-2"></i>Private Room</h3>
                        <p className="text-sm text-gray-500 dark:text-[#A4DFE6] mb-4">Enter the password to join <strong>{roomToJoinWithPassword.room_name}</strong></p>
                        <input type="text" value={joinPasswordInput} onChange={e => setJoinPasswordInput(e.target.value)} placeholder="Password" className="w-full bg-gray-50 dark:bg-[#010B1C] border border-gray-200 dark:border-[#0AE0D0]/30 p-4 rounded-xl mb-6 focus:outline-none focus:border-[#00e5ff]" />
                        <div className="flex gap-3">
                            <button onClick={() => setRoomToJoinWithPassword(null)} className="flex-1 bg-gray-100 dark:bg-[#010B1C] py-3 rounded-xl font-bold border border-gray-200 dark:border-gray-700">Cancel</button>
                            <button onClick={() => {
                                if (joinPasswordInput === roomToJoinWithPassword.password) {
                                    joinRoom(roomToJoinWithPassword);
                                    setRoomToJoinWithPassword(null);
                                    setJoinPasswordInput('');
                                } else { safeAlert("Incorrect password."); }
                            }} className="flex-1 bg-[#00e5ff] text-white dark:text-[#010B1C] py-3 rounded-xl font-black shadow-[0_4px_15px_rgba(0,229,255,0.4)]">Join</button>
                        </div>
                    </div>
                </div>
            )}

            {showVCCreateModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[200] animate-in fade-in">
                    <div className="bg-white dark:bg-[#021633] p-6 rounded-3xl w-full max-w-sm text-black dark:text-white border border-gray-200 dark:border-[#0AE0D0]/30 shadow-2xl">
                        <h3 className="text-xl font-black mb-4 text-[#00e5ff]">Create Voice Lounge</h3>
                        <label className="text-xs text-gray-500 dark:text-[#A4DFE6] font-bold uppercase tracking-wider mb-1 block">Room Name</label>
                        <input type="text" value={vcCreateName} onChange={e => setVcCreateName(e.target.value)} placeholder={`${currentUserName}'s Room`} className="w-full bg-gray-50 dark:bg-[#010B1C] border border-gray-200 dark:border-[#0AE0D0]/30 p-3 rounded-xl mb-4 focus:outline-none focus:border-[#00e5ff]" />
                        <label className="text-xs text-gray-500 dark:text-[#A4DFE6] font-bold uppercase tracking-wider mb-1 block">Room Type</label>
                        <div className="flex gap-2 mb-4">
                            <button type="button" className="flex-1 py-2 rounded-xl text-sm font-bold transition-all border bg-[#00e5ff]/10 dark:bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff]">Temporary</button>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-xs text-gray-500 dark:text-[#A4DFE6] font-bold uppercase tracking-wider cursor-pointer" onClick={() => setVcCreatePassEnabled(!vcCreatePassEnabled)}>Enable Password</label>
                            <div
                                onClick={() => { setVcCreatePassEnabled(!vcCreatePassEnabled); if (vcCreatePassEnabled) setVcCreatePass(''); }}
                                className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 shadow-inner ${vcCreatePassEnabled ? 'bg-[#00e5ff]' : 'bg-gray-200 dark:bg-[#010B1C] border border-gray-300 dark:border-[#0AE0D0]/30'}`}
                            >
                                <div className={`w-4 h-4 rounded-full transition-transform duration-300 shadow-md ${vcCreatePassEnabled ? 'bg-white dark:bg-[#010B1C] translate-x-6' : 'bg-white dark:bg-gray-500 translate-x-0'}`}></div>
                            </div>
                        </div>
                        {vcCreatePassEnabled && (
                            <input type="text" inputMode="numeric" pattern="\d*" maxLength="4" value={vcCreatePass} onChange={e => setVcCreatePass(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="Enter 4-digit password" className="w-full bg-gray-50 dark:bg-[#010B1C] border border-gray-200 dark:border-[#0AE0D0]/30 p-3 rounded-xl mb-4 text-center text-xl tracking-[0.5em] font-black focus:outline-none focus:border-[#00e5ff] placeholder:tracking-normal placeholder:font-normal placeholder:text-sm" />
                        )}
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowVCCreateModal(false)} className="flex-1 bg-gray-100 dark:bg-[#010B1C] py-3 rounded-xl font-bold border border-gray-200 dark:border-gray-700">Cancel</button>
                            <button onClick={executeCreateRoom} disabled={isCreating} className="flex-1 bg-[#00e5ff] text-white dark:text-[#010B1C] py-3 rounded-xl font-black shadow-[0_4px_15px_rgba(0,229,255,0.4)] disabled:opacity-50">{isCreating ? 'Creating...' : 'Create'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
