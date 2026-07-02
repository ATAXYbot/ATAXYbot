const renderActiveRoom = () => (
    <div className="fixed inset-0 z-[2000000] bg-[#1a1b21] text-white flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 font-sans" onClick={() => setShowRoomMenu(false)}>
        {/* Hide default navigation if any */}
        <style>{`div.fixed.bottom-0.w-full.md\\:max-w-screen-xl.max-w-md.glass-panel { display: none !important; }`}</style>
        
        {/* Top Header */}
        <div className="shrink-0 flex justify-between items-center px-4 py-3 pt-[calc(12px+max(env(safe-area-inset-top),_24px))] z-20">
            <div className="flex items-center gap-3 overflow-hidden flex-1">
                <button onClick={() => { setIsMinimized(true); }} className="text-white hover:text-gray-300 transition-colors">
                    <i className="fa-solid fa-angle-left text-2xl font-bold"></i>
                </button>
                <div className="flex items-center bg-black/30 rounded-full px-3 py-1 gap-2 cursor-pointer active:scale-95" onClick={() => handleCopy(activeRoom.room_id_5_digit, 'Room ID')}>
                    <span className="text-[13px] font-bold truncate max-w-[100px]">{activeRoom.room_name}</span>
                    <span className="text-[10px] text-gray-300">ID: {activeRoom.room_id_5_digit}</span>
                </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => setShowRoomRequestsInbox(true)} className="relative text-white hover:text-gray-300 transition-colors">
                    <i className="fa-solid fa-bell text-lg"></i>
                    {pendingRequests.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border border-[#1a1b21]">{pendingRequests.length}</span>}
                </button>
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-black/30 text-[10px] font-bold text-white">
                    {totalParticipants}
                </div>
                <div className="relative">
                    <button onClick={(e) => { e.stopPropagation(); setShowRoomMenu(!showRoomMenu); }} className="text-white hover:text-gray-300 transition-colors">
                        <i className="fa-solid fa-ellipsis text-lg"></i>
                    </button>
                    {showRoomMenu && (
                        <div className="absolute right-0 top-full mt-2 bg-[#2a2b33] border border-white/10 rounded-xl shadow-xl p-2 z-[3000] flex flex-col min-w-[120px]" onClick={e => e.stopPropagation()}>
                            {isHost && (
                                <button onClick={() => { setShowRoomMenu(false); setShowRoomSettingsModal(true); }} className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors text-left text-sm text-white font-bold">
                                    <i className="fa-solid fa-gear w-5 text-center"></i> Settings
                                </button>
                            )}
                            <button onClick={() => { setShowRoomMenu(false); safeAlert("Room reported."); }} className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors text-left text-sm text-white font-bold">
                                <i className="fa-solid fa-flag w-5 text-center"></i> Report
                            </button>
                            <button onClick={() => { setShowRoomMenu(false); handleExitRoom(); }} className="flex items-center gap-3 p-3 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors text-left text-sm font-bold mt-1">
                                <i className="fa-solid fa-power-off w-5 text-center"></i> Exit
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Central Host Area */}
        <div className="flex flex-col items-center mt-2 z-10 shrink-0">
            <div className="relative">
                <div className="w-[80px] h-[80px] rounded-full border-[2.5px] border-[#D4AF37] bg-[#2a2b33] flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                    {seats[0]?.user_id ? (
                        <img src={seats[0].photo_url || ''} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-[#1a1b21] flex items-center justify-center">
                            <i className="fa-solid fa-plus text-gray-500"></i>
                        </div>
                    )}
                </div>
                {/* Host label or Speaking indicator could go here */}
            </div>
        </div>

        {/* Grid of 8 Seats (WePlay uses 2 rows of 4) */}
        <div className="shrink-0 px-6 pt-6 pb-2 z-10">
            <div className="grid grid-cols-4 gap-y-6 gap-x-4 justify-items-center">
                {seats.slice(1, 9).map((seat, idx) => {
                    const realIdx = idx + 1; // 1 to 8
                    return (
                        <VCSeatNode
                            key={realIdx}
                            seat={seat}
                            idx={realIdx}
                            currentUserId={currentUserId}
                            isHost={isHost}
                            setShowActionModal={setShowActionModal}
                            takeSeat={takeSeat}
                            remoteStream={seat?.user_id ? remoteStreams[seat.user_id] : null}
                            localStream={localStream}
                            isLocalMuted={isLocalMuted}
                            handleAvatarClick={handleAvatarClick}
                        />
                    );
                })}
            </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto px-4 mb-2 flex flex-col relative z-10 pointer-events-auto overscroll-contain">
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 flex flex-col pb-2">
                <div className="mt-auto flex flex-col gap-2">
                    {/* System Welcome Message */}
                    <div className="bg-black/30 backdrop-blur-md rounded-lg px-3 py-2 w-full max-w-[90%] self-start border-l-2 border-[#D4AF37]">
                        <p className="text-[12px] text-white/90 leading-snug">
                            <i className="fa-solid fa-bell text-[#D4AF37] mr-1.5"></i>
                            <span className="text-[#D4AF37] font-bold">system: </span>
                            Welcome to WePlay Voice Room. Erotic, cursing and illegal contents are strictly forbidden. We advocate healthy gaming. Minors should only use this feature with parental knowledge.
                        </p>
                    </div>

                    {/* Messages */}
                    {messages.map(m => {
                        const isMeMsg = (m.user_id || m.senderId) === currentUserId;
                        return (
                            <div key={m.id} className="bg-black/30 backdrop-blur-md rounded-xl rounded-tl-sm px-3 py-2 w-max max-w-[85%] self-start border border-white/5 animate-in slide-in-from-bottom-2">
                                <div className="flex items-center gap-1.5" onClick={(e) => { e.stopPropagation(); handleAvatarClick({ user_id: m?.user_id || m?.senderId || "unknown", user_name: m?.user_name || m?.senderName || "User", photo_url: m?.image_url || m?.senderPhoto }); }}>
                                    <span className={`text-[12px] font-black cursor-pointer ${isMeMsg ? 'text-[#00e5ff]' : 'text-gray-300'}`}>{m?.user_name || m?.senderName || "User"}:</span>
                                    <span className="text-[13px] text-white break-words">{m.message}</span>
                                </div>
                                {m.image_url && (
                                    <div className="mt-1.5 rounded-lg overflow-hidden border border-white/10 max-w-[100px] max-h-[100px] w-fit h-fit cursor-pointer bg-black/40 flex items-center justify-center" onClick={() => setFullScreenImage(m.image_url)}>
                                        <img src={m.image_url} alt="attached" className="max-w-full max-h-[100px] w-auto h-auto object-contain" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div ref={chatEndRef} />
                </div>
            </div>
        </div>

        {/* Bottom Action Bar (WePlay dock) */}
        <div className="shrink-0 w-full bg-[#1a1b21] p-3 flex items-center gap-2.5 z-20 pb-[calc(12px+env(safe-area-inset-bottom,0px))] border-t border-white/5">
            <button onClick={() => setIsSpeakerMuted(!isSpeakerMuted)} className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all text-white hover:bg-white/10">
                <i className={`fa-solid ${isSpeakerMuted ? 'fa-volume-xmark text-gray-500' : 'fa-volume-high text-[18px]'}`}></i>
            </button>
            <button onClick={() => { if (mySeatIndex !== null) setIsLocalMuted(!isLocalMuted); else if (isHost) takeSeat(0); else safeAlert('Take a seat to use the mic!'); }} className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all text-white hover:bg-white/10">
                <i className={`fa-solid ${(isLocalMuted || isMutedByHost || (mySeatIndex === null && !isHost)) ? 'fa-microphone-slash text-gray-500' : 'fa-microphone text-[18px]'}`}></i>
            </button>

            <form onSubmit={(e) => { e.preventDefault(); if (chatInput.trim() || pendingImage) { sendPeerChatMessage(chatInput.trim() || (pendingImage ? '📸 Sent an image' : ''), pendingImage); setChatInput(''); setPendingImage(null); } }} className="flex-1 relative flex items-center">
                <input type="file" id="vc-chat-img" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files && e.target.files[0]) { const reader = new FileReader(); reader.onload = (ev) => setPendingImage(ev.target.result); reader.readAsDataURL(e.target.files[0]); } }} />
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type..." className="w-full bg-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none" />
                {chatInput.trim() && (
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-[#00e5ff] font-bold text-sm bg-transparent">Send</button>
                )}
            </form>

            <button type="button" onClick={() => document.getElementById('vc-chat-img').click()} className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all text-white hover:bg-white/10">
                <i className="fa-regular fa-face-smile text-[20px]"></i>
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all text-[#ff4081] hover:bg-white/10">
                <i className="fa-solid fa-gift text-[20px]"></i>
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all text-white hover:bg-white/10">
                <i className="fa-solid fa-box-open text-[18px]"></i>
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all text-white hover:bg-white/10">
                <i className="fa-solid fa-border-all text-[20px]"></i>
            </button>
        </div>

        {/* Pending Image Preview Overlay */}
        {pendingImage && (
            <div className="absolute bottom-[80px] left-4 right-4 bg-[#2a2b33] border border-white/10 rounded-xl p-3 flex items-center justify-between shadow-xl animate-in slide-in-from-bottom-2 z-30">
                <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg bg-black flex items-center justify-center overflow-hidden border border-white/10">
                        <img src={pendingImage} className="max-w-full max-h-full object-cover" />
                    </div>
                    <span className="text-sm font-bold text-white">Image selected</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setPendingImage(null)} className="w-9 h-9 bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <button onClick={() => { sendPeerChatMessage('📸 Sent an image', pendingImage); setPendingImage(null); }} className="w-9 h-9 bg-[#00e5ff] text-black rounded-full flex items-center justify-center shadow-lg font-bold">
                        <i className="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        )}

        {/* Modals remain structurally similar but omitted for brevity in template - they are in index.html already */}
        {/* The Action Modals code (showActionModal, pendingInvite, etc.) goes here */}
        {showActionModal && showActionModal.type === 'self' && (
            <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowActionModal(null)}>
                <div className="bg-[#2a2b33] rounded-2xl p-6 w-full max-w-xs text-center border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-bold text-white mb-4">Manage Seat</h3>
                    <div className="flex flex-col gap-3">
                        <button onClick={() => { moveToAudience(currentUserId, showActionModal.idx, currentUserName, currentUserPhoto); setShowActionModal(null); }} className="py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-colors">Move to Audience</button>
                        <button onClick={() => setShowActionModal(null)} className="py-3 bg-white/5 text-white rounded-xl font-bold transition-colors border border-white/10">Cancel</button>
                    </div>
                </div>
            </div>
        )}
        {showActionModal && showActionModal.type === 'host_target' && (
            <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowActionModal(null)}>
                <div className="bg-[#2a2b33] rounded-2xl p-6 w-full max-w-xs text-center border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-bold text-white mb-4">Manage {showActionModal?.occupant?.user_name || showActionModal?.occupant?.name || "User"}</h3>
                    <div className="flex flex-col gap-3">
                        <button onClick={() => { toggleSeatMuteByHost(showActionModal.idx, showActionModal.seat.is_muted_by_host); setShowActionModal(null); }} className={`py-3 rounded-xl font-bold transition-colors bg-white/5 text-white border border-white/10`}>
                            {showActionModal.seat.is_muted_by_host ? 'Unmute Seat' : 'Mute Seat'}
                        </button>
                        <button onClick={() => { setShowActionModal({ type: 'invite_to_seat', seatNum: showActionModal.idx, oldOccupant: showActionModal.seat }); }} className="py-3 bg-white/5 text-white rounded-xl font-bold transition-colors border border-white/10">Change User</button>
                        <button onClick={() => { moveToAudience(showActionModal.seat.user_id, showActionModal.idx, showActionModal.seat.user_name, showActionModal.seat.photo_url); setShowActionModal(null); }} className="py-3 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white rounded-xl font-bold transition-colors border border-yellow-500/30">Move to Audience</button>
                        <button onClick={() => { handleKick(showActionModal.seat.user_id, showActionModal.idx); }} className="py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-colors border border-red-500/30">Kick from Room</button>
                        <button onClick={() => setShowActionModal(null)} className="py-3 bg-transparent text-gray-400 rounded-xl font-bold transition-colors">Cancel</button>
                    </div>
                </div>
            </div>
        )}
        {showActionModal && showActionModal.type === 'empty_seat_host' && (
            <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowActionModal(null)}>
                <div className="bg-[#2a2b33] rounded-2xl p-6 w-full max-w-xs text-center border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-bold text-white mb-4">Seat {showActionModal.idx}</h3>
                    <div className="flex flex-col gap-3">
                        <button onClick={() => { setShowActionModal({ type: 'invite_to_seat', seatNum: showActionModal.idx }); }} className="py-3 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-xl font-bold transition-colors">Invite to Seat</button>
                        <button onClick={() => { toggleSeatLock(showActionModal.idx, showActionModal.seat?.is_locked); setShowActionModal(null); }} className={`py-3 rounded-xl font-bold transition-colors bg-white/5 text-white border border-white/10`}>
                            {showActionModal.seat?.is_locked ? 'Unlock Seat' : 'Lock Seat'}
                        </button>
                        <button onClick={() => { toggleSeatMuteByHost(showActionModal.idx, showActionModal.seat?.is_muted_by_host); setShowActionModal(null); }} className={`py-3 rounded-xl font-bold transition-colors bg-white/5 text-white border border-white/10`}>
                            {showActionModal.seat?.is_muted_by_host ? 'Unmute Seat' : 'Mute Seat'}
                        </button>
                        <button onClick={() => setShowActionModal(null)} className="py-3 bg-transparent text-gray-400 rounded-xl font-bold transition-colors">Cancel</button>
                    </div>
                </div>
            </div>
        )}
        {showActionModal && showActionModal.type === 'invite' && (
            <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowActionModal(null)}>
                <div className="bg-[#2a2b33] rounded-2xl p-6 w-full max-w-xs text-center border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-bold text-white mb-4">Invite {showActionModal?.target?.user_name || showActionModal?.target?.name || "User"}</h3>
                    <div className="flex flex-col gap-3">
                        <button onClick={() => {
                            const emptySeatIdx = seats.findIndex((s, i) => i !== 0 && s && !s.user_id && !s.is_locked);
                            if (emptySeatIdx !== -1) {
                                broadcastToPeers('invite', { room_id: activeRoom.id, target: showActionModal.target.user_id, seatIndex: emptySeatIdx, hostName: currentUserName });
                                if (lockedSeats[showActionModal.seatNum]) { sendBroadcast('seat_lock', { seatNum: showActionModal.seatNum, isLocked: false }); setLockedSeats(prev => ({ ...prev, [showActionModal.seatNum]: false })); }
                                safeAlert(`Invitation sent to ${showActionModal.target.user_name}`);
                            } else { safeAlert("No empty unlocked seats available!"); }
                            setShowActionModal(null);
                        }} className="py-3 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-xl font-bold transition-colors">Invite to Stage</button>
                        <button onClick={() => { handleKick(showActionModal.target.user_id, null); }} className="py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-colors">Kick from Room</button>
                        <button onClick={() => setShowActionModal(null)} className="py-3 bg-transparent text-gray-400 rounded-xl font-bold transition-colors">Cancel</button>
                    </div>
                </div>
            </div>
        )}
        {showActionModal && showActionModal.type === 'invite_to_seat' && (
            <div className="fixed inset-0 bg-black/80 z-[100] flex items-end justify-center p-0 animate-in slide-in-from-bottom" onClick={() => setShowActionModal(null)}>
                <div className="bg-[#2a2b33] rounded-t-3xl p-4 w-full md:max-w-screen-xl max-w-md h-[60vh] flex flex-col border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
                    <h3 className="text-lg font-bold text-white mb-4">Invite to Seat {showActionModal.seatNum}</h3>
                    <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar pr-2">
                        {(() => {
                            const candidates = [...seats.filter(s => s && s.user_id && s.user_id !== currentUserId && s.user_id !== showActionModal.oldOccupant?.user_id).map(s => ({ ...s, isSeated: true })), ...audience.map(a => ({ ...a, isSeated: false }))];
                            if (candidates.length === 0) return <p className="text-gray-400 text-center py-10 italic">No eligible users to invite.</p>;
                            return candidates.map((c, i) => (
                                <div key={i} className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3 text-white font-bold text-sm">
                                        {c.photo_url || c.user_avatar ? <img src={c.photo_url || c.user_avatar} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center text-lg">{String(c.user_name || 'U').charAt(0).toUpperCase()}</div>}
                                        <div className="flex flex-col">
                                            <span className="truncate max-w-[150px]">{String(c.user_name || 'User')}</span>
                                            <span className="text-[10px] text-gray-400 font-normal">{c.isSeated ? `Currently on Seat ${c.seat_index}` : 'In Audience'}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => {
                                        if (showActionModal.oldOccupant) { moveToAudience(showActionModal.oldOccupant.user_id, showActionModal.seatNum, showActionModal.oldOccupant.user_name, showActionModal.oldOccupant.photo_url); }
                                        broadcastToPeers('invite', { room_id: activeRoom.id, target: c.user_id, seatIndex: showActionModal.seatNum, hostName: currentUserName });
                                        safeAlert('Invite sent!');
                                        setShowActionModal(null);
                                    }} className="bg-[#00e5ff] text-black px-4 py-1.5 rounded-lg text-xs font-black shadow-md active:scale-95 transition-transform">Invite</button>
                                </div>
                            ));
                        })()}
                    </div>
                </div>
            </div>
        )}
        {showActionModal && showActionModal.type === 'change_seat_self' && (
            <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowActionModal(null)}>
                <div className="bg-[#2a2b33] rounded-2xl p-6 w-full max-w-xs text-center border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center text-2xl mb-4"><i className="fa-solid fa-chair"></i></div>
                    <h3 className="text-xl font-bold text-white mb-2">Change Seat?</h3>
                    <p className="text-sm text-gray-400 mb-6">Do you want to move to Seat {showActionModal.seatNum}?</p>
                    <div className="flex gap-3">
                        <button onClick={() => setShowActionModal(null)} className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold transition-colors">Cancel</button>
                        <button onClick={() => { takeSeat(showActionModal.seatNum); setShowActionModal(null); }} className="flex-1 py-3 bg-[#00e5ff] text-black rounded-xl font-bold transition-colors">Move</button>
                    </div>
                </div>
            </div>
        )}
        {pendingInvite && (
            <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setPendingInvite(null)}>
                <div className="bg-[#2a2b33] rounded-2xl p-6 w-full max-w-xs text-center border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center text-2xl mb-4"><i className="fa-solid fa-microphone"></i></div>
                    <h3 className="text-xl font-bold text-white mb-2">Stage Invitation</h3>
                    <p className="text-sm text-gray-400 mb-6">{pendingInvite.hostName} invited you to take Seat {pendingInvite.seatIndex}.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setPendingInvite(null)} className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold transition-colors">Decline</button>
                        <button onClick={() => { const sIdx = pendingInvite.seatIndex; takeSeat(sIdx, activeRoom.password); setPendingInvite(null); }} className="flex-1 py-3 bg-[#00e5ff] text-black rounded-xl font-bold transition-colors">Accept</button>
                    </div>
                </div>
            </div>
        )}
    </div>
);
