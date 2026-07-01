                                </div>
                            ) : (
                                displayRooms.map(room => {
                                    const isPremium = room.room_type === 'permanent' || room.room_type === 'advance';
                                    return (
                                        <div key={room.id} onClick={() => handleJoinClick(room)} className={`bg-[#021633] rounded-2xl p-4 transition-all ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} relative overflow-hidden group ${isPremium ? 'border-2 border-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.2)]' : 'border border-[#0AE0D0]/30 hover:border-[#00FFFF]'}`}>
                                            {isPremium && <span className="absolute top-0 right-0 bg-[#00FFFF] text-[#010B1C] text-[9px] font-black px-2 py-1 rounded-bl-lg uppercase tracking-wider">ADVANCED LOUNGE</span>}
                                            <div className="relative z-10 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00FFFF] to-blue-600 flex items-center justify-center font-bold text-[#010B1C] text-xl shadow-[0_0_10px_rgba(0,255,255,0.5)] overflow-hidden">
                                                        {room.room_dp_url ? <img src={room.room_dp_url} className="w-full h-full object-cover" /> : room.channel_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg text-white mb-1 flex items-center gap-2">
                                                            {room.channel_name}
                                                            {room.password && <i className="fa-solid fa-lock text-[#00FFFF] text-xs"></i>}
                                                        </h3>
                                                        <div className="flex text-sm text-[#A4DFE6] gap-3">
                                                            <span className="inline-flex items-center"><i className={`fa-solid fa-crown ${isPremium ? 'text-[#F9D33A]' : 'text-[#00FFFF]'} mr-1`}></i> Host ID: {String(room.host_user_id).substring(0, 5)} {String(room.host_user_id) === "5182808926" && <VerifiedBadge className="w-3 h-3 ml-1 shrink-0" />}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-[#00FFFF]/10 text-[#00FFFF] flex items-center justify-center group-hover:bg-[#00FFFF] group-hover:text-[#010B1C] transition-colors">
                                                    <i className="fa-solid fa-arrow-right"></i>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                    {showCreateModal && <CreateRoomModal onClose={() => setShowCreateModal(false)} onCreate={createRoom} />}
                    {selectedRoomToJoin && <JoinRoomModal room={selectedRoomToJoin} onClose={() => setSelectedRoomToJoin(null)} onJoin={joinRoom} />}
                </div>
            );
        };

        const RoomSettingsModal = ({ activeRoom, onClose, onSave, currentMusic, onUpdateMusic }) => {
            const [name, setName] = useState(activeRoom.channel_name);
            const [password, setPassword] = useState(activeRoom.password || '');
            const [requireMic, setRequireMic] = useState(activeRoom.require_mic_request || false);
            const [musicTitle, setMusicTitle] = useState(currentMusic?.title || '');
            const [isSubmitting, setIsSubmitting] = useState(false);

            const handleSubmit = async (e) => {
                e.preventDefault();
                if (!name.trim()) return;
                setIsSubmitting(true);
                const success = await onSave(name, password, requireMic);
                setIsSubmitting(false);
                if (success) onClose();
            };

            return (
                <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
                    <div className="bg-[#021633] rounded-2xl p-6 w-full max-w-sm shadow-[0_0_30px_rgba(0,255,255,0.2)] border border-[#0AE0D0]/30" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-white mb-4"><i className="fa-solid fa-sliders mr-2 text-[#00FFFF]"></i>Room Settings</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs text-[#A4DFE6] font-bold uppercase tracking-wider mb-1 block">Room Name</label>
                                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#010B1C] border border-[#0AE0D0]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00FFFF]" />
                            </div>
                            <div>
                                <label className="text-xs text-[#A4DFE6] font-bold uppercase tracking-wider mb-1 block">Password <span className="text-gray-500 font-normal lowercase">(Optional)</span></label>
                                <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank for public" className="w-full bg-[#010B1C] border border-[#0AE0D0]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00FFFF]" />
                            </div>
                            <div>
                                <label className="text-xs text-[#A4DFE6] font-bold uppercase tracking-wider mb-1 block">Mic Requests</label>
                                <div className="flex items-center justify-between bg-[#010B1C] border border-[#0AE0D0]/30 rounded-xl px-4 py-3">
                                    <span className="text-white text-sm">Require permission to speak</span>
                                    <button type="button" onClick={() => setRequireMic(!requireMic)} className={`w-12 h-6 rounded-full transition-colors ${requireMic ? 'bg-[#00FFFF]' : 'bg-gray-600'} flex items-center px-1`}>
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${requireMic ? 'translate-x-6' : ''}`}></div>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-[#A4DFE6] font-bold uppercase tracking-wider mb-1 block">Currently Playing (Music)</label>
                                <div className="flex gap-2">
                                    <input type="text" value={musicTitle} onChange={e => setMusicTitle(e.target.value)} placeholder="e.g. Lofi Study Beats" className="flex-1 bg-[#010B1C] border border-[#0AE0D0]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00FFFF]" />
                                    <button type="button" onClick={() => onUpdateMusic(musicTitle)} className="bg-[#00FFFF]/20 text-[#00FFFF] border border-[#00FFFF]/50 px-4 rounded-xl font-bold hover:bg-[#00FFFF] hover:text-[#010B1C] transition-colors shadow-[0_0_10px_rgba(0,255,255,0.2)]">Set</button>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={onClose} className="flex-1 py-3 bg-[#010B1C] border border-[#0AE0D0]/20 text-white rounded-xl font-bold transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-[#00FFFF] text-[#010B1C] rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(0,255,255,0.4)] disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        };

        const ActiveVoiceRoom = ({ tgUser, voiceState, onMinimize }) => {
            const { activeRoom, participants, isMuted, isSpeakerMuted, toggleSpeaker, activeSpeakers, chatMessages, micRequests, setMicRequests, pendingInvite, setPendingInvite, leaveRoom, takeSeat, stepDown, toggleMute, sendHostAction, sendBroadcast, sendChat, updateRoomSettings, triggerSFX, lockedSeats = {}, setLockedSeats = () => { }, mutedSeats = {}, setMutedSeats = () => { }, isProcessing, currentMusic, setCurrentMusic } = voiceState;
            const [showActionModal, setShowActionModal] = useState(null);
            const [showParticipantsModal, setShowParticipantsModal] = useState(false);
            const [showSettingsModal, setShowSettingsModal] = useState(false);
            const [showRequestsModal, setShowRequestsModal] = useState(false);
            const [chatInput, setChatInput] = useState('');
            const [pendingImage, setPendingImage] = useState(null);
            const [fullScreenImage, setFullScreenImage] = useState(null);
            const [selectedProfileUser, setSelectedProfileUser] = useState(null);

            useEffect(() => {
                const handleBackEvent = (e) => {
                    if (showActionModal) { e.preventDefault(); setShowActionModal(null); }
                    else if (showParticipantsModal) { e.preventDefault(); setShowParticipantsModal(false); }
                    else if (showSettingsModal) { e.preventDefault(); setShowSettingsModal(false); }
                    else if (showRequestsModal) { e.preventDefault(); setShowRequestsModal(false); }
                    else if (fullScreenImage) { e.preventDefault(); setFullScreenImage(null); }
                    else if (pendingInvite) { e.preventDefault(); setPendingInvite(null); }
                    else if (selectedProfileUser) { e.preventDefault(); setSelectedProfileUser(null); }
                };
                window.addEventListener('ataxy_back_requested', handleBackEvent);
                return () => window.removeEventListener('ataxy_back_requested', handleBackEvent);
            }, [showActionModal, showParticipantsModal, showSettingsModal, showRequestsModal, fullScreenImage, pendingInvite, selectedProfileUser]);

            const currentUserId = String(window.Telegram?.WebApp?.initDataUnsafe?.user?.id || tgUser?.id || "1001");
            const isHost = String(activeRoom.host_user_id) === currentUserId;
            const myParticipant = participants.find(p => String(p.user_id) === currentUserId);
            const isSpeaker = isHost || (myParticipant?.seat_number !== null && myParticipant?.seat_number !== undefined);
            const audience = participants.filter(p => p.seat_number === null || p.seat_number === undefined);
            const mySeatMuted = myParticipant?.seat_number !== null && myParticipant?.seat_number !== undefined ? !!mutedSeats[myParticipant.seat_number] : false;
            const effectiveMutedUI = isMuted || mySeatMuted;

            const handleAvatarClick = (userObj) => {
                if (!userObj || typeof userObj !== 'object') return;
                setSelectedProfileUser(userObj);
            };

            const handleSeatClick = (seatNum, occupant) => {
                if (occupant) {
                    handleAvatarClick(occupant);
                } else {
                    if (isHost) {
                        if (seatNum !== 0) {
                            setShowActionModal({ type: 'empty_seat_host', seatNum });
                        }
                    } else if (isSpeaker) {
                        if (lockedSeats[seatNum]) {
                            safeAlert("This seat is locked by the host.");
                            return;
                        }
                        if (activeRoom.host_user_id === 'no_host') {
                            safeAlert("There is no active host in this room. You cannot switch seats.");
                            return;
                        }
                        safeConfirm(`Are you sure you want to change to Seat ${seatNum}?`, () => {
                            takeSeat(seatNum);
                        });
                    } else {
                        if (lockedSeats[seatNum]) {
                            safeAlert("This seat is locked by the host.");
                            return;
                        }
                        if (activeRoom.host_user_id === 'no_host') {
                            safeAlert("There is no active host in this room. You cannot take a seat.");
                            return;
                        }
                        if (activeRoom.require_mic_request) {
                            if (micRequests.some(r => String(r.uid) === currentUserId)) {
                                safeAlert("Your request is already pending host approval.");
                                return;
                            }
                            const tgData = window.Telegram?.WebApp?.initDataUnsafe?.user || tgUser;
                            sendBroadcast('request_seat', { uid: currentUserId, name: tgData.first_name, seatNum: seatNum });
                            safeAlert("Requested to speak. Waiting for host approval.");
                        } else {
                            takeSeat(seatNum);
                        }
                    }
                }
            };

            const renderSeat = (seatNum, occupant, label, isLarge = false) => {
                if (occupant && !occupant.user_id) return null; // Safe guard
                const isOfflineHost = occupant?.is_offline_host;
                const isMe = String(occupant?.user_id) === currentUserId;

                // --- Seat Render Styling ---
                const isHostSeat = seatNum === 0;

                const baseScale = isLarge ? 1.05 : 1;

                const dpUrl = isMe ? (window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url || tgUser.photo_url) : (isOfflineHost ? activeRoom.room_dp_url : occupant?.photo_url);

                // 🛡️ SAFE MUTE CHECK: Read directly from Supabase Presence
                let isOccupantMuted = false;
                if (occupant && occupant.user_id) {
                    isOccupantMuted = !!occupant.is_muted;
                }

                const isLocked = lockedSeats[seatNum];
                const isSeatMuted = mutedSeats[seatNum];

                // 🛡️ SAFE OCCUPANT NAME: Prevent ReferenceError crashes
                const occupantName = occupant ? (isOfflineHost ? 'Host' : (occupant.user_name || "Unknown")) : (isLocked ? 'Locked' : label);

                return (
                    <div onClick={() => handleSeatClick(seatNum, occupant)} className={`flex flex-col items-center gap-2 cursor-pointer transition-transform hover:-translate-y-1 hover:scale-105 ${isLarge ? 'w-24' : 'w-16'}`}>
                        {occupant ? (
                            <div className="relative group flex items-center justify-center">
                                {/* Layer 1 & 2: The Base Avatar and Static Highlight Ring */}
                                {dpUrl ? (
                                    <img src={dpUrl} alt={occupantName} className={`rounded-full object-cover border-2 relative z-10 ${isLarge ? 'w-20 h-20 text-2xl' : 'w-14 h-14 text-xl'} ${isHostSeat ? 'border-[#F9D33A]' : 'border-[#00FFFF]'}`} />
                                ) : (
                                    <div className={`rounded-full flex items-center justify-center font-black border-2 bg-gradient-to-br from-[#00FFFF] to-blue-600 relative z-10 ${isLarge ? 'w-20 h-20 text-3xl' : 'w-14 h-14 text-2xl'} ${isHostSeat ? 'border-[#F9D33A] text-[#010B1C] from-[#D4AF37] to-[#F9D33A]' : 'border-[#00FFFF] text-[#010B1C]'}`}>
                                        {occupantName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                {isOfflineHost && (
                                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center z-20 overflow-hidden">
                                        <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">Left</span>
                                    </div>
                                )}
                                {isSeatMuted ? (
                                    <div className="absolute -bottom-1 -right-1 bg-[#ff0055] rounded-full w-6 h-6 flex items-center justify-center border-2 border-[#ff88aa] shadow-[0_0_15px_#ff0055,_0_0_30px_#ff0055] z-20">
                                        <i className="fa-solid fa-microphone-slash text-[10px] text-white font-black drop-shadow-md"></i>
                                    </div>
                                ) : ((isMe ? isMuted : isOccupantMuted) ? (
                                    <div className="absolute -bottom-1 -right-1 bg-[#010B1C] rounded-full w-6 h-6 flex items-center justify-center border border-gray-600 shadow-md z-20">
                                        <i className="fa-solid fa-microphone-slash text-[10px] text-gray-400"></i>
                                    </div>
                                ) : null)}
                                {isLocked && (
                                    <div className="absolute top-0 right-0 bg-red-500 w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#010B1C] shadow-sm z-20">
                                        <i className="fa-solid fa-lock text-[8px] text-white"></i>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative group">
                                <div className={`rounded-full border-2 border-dashed ${isLocked ? 'border-red-500/40 bg-red-500/10' : 'border-[#0AE0D0]/30 bg-[#021633]/50 hover:bg-[#0AE0D0]/20 hover:border-[#0AE0D0]/80'} flex items-center justify-center ${isLarge ? 'w-20 h-20 text-3xl' : 'w-14 h-14 text-xl'} transition-all duration-300 shadow-[inset_0_0_10px_rgba(0,255,255,0.1)]`}>
                                    <i className={`fa-solid ${isLocked ? 'fa-lock text-red-400/50' : 'fa-plus text-[#0AE0D0]/40'}`}></i>
                                </div>
                                {isSeatMuted && (
                                    <div className="absolute -bottom-1 -right-1 bg-[#ff0055] rounded-full w-6 h-6 flex items-center justify-center border-2 border-[#ff88aa] shadow-[0_0_15px_#ff0055,_0_0_30px_#ff0055] z-10">
                                        <i className="fa-solid fa-microphone-slash text-[10px] text-white font-black drop-shadow-md"></i>
                                    </div>
                                )}
                            </div>
                        )}
                        <span className="text-[11px] text-center font-bold text-[#E0F7FA] truncate w-full px-1 drop-shadow-md">{occupantName}</span>
                    </div>
                )
            };

            const handleUpdateMusic = (title) => {
                const payload = title ? { title, isPlaying: true } : null;
                sendBroadcast('music_status', payload);
                setCurrentMusic(payload);
                safeAlert(title ? "Music status updated!" : "Music status cleared.");
            };

            return (
                <div className="flex-1 flex flex-col relative z-10">
                    <div className="px-3 py-3 sm:px-4 sm:py-4 pr-[90px] lg:pr-4 flex items-center justify-between border-b border-[#0AE0D0]/20 bg-[#010B1C]/90 backdrop-blur pt-[calc(70px+env(safe-area-inset-top,0px))]">
                        <div className="flex items-center gap-2 overflow-hidden pr-2 flex-1 min-w-0">
                            <button onClick={onMinimize} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0 hover:bg-white/20 transition-colors" title="Back to Rooms">
                                <i className="fa-solid fa-arrow-left"></i>
                            </button>
                            <div className="flex flex-col overflow-hidden min-w-0">
                                <h2 className="text-lg sm:text-xl font-black text-[#E0F7FA] drop-shadow-[0_0_5px_rgba(0,255,255,0.3)] truncate">{activeRoom.channel_name}</h2>
                                <p className="text-xs text-[#00FFFF] font-bold">
                                    <span className="w-2 h-2 inline-block rounded-full bg-[#00FFFF] animate-pulse mr-1"></span> {activeRoom.room_type} Room
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => setShowParticipantsModal(true)} className="bg-[#0AE0D0]/10 text-[#0AE0D0] border border-[#0AE0D0]/30 hover:bg-[#0AE0D0]/20 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5"><i className="fa-solid fa-users"></i> {participants.length}</button>
                            <button onClick={() => !isProcessing && leaveRoom()} disabled={isProcessing} className={`bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-[0_0_10px_rgba(255,0,0,0.2)] transition-colors ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}>Leave</button>
                        </div>
                    </div>
                    {activeRoom.announcement && (
                        <div className="mx-4 mt-3 p-3 bg-[#021633]/80 rounded-xl border border-[#D4AF37]/40 text-xs text-[#F9D33A] shadow-[0_0_10px_rgba(212,175,55,0.2)] backdrop-blur flex items-start gap-2 animate-in slide-in-from-top-2 z-20 relative">
                            <i className="fa-solid fa-bullhorn mt-0.5 animate-pulse"></i>
                            <span>{activeRoom.announcement}</span>
                        </div>
                    )}
                    {currentMusic && (
                        <div className="absolute top-[calc(64px+max(env(safe-area-inset-top),_24px))] left-1/2 -translate-x-1/2 bg-[#021633]/80 backdrop-blur-md border border-[#00FFFF]/40 rounded-full px-4 py-1.5 flex items-center gap-2 z-20 shadow-[0_0_15px_rgba(0,255,255,0.2)] w-max max-w-[90%]">
                            <i className="fa-solid fa-music text-[#00FFFF] animate-pulse text-[10px]"></i>
                            <span className="text-[#E0F7FA] text-xs font-bold truncate">{currentMusic.title}</span>
                        </div>
                    )}
                    <div className="p-6">
                        <div className="flex justify-center gap-8 mb-8">
                            {renderSeat(0,
                                participants.find(p => p.seat_number !== null && p.seat_number !== undefined && Number(p.seat_number) === 0) ||
                                ((activeRoom.room_type === 'advance' || activeRoom.room_type === 'permanent') && !participants.some(p => String(p.user_id) === String(activeRoom.host_user_id)) ? { is_offline_host: true, user_id: activeRoom.host_user_id, user_name: "Host" } : undefined),
                                "Host", true
                            )}
                            {activeRoom.is_partner_seat_open && renderSeat(1, participants.find(p => p.seat_number !== null && p.seat_number !== undefined && Number(p.seat_number) === 1), "Partner", true)}
                        </div>
                        <div className="grid grid-cols-4 gap-y-6 gap-x-4 justify-items-center">
                            {[2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                                <React.Fragment key={i}>
                                    {renderSeat(i, participants.find(p => p.seat_number !== null && p.seat_number !== undefined && Number(p.seat_number) === i), `Seat ${i}`)}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 bg-gradient-to-t from-[#021633] to-[#010B1C] mt-2 rounded-t-3xl border-t border-[#0AE0D0]/20 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-end overflow-hidden pb-24">
                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 mb-2 flex flex-col pointer-events-auto overscroll-contain">
                            <div className="flex flex-col gap-2 mt-auto pb-2">
                                {chatMessages.map((msg, idx) => {
                                    if (msg.isSystem) {
                                        return (
                                            <div key={msg.id || idx} className={`bg-[#0AE0D0]/10 border border-[#0AE0D0]/20 rounded-full px-3 py-1 text-[10px] w-fit mx-auto text-[#A4DFE6] italic flex items-center gap-1.5 shadow-sm animate-in fade-in zoom-in duration-300 ${msg.type === 'entry' ? 'bg-gradient-to-r from-[#00FFFF]/20 to-blue-500/20 text-[#00FFFF] border-[#00FFFF]/40 shadow-[0_0_10px_rgba(0,255,255,0.2)] font-bold' : ''}`}>
                                                <i className={`fa-solid ${msg.type === 'entry' ? 'fa-plane-arrival' : 'fa-shoe-prints'}`}></i> {msg.text}
                                            </div>
                                        );
                                    }

                                    const senderName = msg?.user_name || msg?.userName || "User";
                                    const senderPhoto = msg?.user_avatar || msg?.userAvatar || msg?.photo_url || msg?.photoUrl || null;
                                    const senderId = msg?.user_id || msg?.userId || "unknown";

                                    return (
                                        <div key={msg.id || idx} className="flex items-end gap-2 max-w-[85%] animate-in fade-in slide-in-from-bottom-2">
                                            <div
                                                className="w-7 h-7 rounded-full bg-[#00FFFF]/20 border border-[#00FFFF]/40 flex items-center justify-center font-bold text-[#00FFFF] overflow-hidden shrink-0 cursor-pointer shadow-sm"
                                                onClick={(e) => { e.stopPropagation(); handleAvatarClick({ user_id: senderId, user_name: senderName, photo_url: senderPhoto }); }}
                                            >
                                                {senderPhoto ? <img src={senderPhoto} className="w-full h-full object-cover" /> : senderName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="bg-[#010B1C]/80 backdrop-blur border border-[#0AE0D0]/20 rounded-xl px-3 py-2 text-sm w-fit shadow-sm">
                                                <span className="font-bold text-[#A4DFE6] cursor-pointer hover:underline text-[10px] block mb-0.5 leading-none" onClick={(e) => { e.stopPropagation(); handleAvatarClick({ user_id: senderId, user_name: senderName, photo_url: senderPhoto }); }}>{senderName}</span>
                                                <span className="text-white break-words whitespace-pre-wrap leading-tight">{msg.text || msg.message}</span>
                                                {(msg.imageUrl || msg.image_url) && (
                                                    <div className="mt-2 rounded-lg overflow-hidden border border-[#0AE0D0]/30 max-w-[80px] max-h-[80px] w-fit h-fit cursor-pointer inline-block shadow-sm bg-black/30 flex items-center justify-center" onClick={() => setFullScreenImage(msg.imageUrl || msg.image_url)}>
                                                        <img src={msg.imageUrl || msg.image_url} alt="attached" className="max-w-full max-h-[80px] w-auto h-auto object-contain" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        {audience.length > 0 && (
                            <div className="flex gap-3 pt-2 border-t border-[#0AE0D0]/20 overflow-x-auto no-scrollbar pb-1">
                                {audience.map(p => {
                                    const uName = p.user_name || "Unknown";
                                    return (
                                        <div key={p.user_id || Math.random()} className="flex flex-col items-center gap-1 shrink-0 w-12 cursor-pointer" title={uName} onClick={(e) => { e.stopPropagation(); handleAvatarClick(p); }}>
                                            {p.photo_url ? (
                                                <img src={p.photo_url} alt={uName} className="w-8 h-8 rounded-full object-cover border border-[#0AE0D0]/30" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-[#00FFFF]/20 flex items-center justify-center border border-[#0AE0D0]/30 text-[#00FFFF] font-bold text-[12px]">
                                                    {uName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <span className="text-[8px] text-[#A4DFE6] truncate w-full text-center">{uName.split(' ')[0]}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <div className="fixed bottom-0 w-full md:max-w-screen-xl max-w-md bg-[#010B1C]/95 backdrop-blur border-t border-[#0AE0D0]/30 p-3 flex flex-col gap-2 z-20 pb-safe-bottom">
                        {/* Pending Image Preview Overlay */}
                        {pendingImage && (
                            <div className="w-full bg-[#021633] border border-[#0AE0D0]/50 rounded-xl p-2 flex items-center justify-between shadow-[0_0_15px_rgba(0,255,255,0.2)] animate-in slide-in-from-bottom-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-black/50 flex items-center justify-center overflow-hidden border border-[#00FFFF]/30">
                                        <img src={pendingImage} className="max-w-full max-h-full object-cover" />
                                    </div>
                                    <span className="text-xs font-bold text-[#A4DFE6]">Image selected</span>
                                </div>
                                <button onClick={() => setPendingImage(null)} className="w-8 h-8 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                        )}
                        <div className="flex gap-2 items-center w-full">
                            {/* LEFT: Speaker & Mic Options */}
                            <button onClick={toggleSpeaker} className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-colors border border-transparent ${isSpeakerMuted ? 'text-gray-400 bg-gray-800' : 'text-[#A4DFE6] hover:bg-[#A4DFE6]/20'}`}>
                                <i className={`fa-solid ${isSpeakerMuted ? 'fa-volume-xmark' : 'fa-volume-high'} text-sm`}></i>
                            </button>

                            <button onClick={() => {
                                if (isProcessing) return;
                                if (myParticipant?.seat_number !== null && myParticipant?.seat_number !== undefined) {
                                    toggleMute();
                                } else if (isHost) {
                                    takeSeat(0);
                                } else {
                                    safeAlert('Take a seat to use the mic!');
                                }
                            }} disabled={isProcessing} className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-all ${!isSpeaker ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : effectiveMutedUI ? 'bg-red-500/20 text-red-500' : 'bg-[#00FFFF] text-[#010B1C] shadow-[0_0_10px_rgba(0,255,255,0.5)]'} ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}>
                                <i className={`fa-solid ${effectiveMutedUI || !isSpeaker ? 'fa-microphone-slash' : 'fa-microphone'} text-sm`}></i>
                            </button>

                            {/* MIDDLE: Input Bar with Embedded Image Upload Icon */}
                            <div className="flex-1 relative flex items-center min-w-[80px]">
                                <button onClick={() => document.getElementById('chat-image-upload').click()} className="absolute left-3 text-[#A4DFE6] hover:text-[#00FFFF] transition-colors z-10">
                                    <i className="fa-solid fa-image text-sm"></i>
                                </button>
                                <input type="file" id="chat-image-upload" accept="image/*" className="hidden" onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                        const img = new Image();
                                        img.onload = () => {
                                            const canvas = document.createElement('canvas');
                                            let width = img.width, height = img.height;
                                            const maxDim = 800; // Aggressive compression for live websockets
                                            if (width > height && width > maxDim) { height *= maxDim / width; width = maxDim; }
                                            else if (height > maxDim) { width *= maxDim / height; height = maxDim; }
                                            canvas.width = width; canvas.height = height;
                                            const ctx = canvas.getContext('2d');
                                            ctx.drawImage(img, 0, 0, width, height);
                                            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
                                            setPendingImage(compressedBase64);
                                        };
                                        img.src = ev.target.result;
                                    };
                                    reader.readAsDataURL(file);
                                    e.target.value = ''; // Reset input
                                }} />
                                <input
                                    value={chatInput} onChange={e => setChatInput(e.target.value)}
                                    placeholder="Message room..."
                                    className="w-full bg-[#021633] border border-[#0AE0D0]/30 rounded-full pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#00FFFF]"
                                    onKeyDown={(e) => { if (e.key === 'Enter' && (chatInput.trim() || pendingImage)) { sendChat(chatInput.trim() || (pendingImage ? '📸 Sent an image' : ''), pendingImage); setChatInput(''); setPendingImage(null); } }}
                                />
                            </div>

                            {/* RIGHT: Send Button & Settings */}
                            <button onClick={() => { if (chatInput.trim() || pendingImage) { sendChat(chatInput.trim() || (pendingImage ? '📸 Sent an image' : ''), pendingImage); setChatInput(''); setPendingImage(null); } }} className="w-9 h-9 shrink-0 bg-[#00FFFF] text-[#010B1C] rounded-full flex items-center justify-center hover:bg-[#00d8d8] shadow-[0_0_10px_rgba(0,255,255,0.4)] transition-colors">
                                <i className="fa-solid fa-paper-plane text-sm"></i>
                            </button>

                            {isHost && (
                                <button onClick={() => setShowSettingsModal(true)} className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-[#A4DFE6] hover:bg-[#A4DFE6]/20 transition-colors bg-transparent">
                                    <i className="fa-solid fa-sliders text-sm"></i>
                                </button>
                            )}
                        </div>
                    </div>

                    {isHost && micRequests.length > 0 && (
                        <button onClick={() => setShowRequestsModal(true)} className="absolute bottom-20 right-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-[0_0_15px_rgba(255,0,0,0.5)] animate-bounce flex items-center gap-1.5 z-30">
                            <i className="fa-solid fa-hand"></i> {micRequests.length} Requests
                        </button>
                    )}

                    {showActionModal && showActionModal.type === 'self' && (
                        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowActionModal(null)}>
                            <div className="bg-[#021633] rounded-2xl p-6 w-full max-w-xs text-center border border-[#0AE0D0]/30" onClick={e => e.stopPropagation()}>
                                <h3 className="text-xl font-bold text-white mb-4">Manage Seat</h3>
                                <div className="flex flex-col gap-3">
                                    <button onClick={() => { stepDown(); setShowActionModal(null); }} className="py-3 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-colors border border-red-500/50">Move to Audience</button>
                                    <button onClick={() => setShowActionModal(null)} className="py-3 bg-[#010B1C] text-white rounded-xl font-bold transition-colors border border-gray-600">Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showActionModal && showActionModal.type === 'host_target' && (
                        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowActionModal(null)}>
                            <div className="bg-[#021633] rounded-2xl p-6 w-full max-w-xs text-center border border-[#0AE0D0]/30" onClick={e => e.stopPropagation()}>
                                <h3 className="text-xl font-bold text-white mb-4">Manage {showActionModal.occupant?.user_name || showActionModal.occupant?.name || "User"}</h3>
                                <div className="flex flex-col gap-3">
                                    {showActionModal.occupant.is_muted ? (
                                        <button onClick={() => { sendHostAction('unmute', showActionModal.occupant.user_id); setShowActionModal(null); }} className="py-3 bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white rounded-xl font-bold transition-colors border border-green-500/50">Unmute Microphone</button>
                                    ) : (
                                        <button onClick={() => { sendHostAction('mute', showActionModal.occupant.user_id); setShowActionModal(null); }} className="py-3 bg-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-white rounded-xl font-bold transition-colors border border-orange-500/50">Mute Microphone</button>
                                    )}
                                    <button onClick={() => {
                                        const isSeatMuted = !mutedSeats[showActionModal.seatNum];
                                        sendBroadcast('seat_mute', { seatNum: showActionModal.seatNum, isMuted: isSeatMuted });
                                        setMutedSeats(prev => ({ ...prev, [showActionModal.seatNum]: isSeatMuted }));
                                        setShowActionModal(null);
                                    }} className={`py-3 rounded-xl font-bold transition-colors border ${mutedSeats[showActionModal.seatNum] ? 'bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white border-green-500/50' : 'bg-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-white border-orange-500/50'}`}>
                                        {mutedSeats[showActionModal.seatNum] ? 'Unmute Seat' : 'Mute Seat'}
                                    </button>
                                    <button onClick={() => { sendHostAction('assign_mod', showActionModal.occupant.user_id); setShowActionModal(null); }} className="py-3 bg-blue-500/20 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl font-bold transition-colors border border-blue-500/50">Assign Admin/Mod</button>
                                    <button onClick={() => { sendHostAction('lift_user', showActionModal.occupant.user_id); setShowActionModal(null); }} className="py-3 bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-white rounded-xl font-bold transition-colors border border-yellow-500/50">Move to Audience</button>
                                    <button onClick={() => { sendHostAction('kick', showActionModal.occupant.user_id); setShowActionModal(null); }} className="py-3 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-colors border border-red-500/50">Kick from Room</button>
                                    <button onClick={() => setShowActionModal(null)} className="py-3 bg-[#010B1C] text-white rounded-xl font-bold transition-colors border border-gray-600">Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showActionModal && showActionModal.type === 'empty_seat_host' && (
                        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowActionModal(null)}>
                            <div className="bg-[#021633] rounded-2xl p-6 w-full max-w-xs text-center border border-[#0AE0D0]/30" onClick={e => e.stopPropagation()}>
                                <h3 className="text-xl font-bold text-white mb-4">Manage Seat {showActionModal.seatNum}</h3>
                                <div className="flex flex-col gap-3">
                                    <button onClick={() => { setShowActionModal({ type: 'invite_to_seat', seatNum: showActionModal.seatNum }); }} className="py-3 bg-blue-500/20 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl font-bold transition-colors border border-blue-500/50">Invite to Seat</button>
                                    <button onClick={() => {
                                        const isSeatMuted = !mutedSeats[showActionModal.seatNum];
                                        sendBroadcast('seat_mute', { seatNum: showActionModal.seatNum, isMuted: isSeatMuted });