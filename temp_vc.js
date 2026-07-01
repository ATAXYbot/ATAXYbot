        // 🎙️ AGORA REAL-TIME LAYER & WEPLAY VOICE ROOMS (ISP BYPASSED)
        // ==========================================
        const SUPABASE_PROXY_URL = 'https://kwzpnupjtvfrevpwfaao.supabase.co'; // Connect directly to fix WebSockets
        const SUPABASE_ANON_KEY = 'sb_publishable_' + 'BQ3FzD6jag0nHhYmUu0Bcw_Qq1CEeal';
        const AGORA_APP_ID = "1711d81c" + "41114b1bb4f102b27147821c";

        // ISP Block Bypass: Route all Supabase REST API requests through the free Cloudflare Proxy
        const ispBypassFetch = (url, options) => {
            const bypassedUrl = typeof url === 'string'
                ? url.replace('https://kwzpnupjtvfrevpwfaao.supabase.co', 'https://supabase-proxy.thevoicesession.workers.dev')
                : url;
            return fetch(bypassedUrl, options);
        };

        const supabase = window.supabase ? window.supabase.createClient(SUPABASE_PROXY_URL, SUPABASE_ANON_KEY, {
            global: { fetch: ispBypassFetch },
            realtime: {
                worker: true,
                heartbeatCallback: (status) => {
                    if (status === 'disconnected' && window.supabase && supabase.realtime) {
                        try { supabase.realtime.connect(); } catch (e) { }
                    }
                }
            }
        }) : null;

        async function getAgoraToken(channelName, userId, password = null) {
            try {
                const bodyStr = JSON.stringify({
                    channelName: channelName,
                    uid: String(userId), // Ensure UID is a string for Telegram IDs
                    password: password
                });
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                };

                const response = await fetch('https://supabase-proxy.thevoicesession.workers.dev/functions/v1/agora-token', {
                    method: 'POST',
                    headers: headers,
                    body: bodyStr
                });

                if (!response.ok) {
                    let errData;
                    try { errData = await response.json(); } catch (e) { throw new Error(`Server returned status ${response.status}`); }
                    throw new Error(errData?.error || `Server returned status ${response.status}`);
                }

                const data = await response.json();
                if (data.error) throw new Error(data.error);
                return data.token;
            } catch (error) {
                console.error("Token acquisition failed:", error);
                safeAlert("Could not retrieve voice security token: " + error.message);
                throw error;
            }
        }

        const CreateRoomModal = ({ onClose, onCreate }) => {
            const [name, setName] = useState('');
            const [password, setPassword] = useState('');
            const [isSubmitting, setIsSubmitting] = useState(false);

            const handleSubmit = async (e) => {
                e.preventDefault();
                if (!name.trim()) return;
                setIsSubmitting(true);
                const success = await onCreate(name, 'temporary', password || null);
                setIsSubmitting(false);
                if (success !== false) {
                    onClose();
                }
            };

            return (
                <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
                    <div className="bg-[#021633] rounded-2xl p-6 w-full max-w-sm shadow-[0_0_30px_rgba(0,255,255,0.2)] border border-[#0AE0D0]/30" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-white mb-4">Create Voice Lounge</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs text-[#A4DFE6] font-bold uppercase tracking-wider mb-1 block">Room Name</label>
                                <input autoFocus required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Late Night Study" className="w-full bg-[#010B1C] border border-[#0AE0D0]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00FFFF]" />
                            </div>
                            <div>
                                <label className="text-xs text-[#A4DFE6] font-bold uppercase tracking-wider mb-1 block">Room Type</label>
                                <div className="flex gap-2">
                                    <button type="button" className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all border bg-[#00FFFF]/20 border-[#00FFFF] text-[#00FFFF]`}>Temporary</button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs text-[#A4DFE6] font-bold uppercase tracking-wider cursor-pointer" onClick={() => { if (password) { setPassword(''); } else { setPassword('0000'); } }}>Enable Password</label>
                                <div
                                    onClick={() => { if (password) { setPassword(''); } else { setPassword('0000'); } }}
                                    className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 shadow-inner ${password !== '' ? 'bg-[#00FFFF]' : 'bg-[#010B1C] border border-[#0AE0D0]/30'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full transition-transform duration-300 shadow-md ${password !== '' ? 'bg-[#010B1C] translate-x-6' : 'bg-gray-500 translate-x-0'}`}></div>
                                </div>
                            </div>
                            {password !== '' && (
                                <input type="text" inputMode="numeric" pattern="\d*" maxLength="4" value={password} onChange={e => setPassword(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="Enter 4-digit password" className="w-full bg-[#010B1C] border border-[#0AE0D0]/30 rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] font-black text-white focus:outline-none focus:border-[#00FFFF] placeholder:tracking-normal placeholder:font-normal placeholder:text-sm" />
                            )}
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={onClose} className="flex-1 py-3 bg-[#010B1C] border border-[#0AE0D0]/20 text-white rounded-xl font-bold transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-gradient-to-r from-[#00A7A7] to-[#00FFFF] text-[#010B1C] rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(0,255,255,0.4)] disabled:opacity-50">{isSubmitting ? 'Creating...' : 'Create Room'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        };

        const JoinRoomModal = ({ room, onClose, onJoin }) => {
            const [password, setPassword] = useState('');
            const [isSubmitting, setIsSubmitting] = useState(false);

            const handleSubmit = async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                const success = await onJoin(room, password);
                setIsSubmitting(false);
                if (success) onClose();
            };

            return (
                <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
                    <div className="bg-[#021633] rounded-2xl p-6 w-full max-w-sm shadow-[0_0_30px_rgba(0,255,255,0.2)] border border-[#0AE0D0]/30" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-white mb-2">Join {room.channel_name}</h3>
                        <p className="text-sm text-[#A4DFE6] mb-4">This room is locked. Please enter the password to join.</p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <input autoFocus required type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter Room Password" className="w-full bg-[#010B1C] border border-[#0AE0D0]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00FFFF]" />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={onClose} className="flex-1 py-3 bg-[#010B1C] border border-[#0AE0D0]/20 text-white rounded-xl font-bold transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-gradient-to-r from-[#00A7A7] to-[#00FFFF] text-[#010B1C] rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(0,255,255,0.4)] disabled:opacity-50">{isSubmitting ? 'Joining...' : 'Join'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        };

        const useGlobalVoice = (tgUser) => {
            const [client, setClient] = useState(null);
            const clientRef = useRef(null);
            useEffect(() => { clientRef.current = client; }, [client]);

            const userSeatRef = useRef(null);

            const [activeRoom, setActiveRoom] = useState(null);
            const roomRef = useRef(null);
            useEffect(() => { roomRef.current = activeRoom; }, [activeRoom]);

            const [participants, setParticipants] = useState([]);
            const participantsRef = useRef([]);
            useEffect(() => { participantsRef.current = participants; }, [participants]);

            // 🚀 INSTANT SYNC REFS: Eliminates 1-render desync crashes on fast seat hopping
            const [localAudioTrackState, setLocalAudioTrackState] = useState(null);
            const trackRef = useRef(null);
            const setLocalAudioTrack = (val) => { trackRef.current = val; setLocalAudioTrackState(val); };
            const localAudioTrack = localAudioTrackState;

            const [isMutedState, setIsMutedState] = useState(true);
            const isMutedRef = useRef(true);
            const setIsMuted = (val) => { isMutedRef.current = val; setIsMutedState(val); };
            const isMuted = isMutedState;

            const [activeSpeakers, setActiveSpeakers] = useState({});
            const [realtimeChannel, setRealtimeChannel] = useState(null);
            const channelRef = useRef(null);
            useEffect(() => { channelRef.current = realtimeChannel; }, [realtimeChannel]);

            const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
            const speakerMutedRef = useRef(false);
            useEffect(() => { speakerMutedRef.current = isSpeakerMuted; }, [isSpeakerMuted]);

            const [availableRooms, setAvailableRooms] = useState([]);
            const [chatMessages, setChatMessages] = useState([]);
            const [micRequests, setMicRequests] = useState([]);
            const [pendingInvite, setPendingInvite] = useState(null);

            // --- WEPLAY-STYLE FEATURES (EMOJIS, SFX) ---
            const [lockedSeats, setLockedSeats] = useState({});
            const [mutedSeats, setMutedSeats] = useState({});
            const mutedSeatsRef = useRef({});
            useEffect(() => { mutedSeatsRef.current = mutedSeats; }, [mutedSeats]);

            const [isMinimized, setIsMinimized] = useState(false);
            const [currentMusic, setCurrentMusic] = useState(null);

            // 🛡️ STRICT CONNECTION DEBOUNCE LOCK
            const [isProcessingState, setIsProcessingState] = useState(false);
            const isProcessingRef = useRef(false);
            const setIsProcessing = (val) => {
                isProcessingRef.current = val;
                setIsProcessingState(val);
            };
            const isProcessing = isProcessingState;

            // 🛡️ GHOST BUSTER: Anti-Rubberbanding. Prevents reappearance of old states due to sync race conditions
            const recentlyChangedRef = useRef(new Set());
            const markRecentlyChanged = (uid) => {
                recentlyChangedRef.current.add(String(uid));
                setTimeout(() => recentlyChangedRef.current.delete(String(uid)), 3000);
            };

            const toggleSpeaker = () => {
                setIsSpeakerMuted(prev => !prev);
            };

            // 2. STATE-TRIGGERED AUDIO ENGINE (The WePlay Secret)
            // Hardware follows state strictly, never the other way around.
            useEffect(() => {
                const syncHardwareWithState = async () => {
                    if (!clientRef.current) return;
                    const tgData = window.Telegram?.WebApp?.initDataUnsafe?.user || tgUser;
                    const userIdString = String(tgData?.id || "1001");

                    const myParticipant = participants.find(p => String(p.user_id) === userIdString);
                    const hasSeat = myParticipant && myParticipant.seat_number !== null && myParticipant.seat_number !== undefined;

                    try {
                        if (hasSeat) {
                            const seatIsMuted = mutedSeats[myParticipant.seat_number] || false;
                            const effectiveMute = isMutedRef.current || seatIsMuted;

                            if (!trackRef.current) {
                                await clientRef.current.setClientRole("host");
                                const track = await window.AgoraRTC.createMicrophoneAudioTrack({ AEC: true, ANS: true });
                                await track.setMuted(effectiveMute);
                                setLocalAudioTrack(track);
                                await clientRef.current.publish([track]);
                            } else {
                                await trackRef.current.setMuted(effectiveMute);
                            }
                        } else {
                            if (trackRef.current) {
                                const track = trackRef.current;
                                try { await clientRef.current.unpublish([track]); } catch (e) { }
                                try { track.stop(); } catch (e) { }
                                try { track.close(); } catch (e) { }
                                setLocalAudioTrack(null);
                                await clientRef.current.setClientRole("audience");
                            }
                        }
                    } catch (error) {
                        console.error("Hardware sync failed:", error);
                    }
                };
                syncHardwareWithState();
            }, [participants, tgUser, mutedSeats]);

            // 🛡️ SOFT MUTE ENGINE (App-level volume control instead of hardware track manipulation)
            useEffect(() => {
                if (!clientRef.current) return;
                clientRef.current.remoteUsers.forEach(rUser => {
                    if (rUser.audioTrack) {
                        const participant = participants.find(p => String(p.user_id) === String(rUser.uid));

                        let seatMuted = false;
                        let notSeated = true;
                        if (participant && participant.seat_number !== null && participant.seat_number !== undefined) {
                            seatMuted = mutedSeats[participant.seat_number];
                            notSeated = false;
                        }

                        const shouldBeMuted = (participant && participant.is_muted) || isSpeakerMuted || seatMuted || notSeated;
                        try { rUser.audioTrack.setVolume(shouldBeMuted ? 0 : 100); } catch (e) { }
                    }
                });
            }, [participants, isSpeakerMuted, mutedSeats]);

            // --- ORPHANED ROOM CLEANUP ---
            useEffect(() => {
                const handleBeforeUnload = () => {
                    if (roomRef.current && clientRef.current) {
                        try {
                            const tgData = window.Telegram?.WebApp?.initDataUnsafe?.user || tgUser;
                            const userIdString = String(tgData?.id || "1001");
                            const roomId = roomRef.current.id;
                            const headers = { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` };
                            fetch(`${SUPABASE_PROXY_URL}/rest/v1/room_participants?user_id=eq.${userIdString}&room_id=eq.${roomId}`, { method: 'DELETE', headers, keepalive: true }).catch(() => { });
                        } catch (e) { }
                        leaveRoom(clientRef.current, roomRef.current.id, true);
                    }
                };
                window.addEventListener("beforeunload", handleBeforeUnload);
                window.addEventListener("pagehide", handleBeforeUnload);
                return () => { window.removeEventListener("beforeunload", handleBeforeUnload); window.removeEventListener("pagehide", handleBeforeUnload); };
            }, []);

            const triggerSFX = (type) => {
                const sfxUrls = {
                    applause: 'https://actions.google.com/sounds/v1/crowds/crowd_cheer.ogg',
                    laughter: 'https://actions.google.com/sounds/v1/crowds/female_crowd_laughing.ogg',
                    drumroll: 'https://actions.google.com/sounds/v1/cartoon/drum_roll.ogg',
                    magic: 'https://actions.google.com/sounds/v1/cartoon/magic_chime_chord.ogg'
                };
                try {
                    if (sfxUrls[type]) {
                        const audio = new Audio(sfxUrls[type]);
                        audio.volume = 0.5;
                        audio.play().catch(e => console.error("SFX play error", e));
                    }
                } catch (e) { }
            };

            const sendBroadcast = (event, payload) => {
                try {
                    if (channelRef.current) {
                        channelRef.current.send({ type: 'broadcast', event: event, payload: payload });
                    }
                } catch (e) { console.warn("Broadcast Error:", e); }
            };

            const fetchRooms = async () => {
                if (!supabase) return;
                const { data: rooms, error } = await supabase
                    .from('voice_rooms')
                    .select('*')
                    .eq('is_live', true)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error("Error fetching rooms:", error);
                    return;
                }
                if (rooms) {
                    setAvailableRooms(rooms);
                }
            };

            useEffect(() => {
                if (!supabase) return;
                fetchRooms();

                const channel = supabase.channel('voice_rooms_sync')
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'voice_rooms' }, () => {
                        fetchRooms();
                    })
                    .subscribe();
                return () => { supabase.removeChannel(channel); };
            }, []);

            const joinRoom = async (roomData, password = null, bypassLock = false) => {
                try {
                    if (!bypassLock) {
                        if (isProcessingRef.current) return false;
                        setIsProcessing(true);
                    }

                    // 🛡️ FRESH START: Always force user into audience state upon entry
                    userSeatRef.current = null;
                    setIsMuted(true);

                    // Connection Lock: Explicitly leave if already connecting/connected to prevent Race Conditions
                    if (clientRef.current && (clientRef.current.connectionState === "CONNECTED" || clientRef.current.connectionState === "CONNECTING")) {
                        try { await clientRef.current.unpublish(); } catch (e) { }
                        try { await clientRef.current.leave(); } catch (e) { }
                        try { clientRef.current.removeAllListeners(); } catch (e) { }
                    }

                    if (roomData.password && roomData.password !== password) {
                        safeAlert("Incorrect password!");
                        return false;
                    }

                    let token = null;
                    try {
                        token = await getAgoraToken(roomData.id, tgUser.id, password);
                        if (!token) {
                            throw new Error("Received an empty token from the server.");
                        }
                    } catch (e) {
                        return false;
                    }

                    const agoraClient = window.AgoraRTC.createClient({ mode: "live", codec: "vp8" });
                    setClient(agoraClient);

                    agoraClient.on("user-published", async (remoteUser, mediaType) => {
                        try {
                            if (mediaType === "audio") {
                                const userIdStr = String(remoteUser.uid);
                                await agoraClient.subscribe(remoteUser, mediaType);

                                // Safely play without binding to a DOM element container
                                if (remoteUser.audioTrack) {
                                    remoteUser.audioTrack.play();

                                    // 3. SAFE REMOTE TRACK HANDLING: Immediately mute if not explicitly seated
                                    const participant = participantsRef.current.find(p => String(p.user_id) === userIdStr);
                                    let seatMuted = false;
                                    let notSeated = true;
                                    if (participant && participant.seat_number !== null && participant.seat_number !== undefined) {
                                        seatMuted = !!mutedSeatsRef.current[participant.seat_number];
                                        notSeated = false;
                                    }
                                    const shouldBeMuted = (participant && participant.is_muted) || speakerMutedRef.current || seatMuted || notSeated;

                                    remoteUser.audioTrack.setVolume(shouldBeMuted ? 0 : 100);
                                }

                                // Update only the mute state badge visually
                                setParticipants(prev => prev.map(s => String(s.user_id) === userIdStr ? { ...s, is_muted: false } : s));
                            }
                        } catch (err) {
                            console.error("Safely bypassed user-published exception:", err);
                        }
                    });

                    agoraClient.on("user-unpublished", async (remoteUser, mediaType) => {
                        try {
                            if (mediaType === "audio") {
                                const userIdStr = String(remoteUser.uid);
                                // CRITICAL: NEVER call .stop() or .close() on remoteUser tracks manually!
                                // Simply update the visual badge state. Agora cleans up internal memory.
                                setParticipants(prev => prev.map(s => String(s.user_id) === userIdStr ? { ...s, is_muted: true } : s));
                            }
                        } catch (err) {
                            console.error("Safely bypassed user-unpublished exception:", err);
                        }
                    });

                    agoraClient.on("user-left", async (remoteUser) => {
                        try {
                            const userIdStr = String(remoteUser.uid);

                            // Instantly remove from UI
                            setParticipants(prev => prev.filter(s => String(s.user_id) !== userIdStr));
                        } catch (err) {
                            console.error("Safely bypassed user-left exception:", err);
                        }
                    });

                    let lastVolumeUpdate = 0;
                    agoraClient.enableAudioVolumeIndicator();
                    agoraClient.on("volume-indicator", (volumes) => {
                        const now = Date.now();
                        if (now - lastVolumeUpdate < 100) return; // Debounce to ~10fps max for smooth UI
                        lastVolumeUpdate = now;
                        try {
                            setActiveSpeakers(prev => {
                                const newMap = { ...prev };
                                let changed = false;

                                const tgData = window.Telegram?.WebApp?.initDataUnsafe?.user || tgUser;
                                const myUidStr = String(tgData?.id || "1001");

                                volumes.forEach(v => {
                                    const uidStr = String(v.uid);
                                    const p = participantsRef.current.find(pt => String(pt.user_id) === uidStr);

                                    let isSoftMuted = p ? p.is_muted : false;
                                    // STRICT LOCAL MUTE OVERRIDE: Prevent ghost voice ring when speaking loudly
                                    if (uidStr === myUidStr) {
                                        isSoftMuted = isMutedRef.current;
                                    }

                                    let notSeated = true;
                                    if (p && p.seat_number !== null && p.seat_number !== undefined) {
                                        if (mutedSeatsRef.current[p.seat_number]) isSoftMuted = true;
                                        notSeated = false;
                                    }
                                    const level = (!isSoftMuted && !notSeated && v.level > 5) ? v.level : 0;
                                    if ((prev[uidStr] || 0) !== level) {
                                        newMap[uidStr] = level;
                                        changed = true;
                                    }
                                });
                                // Zero out anyone who stopped speaking completely
                                Object.keys(prev).forEach(uidStr => {
                                    if (prev[uidStr] > 0 && !volumes.some(v => String(v.uid) === uidStr)) {
                                        newMap[uidStr] = 0;
                                        changed = true;
                                    }
                                });
                                return changed ? newMap : prev;
                            });
                        } catch (e) { }
                    });

                    // 1. AUDIENCE DEFAULT: Force audience role on entry
                    await agoraClient.setClientRole("audience");
                    await agoraClient.join(AGORA_APP_ID, String(roomData.id), token, String(tgUser?.id || "1001"));

                    if (supabase) {
                        const myPresenceState = {
                            user_id: String(tgUser.id),
                            user_name: tgUser.first_name || tgUser.username || "Unknown",
                            photo_url: tgUser.photo_url || null,
                            seat_number: null,
                            is_muted: true
                        };

                        const channel = supabase.channel(`room:${roomData.id}`, {
                            config: { presence: { key: String(tgUser.id) } }
                        })
                            .on('presence', { event: 'sync' }, () => {
                                const state = channel.presenceState();
                                const currentParticipants = [];

                                for (const id in state) {
                                    // 🛡️ GHOST BUSTER: Do not overwrite users who recently changed state locally.
                                    if (recentlyChangedRef.current.has(String(id))) {
                                        const localP = participantsRef.current.find(p => String(p.user_id) === String(id));
                                        if (localP) currentParticipants.push(localP);
                                        else {
                                            const seatedConnection = state[id].find(c => c.seat_number !== null && c.seat_number !== undefined);
                                            if (seatedConnection || state[id][0]) currentParticipants.push(seatedConnection || state[id][0]);
                                        }
                                        continue;
                                    }

                                    if (state[id] && state[id].length > 0) {
                                        const seatedConnection = state[id].find(c => c.seat_number !== null && c.seat_number !== undefined);
                                        currentParticipants.push(seatedConnection || state[id][0]);
                                    }
                                }

                                // Ensure local user is always present if recently changed
                                const tgData = window.Telegram?.WebApp?.initDataUnsafe?.user || tgUser;
                                const myIdStr = String(tgData?.id || "1001");
                                if (recentlyChangedRef.current.has(myIdStr) && !currentParticipants.some(p => String(p.user_id) === myIdStr)) {
                                    const localP = participantsRef.current.find(p => String(p.user_id) === myIdStr);
                                    if (localP) {
                                        currentParticipants.push(localP);
                                    } else {
                                        currentParticipants.push({
                                            user_id: myIdStr,
                                            user_name: tgData.first_name || tgData.username || "Unknown",
                                            photo_url: tgData.photo_url || null,
                                            seat_number: userSeatRef.current,
                                            is_muted: isMutedRef.current
                                        });
                                    }
                                }
                                setParticipants(currentParticipants);

                                if ((roomData.room_type === 'advance' || roomData.room_type === 'permanent') && !currentParticipants.some(p => String(p.user_id) === String(roomData.host_user_id))) {
                                    setLockedSeats(prev => ({ ...prev, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true, 9: true }));
                                }
                            })
                            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                                if (recentlyChangedRef.current.has(String(key))) return; // Ignored if we caused it locally
                                if (newPresences && newPresences.length > 0) {
                                    if (String(key) !== String(tgUser.id)) {
                                        const userName = newPresences[0].user_name || 'Someone';
                                        const msgId = Date.now() + Math.random().toString();
                                        setChatMessages(prev => [...prev, { id: msgId, isSystem: true, text: `${userName} entered`, time: Date.now() }]);

                                        // 🛡️ SYSTEM NOTIFICATION: Disappear dynamically after 4 seconds
                                        setTimeout(() => {
                                            setChatMessages(prev => prev.filter(m => m.id !== msgId));
                                        }, 4000);
                                    }
                                    // Add to participants so they show up instantly without waiting for sync
                                    setParticipants(prev => prev.some(p => String(p.user_id) === String(key)) ? prev.map(p => String(p.user_id) === String(key) ? newPresences[0] : p) : [...prev, newPresences[0]]);
                                }
                            })
                            .on('presence', { event: 'leave' }, ({ key }) => {
                                if (recentlyChangedRef.current.has(String(key))) return;
                                setParticipants(prev => prev.filter(p => String(p.user_id) !== String(key)));
                            })
                            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'voice_rooms', filter: `id=eq.${roomData.id}` }, (payload) => {
                                if (payload.new.is_live === false) {
                                    safeAlert("The live room has ended.");
                                    leaveRoom(agoraClient, roomData.id);
                                } else {
                                    setActiveRoom(payload.new);
                                    const tgData = window.Telegram?.WebApp?.initDataUnsafe?.user || tgUser;
                                    const userIdString = String(tgData?.id || "1001");
                                    if (payload.new.host_user_id === userIdString && String(roomRef.current?.host_user_id) !== userIdString) {
                                        takeSeat(0, roomData.id, null, true);
                                        safeAlert("The previous host disconnected. You have been promoted to Host!");
                                    }
                                }
                            })
                            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'voice_rooms', filter: `id=eq.${roomData.id}` }, () => {
                                safeAlert("The host has closed the room.");
                                leaveRoom(agoraClient, roomData.id);
                            })
                            .on('broadcast', { event: 'mute' }, ({ payload }) => {
                                if (payload.target_uid === String(tgUser.id)) {
                                    setIsMuted(true);
                                    if (channelRef.current) {
                                        const tgData = window.Telegram?.WebApp?.initDataUnsafe?.user || tgUser;
                                        channelRef.current.track({
                                            user_id: String(tgData.id || "1001"),
                                            user_name: tgData.first_name || tgData.username || "Unknown",
                                            photo_url: tgData.photo_url || null,
                                            seat_number: userSeatRef.current,
                                            is_muted: true
                                        });
                                    }
                                } else {
                                    setParticipants(prev => prev.map(p => String(p.user_id) === String(payload.target_uid) ? { ...p, is_muted: true } : p));
                                }
                            })
                            .on('broadcast', { event: 'unmute' }, ({ payload }) => {
                                if (payload.target_uid === String(tgUser.id)) {
                                    setIsMuted(false);
                                    if (channelRef.current) {
                                        const tgData = window.Telegram?.WebApp?.initDataUnsafe?.user || tgUser;
                                        channelRef.current.track({
                                            user_id: String(tgData.id || "1001"),
                                            user_name: tgData.first_name || tgData.username || "Unknown",
                                            photo_url: tgData.photo_url || null,
                                            seat_number: userSeatRef.current,
                                            is_muted: false
                                        });
                                    }
                                } else {
                                    setParticipants(prev => prev.map(p => String(p.user_id) === String(payload.target_uid) ? { ...p, is_muted: false } : p));
                                }
                            })
                            .on('broadcast', { event: 'kick' }, ({ payload }) => {
                                if (payload.target_uid === String(tgUser.id)) {
                                    leaveRoom(agoraClient, roomData.id);
                                } else {
                                    setParticipants(prev => prev.filter(p => String(p.user_id) !== String(payload.target_uid)));
                                }
                            })
                            .on('broadcast', { event: 'mute_toggle' }, ({ payload }) => {
                                setParticipants(prev => prev.map(p => String(p.user_id) === String(payload.target_uid) ? { ...p, is_muted: payload.isMuted } : p));
                            })
                            .on('broadcast', { event: 'text_chat' }, ({ payload }) => {
                                setChatMessages(prev => [...prev, payload]);
                            })
                            .on('broadcast', { event: 'invite_to_seat' }, ({ payload }) => {
                                if (payload.target_uid === String(tgUser.id)) setPendingInvite(payload);
                            })
                            .on('broadcast', { event: 'request_seat' }, ({ payload }) => {
                                if (String(roomData.host_user_id) === String(tgUser.id)) {
                                    setMicRequests(prev => {
                                        if (!prev.some(r => r.uid === payload.uid)) return [...prev, payload];
                                        return prev;
                                    });
                                }
                            })
                            .on('broadcast', { event: 'approve_seat' }, ({ payload }) => {
                                if (payload.target_uid === String(tgUser.id)) takeSeat(payload.seatNum);
                            })
                            .on('broadcast', { event: 'lift_user' }, ({ payload }) => {
                                if (payload.target_uid === String(tgUser.id)) {
                                    stepDown(true);
                                    safeAlert("You have been moved to the audience by the host.");
                                } else {
                                    setParticipants(prev => prev.map(p => String(p.user_id) === String(payload.target_uid) ? { ...p, seat_number: null, is_muted: true } : p));
                                }
                            })
                            .on('broadcast', { event: 'play_sfx' }, ({ payload }) => {
                                triggerSFX(payload.type);
                            })
                            .on('broadcast', { event: 'seat_lock' }, ({ payload }) => {
                                setLockedSeats(prev => ({ ...prev, [payload.seatNum]: payload.isLocked }));
                            })
                            .on('broadcast', { event: 'seat_mute' }, ({ payload }) => {
                                setMutedSeats(prev => ({ ...prev, [payload.seatNum]: payload.isMuted }));
                                if (payload.isMuted && userSeatRef.current === payload.seatNum) {
                                    safeAlert("Your seat has been muted by the host.");
                                    if (trackRef.current) {
                                        try { trackRef.current.setMuted(true); trackRef.current.setEnabled(false); } catch (e) { }
                                        lastAppliedMuteRef.current = true;
                                    }
                                } else if (!payload.isMuted && userSeatRef.current === payload.seatNum) {
                                    const effectiveMute = isMutedRef.current;
                                    if (trackRef.current) {
                                        try { trackRef.current.setMuted(effectiveMute); trackRef.current.setEnabled(!effectiveMute); } catch (e) { }
                                        lastAppliedMuteRef.current = effectiveMute;
                                    }
                                }
                            })
                            .on('broadcast', { event: 'change_seat' }, ({ payload }) => {
                                setParticipants(prev => {
                                    if (prev.some(p => String(p.user_id) === String(payload.target_uid))) {
                                        return prev.map(p => String(p.user_id) === String(payload.target_uid) ? { ...p, seat_number: payload.seatNum, is_muted: payload.isMuted } : p);
                                    } else {
                                        return [...prev, {
                                            user_id: payload.target_uid,
                                            user_name: payload.userName || "Unknown",
                                            photo_url: payload.photoUrl || null,
                                            seat_number: payload.seatNum,
                                            is_muted: payload.isMuted
                                        }];
                                    }
                                });
                            })
                            .on('broadcast', { event: 'user_joined' }, ({ payload }) => {
                                setParticipants(prev => {
                                    if (prev.some(p => String(p.user_id) === String(payload.user_id))) {
                                        return prev.map(p => String(p.user_id) === String(payload.user_id) ? payload : p);
                                    }
                                    return [...prev, payload];
                                });
                            })
                            .on('broadcast', { event: 'promote_to_host' }, ({ payload }) => {
                                if (payload.target_uid === String(tgUser.id)) {
                                    takeSeat(0, roomData.id);
                                    safeAlert("The previous host stepped down. You have been promoted to Host!");
                                }
                            })
                            .on('broadcast', { event: 'host_transfer_instant' }, ({ payload }) => {
                                setActiveRoom(prev => prev ? { ...prev, host_user_id: payload.host_uid } : prev);
                            })
                            .on('broadcast', { event: 'music_status' }, ({ payload }) => {
                                setCurrentMusic(payload);
                            })
                            .on('broadcast', { event: 'user_left' }, ({ payload }) => {
                                setParticipants(prev => prev.filter(p => String(p.user_id) !== String(payload.target_uid)));
                            })
                            .on('broadcast', { event: 'advance_host_left' }, () => {
                                if (String(tgUser.id) !== String(roomData.host_user_id)) {
                                    if (userSeatRef.current !== null && userSeatRef.current !== undefined) {
                                        stepDown();
                                        safeAlert("The host has left the Advance Room. All users have been moved to the audience.");
                                    }
                                }
                                setLockedSeats(prev => ({ ...prev, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true, 9: true }));
                            })
                            .subscribe(async (status) => {
                                if (status === 'SUBSCRIBED') {
                                    const tgData = window.Telegram?.WebApp?.initDataUnsafe?.user || tgUser;
                                    const userIdString = String(tgData.id || "1001");
                                    const currentSeat = userSeatRef.current;
                                    const currentMute = isMutedRef.current;
                                    setParticipants(prev => {
                                        if (prev.some(p => String(p.user_id) === userIdString)) return prev;
                                        return [...prev, {
                                            user_id: userIdString,
                                            user_name: tgData.first_name || tgData.username || "Unknown",
                                            photo_url: tgData.photo_url || null,
                                            seat_number: currentSeat,
                                            is_muted: currentMute
                                        }];
                                    });
                                    await channel.track({
                                        user_id: userIdString,
                                        user_name: tgData.first_name || tgData.username || "Unknown",
                                        photo_url: tgData.photo_url || null,
                                        seat_number: currentSeat,
                                        is_muted: currentMute
                                    });
                                }
                            });

                        setRealtimeChannel(channel);
                    }
                    setActiveRoom(roomData);
                    setChatMessages([]);
                    setLockedSeats({});
                    setMutedSeats({});
                    setIsMinimized(false);
                    return agoraClient;
                } catch (e) {
                    console.error("Join Error", e);
                    safeAlert("Failed to join room: " + e.message);
                    return false;
                } finally {
                    if (!bypassLock) setIsProcessing(false);
                }
            };

            const leaveRoom = async (forcedClient = client, roomId = activeRoom?.id, isUnloading = false) => {
                if (!isUnloading && isProcessingRef.current) return;
                if (!isUnloading) setIsProcessing(true);
                try {
                    const r = roomRef.current;
                    const track = trackRef.current;
                    const tgData = window.Telegram?.WebApp?.initDataUnsafe?.user || tgUser;
                    const userIdString = String(tgData?.id || "1001");

                    // 🛡️ FRESH START: Clear local state memory immediately on exit
                    userSeatRef.current = null;
                    setIsMuted(true);

                    markRecentlyChanged(userIdString);

                    // 🚀 EXPLICIT BROADCAST BEFORE DISCONNECTING FOR INSTANT UI REMOVAL
                    try {
                        if (channelRef.current) {
                            await channelRef.current.send({ type: 'broadcast', event: 'user_left', payload: { target_uid: userIdString } });
                        }
                    } catch (e) { }

                    // 1. Safely stop and close localAudioTrack ONLY if it exists. Set it to null.
                    if (track) {
                        try { track.stop(); } catch (e) { }
                        try { track.close(); } catch (e) { }
                        setLocalAudioTrack(null);
                    }

                    if (forcedClient) {
                        // 2. Call await agoraClient.unpublish() without args to blanket unpublish
                        try { await forcedClient.unpublish(); } catch (e) { }

                        // 3. Call await agoraClient.leave()
                        try { await forcedClient.leave(); } catch (e) { }

                        // 4. Remove all Agora event listeners
                        try { forcedClient.removeAllListeners(); } catch (e) { }
                    }

                    if (supabase && r && roomId) {
                        // 5. Remove user from room_participants table
                        try { await supabase.from('room_participants').delete().eq('user_id', userIdString).eq('room_id', roomId); } catch (e) { }

                        if (String(r.host_user_id) === userIdString) {
                            if (r.room_type === 'temporary') {
                                const remainingMics = participantsRef.current.filter(p => p.seat_number !== null && Number(p.seat_number) > 0 && String(p.user_id) !== userIdString).sort((a, b) => Number(a.seat_number) - Number(b.seat_number));
                                if (remainingMics.length > 0) {
                                    const nextHost = remainingMics[0];
                                    sendBroadcast('promote_to_host', { target_uid: String(nextHost.user_id) });
                                    sendBroadcast('host_transfer_instant', { host_uid: String(nextHost.user_id) });
                                } else {
                                    if (supabase) {
                                        try { await supabase.from('voice_rooms').delete().eq('id', r.id); } catch (e) { }
                                    }
                                }
                            } else if (r.room_type === 'advance' || r.room_type === 'permanent') {
                                // Advance Room: Host left the room
                                // Normal users lift up automatically and seats lock
                                if (channelRef.current) {
                                    try { await channelRef.current.send({ type: 'broadcast', event: 'advance_host_left', payload: {} }); } catch (e) { }
                                }
                            }
                        }
                        if (channelRef.current) {
                            try { await channelRef.current.untrack(); } catch (e) { }
                            supabase.removeChannel(channelRef.current);
                        }
                    }
                    if (!isUnloading) {
                        setActiveRoom(null);
                        setParticipants([]);
                        setLocalAudioTrack(null);
                        setIsMuted(true);
                        setClient(null);
                        setRealtimeChannel(null);
                        setChatMessages([]);
                        setMicRequests([]);
                        setPendingInvite(null);
                        setLockedSeats({});
                        setMutedSeats({});
                        setIsMinimized(false);
                        setCurrentMusic(null);
                    }
                } catch (err) {
                    console.error("Safe leaveRoom failed:", err);
                } finally {
                    if (!isUnloading) setIsProcessing(false);
                }
            };

            const createRoom = async (name, type, password = null) => {
                if (!supabase) return;
                if (isProcessingRef.current) return false;
                setIsProcessing(true);
                try {
                    const tgData = window.Telegram?.WebApp?.initDataUnsafe?.user || tgUser;
                    const userIdString = String(tgData?.id || "1001");

                    const { data, error } = await supabase.from('voice_rooms').insert({
                        channel_name: name,
                        host_user_id: userIdString,
                        owner_id: type === 'permanent' ? userIdString : null,
                        room_type: type,
                        require_mic_request: false,
                        password: password || null,
                        is_live: true
                    }).select().single();

                    if (error) throw error;

                    if (data) {
                        const agoraClient = await joinRoom(data, password, true);
                        if (agoraClient) {
                            await takeSeat(0, data.id, agoraClient, true);
                            return true;
                        }
                    }
                    return false;
                } catch (error) {
                    let errorMsg = error.message;
                    if (error.code === '23505' || errorMsg.includes('duplicate key') || errorMsg.includes('voice_rooms_channel_name_key')) {
                        errorMsg = "A room with this name already exists! Please choose a different name.";
                    }
                    safeAlert("Failed to create room: " + errorMsg);
                    console.error("createRoom error:", error);
                    return false;
                } finally {
                    setIsProcessing(false);
                }
            };

            const takeSeat = async (seatIdx, roomId = roomRef.current?.id, passedClient = null, bypassLock = false) => {
                try {
                    if (!bypassLock) {
                        if (isProcessingRef.current) return;
                        setIsProcessing(true);
                    }
                    const activeClient = passedClient || clientRef.current;
                    if (!activeClient) {
                        console.warn("No active Agora client to take seat");
                        return;
                    }

                    const tgData = window.Telegram?.WebApp?.initDataUnsafe?.user || tgUser;
                    const username = tgData?.first_name || tgData?.username || "User";
                    const photo_url = tgData?.photo_url || "";
                    const userIdString = String(tgData?.id || "1001");

                    // 🛡️ WePlay Replica: Personal mute state is preserved when hopping seats.
                    // The seat's mute state is an independent layer applied on top.
                    const currentMute = isMutedRef.current;

                    userSeatRef.current = seatIdx;

                    markRecentlyChanged(userIdString);

                    if (supabase && channelRef.current) {
                        setParticipants(prev => {
                            const exists = prev.some(p => String(p.user_id) === userIdString);
                            if (exists) {
                                return prev.map(p => String(p.user_id) === userIdString ? { ...p, seat_number: seatIdx, is_muted: currentMute } : p);
                            } else {
                                return [...prev, { user_id: userIdString, user_name: username, photo_url: photo_url, seat_number: seatIdx, is_muted: currentMute }];
                            }
                        });

                        try {
                            channelRef.current.track({
                                user_id: userIdString,
                                user_name: username,
                                photo_url: photo_url,
                                seat_number: seatIdx,
                                is_muted: currentMute
                            });
                        } catch (e) { }

                        // Instantly notify everyone in the room of the new seat without waiting for network sync
                        sendBroadcast('change_seat', { target_uid: userIdString, seatNum: seatIdx, isMuted: currentMute, userName: username, photoUrl: photo_url });

                        const rId = roomId || roomRef.current?.id;
                        if (seatIdx === 0 && rId) {
                            try { await supabase.from('voice_rooms').update({ host_user_id: userIdString }).eq('id', rId); } catch (e) { }
                            setActiveRoom(prev => prev ? { ...prev, host_user_id: userIdString } : prev);
                            sendBroadcast('host_transfer_instant', { host_uid: userIdString });
                        }
                    }
                } catch (e) {
                    console.error("Safe takeSeat failed:", e);
                    safeAlert("Microphone access was denied or failed. Check browser permissions.");
                } finally {
                    if (!bypassLock) setIsProcessing(false);
                }
            };

            const stepDown = async (bypassLock = false) => {
                if (!bypassLock && isProcessingRef.current) return;
                if (!bypassLock) setIsProcessing(true);
                try {
                    const track = trackRef.current;
                    const c = clientRef.current;
                    const r = roomRef.current;

                    const tgData = window.Telegram?.WebApp?.initDataUnsafe?.user || tgUser;
                    const userIdString = String(tgData?.id || "1001");
                    const username = tgData?.first_name || tgData?.username || "User";
                    const photo_url = tgData?.photo_url || "";

                    userSeatRef.current = null;
                    setIsMuted(true);

                    markRecentlyChanged(userIdString);

                    // 🚀 INSTANT PUBLIC UPDATE
                    if (supabase && channelRef.current) {
                        setParticipants(prev => prev.map(p => String(p.user_id) === userIdString ? { ...p, seat_number: null, is_muted: true } : p));

                        sendBroadcast('change_seat', { target_uid: userIdString, seatNum: null, isMuted: true, userName: username, photoUrl: photo_url });

                        try {
                            channelRef.current.track({
                                user_id: userIdString,
                                user_name: username,
                                photo_url: photo_url,
                                seat_number: null,
                                is_muted: true
                            });
                        } catch (e) { }
                    }

                    // Server background tasks (Ownership transfer)
                    if (r && String(r.host_user_id) === userIdString) {
                        const remainingMics = participantsRef.current.filter(p => p.seat_number !== null && p.seat_number !== undefined && Number(p.seat_number) > 0 && String(p.user_id) !== userIdString).sort((a, b) => Number(a.seat_number) - Number(b.seat_number));
                        const audienceMembers = participantsRef.current.filter(p => (p.seat_number === null || p.seat_number === undefined) && String(p.user_id) !== userIdString);

                        let nextHost = null;
                        if (remainingMics.length > 0) {
                            nextHost = remainingMics[0];
                        } else {
                            nextHost = { user_id: 'no_host' };
                        }

                        if (r.room_type === 'temporary') {
                            if (nextHost.user_id !== 'no_host') {
                                try { supabase.from('voice_rooms').update({ host_user_id: String(nextHost.user_id) }).eq('id', r.id).then(); } catch (e) { }
                                setActiveRoom(prev => prev ? { ...prev, host_user_id: String(nextHost.user_id) } : prev);
                                sendBroadcast('promote_to_host', { target_uid: String(nextHost.user_id) });
                                sendBroadcast('host_transfer_instant', { host_uid: String(nextHost.user_id) });
                            } else {
                                try { supabase.from('voice_rooms').delete().eq('id', r.id).then(); } catch (e) { }
                                setActiveRoom(null);
                            }
                        } else {
                            if (nextHost) {
                                try { supabase.from('voice_rooms').update({ host_user_id: String(nextHost.user_id) }).eq('id', r.id).then(); } catch (e) { }
                                setActiveRoom(prev => prev ? { ...prev, host_user_id: String(nextHost.user_id) } : prev);
                                sendBroadcast('promote_to_host', { target_uid: String(nextHost.user_id) });
                                sendBroadcast('host_transfer_instant', { host_uid: String(nextHost.user_id) });
                            }
                        }
                    }
                } catch (e) {
                    console.error("Safe stepDown failed:", e);
                } finally {
                    if (!bypassLock) setIsProcessing(false);
                }
            };

            const toggleMute = async () => {
                if (isProcessingRef.current) return;
                if (userSeatRef.current !== null && userSeatRef.current !== undefined && mutedSeatsRef.current[userSeatRef.current]) {
                    safeAlert("This seat is currently muted by the host.");
                    return;
                }
                setIsProcessing(true);
                try {
                    if (!trackRef.current) return;
                    const shouldMute = !isMuted;

                    setIsMuted(shouldMute);

                    const tgData = window.Telegram?.WebApp?.initDataUnsafe?.user || tgUser;
                    const userIdString = String(tgData?.id || "1001");

                    markRecentlyChanged(userIdString);

                    setParticipants(prev => prev.map(p => String(p.user_id) === userIdString ? { ...p, is_muted: shouldMute } : p));

                    if (channelRef.current) {
                        try {
                            channelRef.current.track({
                                user_id: userIdString,
                                user_name: tgData?.first_name || tgData?.username || "Unknown",
                                photo_url: tgData?.photo_url || null,
                                seat_number: userSeatRef.current,
                                is_muted: shouldMute
                            });
                        } catch (e) { console.warn("Mute broadcast failed:", e); }

                        // 🚀 INSTANT PUBLIC UPDATE
                        sendBroadcast('mute_toggle', { target_uid: userIdString, isMuted: shouldMute });
                    }
                } catch (e) {
                    console.error("Safe mute toggle failed:", e);
                } finally {
                    setIsProcessing(false);
                }
            };

            const sendHostAction = (action, targetUid) => {
                try {
                    if (channelRef.current && String(roomRef.current?.host_user_id) === String(tgUser.id)) {
                        channelRef.current.send({ type: 'broadcast', event: action, payload: { target_uid: String(targetUid) } });

                        // 🚀 OPTIMISTIC UI UPDATES FOR HOST (Zero Delay)
                        if (action === 'kick') {
                            participantsRef.current = participantsRef.current.filter(p => String(p.user_id) !== String(targetUid));
                        } else {
                            participantsRef.current = participantsRef.current.map(p => {
                                if (String(p.user_id) === String(targetUid)) {
                                    if (action === 'mute') return { ...p, is_muted: true };
                                    if (action === 'unmute') return { ...p, is_muted: false };
                                    if (action === 'lift_user') return { ...p, seat_number: null, is_muted: true };
                                }
                                return p;
                            });
                        }
                        setParticipants(participantsRef.current);
                    }
                } catch (e) { console.warn("Host Action Error:", e); }
            };

            const sendChat = (text, imageUrl = null) => {
                const payload = { id: Date.now() + Math.random().toString(), userId: String(tgUser.id), userName: tgUser.first_name, userAvatar: tgUser.photo_url, text, imageUrl, time: new Date().toISOString() };
                realtimeChannel?.send({ type: 'broadcast', event: 'text_chat', payload });
                setChatMessages(prev => [...prev, payload]); // Optimistic update
            };

            const updateRoomSettings = async (newName, newPassword, reqMic) => {
                if (!supabase || !roomRef.current) return false;
                try {
                    const { error } = await supabase.from('voice_rooms').update({
                        channel_name: newName,
                        password: newPassword || null,
                        require_mic_request: reqMic
                    }).eq('id', roomRef.current.id);
                    if (error) {
                        let errorMsg = error.message;
                        if (errorMsg.includes('duplicate key') || errorMsg.includes('voice_rooms_channel_name_key')) {
                            errorMsg = "A room with this name already exists! Please choose a different name.";
                        }
                        safeAlert("Failed to update room: " + errorMsg);
                        return false;
                    }
                    return true;
                } catch (err) {
                    return false;
                }
            };

            return { client, activeRoom, availableRooms, participants, isMuted, isSpeakerMuted, activeSpeakers, chatMessages, micRequests, setMicRequests, pendingInvite, setPendingInvite, joinRoom, leaveRoom, createRoom, takeSeat, stepDown, toggleMute, toggleSpeaker, sendHostAction, sendBroadcast, fetchRooms, sendChat, updateRoomSettings, triggerSFX, lockedSeats, setLockedSeats, mutedSeats, setMutedSeats, isMinimized, setIsMinimized, isProcessing, currentMusic, setCurrentMusic };
        };

        const FloatingVoiceWidget = ({ voiceState, onRestore }) => {
            const { activeRoom, isMuted, toggleMute, isSpeakerMuted, toggleSpeaker, leaveRoom, isProcessing } = voiceState;
            const dragRef = useRef({ startX: 0, startY: 0, currentX: 0, currentY: 0, isDragging: false, hasMoved: false });
            const widgetRef = useRef(null);

            if (!activeRoom) return null;

            const handleTouchStart = (e) => {
                dragRef.current.isDragging = true;
                dragRef.current.hasMoved = false;
                dragRef.current.startX = e.touches[0].clientX - dragRef.current.currentX;
                dragRef.current.startY = e.touches[0].clientY - dragRef.current.currentY;
                if (widgetRef.current) {
                    widgetRef.current.style.transition = 'none';
                }
            };
            const handleTouchMove = (e) => {
                if (!dragRef.current.isDragging) return;
                const x = e.touches[0].clientX - dragRef.current.startX;
                const y = e.touches[0].clientY - dragRef.current.startY;
                if (Math.abs(x - dragRef.current.currentX) > 5 || Math.abs(y - dragRef.current.currentY) > 5) {
                    dragRef.current.hasMoved = true;
                }
                dragRef.current.currentX = x;
                dragRef.current.currentY = y;
                if (widgetRef.current) {
                    widgetRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
                }
            };
            const handleTouchEnd = () => {
                dragRef.current.isDragging = false;
                if (widgetRef.current) {
                    widgetRef.current.style.transition = '';
                }
            };
            const handleClick = (e) => {
                if (!dragRef.current.hasMoved) {
                    onRestore();
                }
            };

            return (
                <div
                    ref={widgetRef}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onClick={handleClick}
                    style={{ transform: `translate3d(${dragRef.current.currentX}px, ${dragRef.current.currentY}px, 0)` }}
                    className="fixed bottom-[calc(80px+var(--safe-bottom))] right-4 w-[280px] bg-[#021633]/95 backdrop-blur-md border border-[#00FFFF]/50 rounded-2xl p-3 flex items-center justify-between shadow-[0_0_15px_rgba(0,255,255,0.2)] z-[100] cursor-pointer hover:scale-[1.02] touch-none"
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-[#00FFFF]/20 flex items-center justify-center text-[#00FFFF] animate-pulse shrink-0"><i className="fa-solid fa-volume-high text-xs"></i></div>
                        <div className="truncate">
                            <p className="text-white font-bold text-sm truncate">{activeRoom.channel_name}</p>
                            <p className="text-[#00FFFF] text-[10px] uppercase font-bold tracking-widest">Live Session Active</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                        <button onClick={(e) => { e.stopPropagation(); if (!isProcessing) toggleMute(); }} disabled={isProcessing} className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-gray-700 text-gray-400' : 'bg-[#00FFFF] text-[#010B1C]'} ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}><i className={`fa-solid ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'} text-xs`}></i></button>
                        <button onClick={(e) => { e.stopPropagation(); toggleSpeaker(); }} className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isSpeakerMuted ? 'bg-gray-700 text-gray-400' : 'bg-[#00FFFF] text-[#010B1C]'}`}><i className={`fa-solid ${isSpeakerMuted ? 'fa-volume-xmark' : 'fa-volume-high'} text-xs`}></i></button>
                        <button onClick={(e) => { e.stopPropagation(); if (!isProcessing) leaveRoom(); }} disabled={isProcessing} className={`w-9 h-9 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}><i className="fa-solid fa-phone-slash text-xs"></i></button>
                    </div>
                </div>
            );
        };

        const VoiceRoomsTab = ({ tgUser, voiceState }) => {
            const { activeRoom, leaveRoom, availableRooms, fetchRooms, createRoom, joinRoom, isProcessing } = voiceState;
            const [showCreateModal, setShowCreateModal] = useState(false);
            const [selectedRoomToJoin, setSelectedRoomToJoin] = useState(null);
            const [isRefreshing, setIsRefreshing] = useState(false);
            const [dashboardFilter, setDashboardFilter] = useState('active');

            const tgUserId = String(window.Telegram?.WebApp?.initDataUnsafe?.user?.id || tgUser?.id || "1001");
            const myAdvanceRoom = availableRooms.find(r => String(r.owner_id) === tgUserId && (r.room_type === 'permanent' || r.room_type === 'advance'));

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

            let displayRooms = [];
            if (dashboardFilter === 'active') {
                displayRooms = availableRooms.filter(r => r.id !== myAdvanceRoom?.id);
            } else {
                displayRooms = []; // Mock recent/joined
            }

            return (
                <div className="pb-[80px] animate-in fade-in flex flex-col h-full bg-[#010B1C] text-white">
                    <div className="p-4 flex-1 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 pr-[90px] lg:pr-0">
                            <h2 className="text-2xl font-black text-[#00FFFF] drop-shadow-[0_0_8px_rgba(0,255,255,0.4)] tracking-wide">Voice Lounges</h2>
                            <button onClick={handleRefresh} className="text-[#00FFFF] hover:text-white transition-colors p-2">
                                <i className={`fa-solid fa-sync-alt ${isRefreshing ? 'animate-spin' : ''}`}></i>
                            </button>
                        </div>

                        {/* Pinned Advance Room Section */}
                        <div className="mb-6">
                            {myAdvanceRoom ? (
                                <div onClick={() => handleJoinClick(myAdvanceRoom)} className={`bg-gradient-to-br from-[#1a1c02] to-[#010B1C] rounded-2xl p-4 transition-all ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} relative overflow-hidden group border-2 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)]`}>
                                    <span className="absolute top-0 right-0 bg-gradient-to-r from-[#D4AF37] to-[#F9D33A] text-[#010B1C] text-[9px] font-black px-2 py-1 rounded-bl-lg uppercase tracking-wider">My Advance Room</span>
                                    <div className="relative z-10 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F9D33A] flex items-center justify-center font-bold text-[#010B1C] text-xl shadow-[0_0_10px_rgba(212,175,55,0.5)] overflow-hidden">
                                                {myAdvanceRoom.room_dp_url ? <img src={myAdvanceRoom.room_dp_url} className="w-full h-full object-cover" /> : myAdvanceRoom.channel_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-white mb-1 flex items-center gap-2">
                                                    {myAdvanceRoom.channel_name}
                                                    {myAdvanceRoom.password && <i className="fa-solid fa-lock text-[#F9D33A] text-xs"></i>}
                                                </h3>
                                                <div className="flex text-sm text-[#F9D33A] gap-3">
                                                    <span><i className="fa-solid fa-crown mr-1"></i> Host: You</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-[#010B1C] transition-colors">
                                            <i className="fa-solid fa-arrow-right"></i>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => setShowCreateModal(true)} className="w-full bg-gradient-to-r from-[#D4AF37]/20 to-[#F9D33A]/10 hover:from-[#D4AF37]/30 hover:to-[#F9D33A]/20 border border-[#D4AF37]/50 border-dashed py-4 rounded-2xl font-bold transition-all text-sm uppercase tracking-wider text-[#F9D33A] flex flex-col items-center justify-center gap-2">
                                    <i className="fa-solid fa-crown text-2xl drop-shadow-[0_0_8px_rgba(249,211,58,0.5)]"></i>
                                    Create Premium Advance Room
                                </button>
                            )}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-2 mb-6 bg-[#021633] p-1.5 rounded-xl border border-[#0AE0D0]/20">
                            <button onClick={() => setDashboardFilter('active')} className={`flex-1 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${dashboardFilter === 'active' ? 'bg-[#00FFFF] text-[#010B1C] shadow-[0_0_10px_rgba(0,255,255,0.3)]' : 'text-[#A4DFE6] hover:text-white hover:bg-white/5'}`}>Active</button>
                            <button onClick={() => setDashboardFilter('recent')} className={`flex-1 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${dashboardFilter === 'recent' ? 'bg-[#00FFFF] text-[#010B1C] shadow-[0_0_10px_rgba(0,255,255,0.3)]' : 'text-[#A4DFE6] hover:text-white hover:bg-white/5'}`}>Recent</button>
                            <button onClick={() => setDashboardFilter('joined')} className={`flex-1 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${dashboardFilter === 'joined' ? 'bg-[#00FFFF] text-[#010B1C] shadow-[0_0_10px_rgba(0,255,255,0.3)]' : 'text-[#A4DFE6] hover:text-white hover:bg-white/5'}`}>Joined</button>
                        </div>

                        {!myAdvanceRoom && (
                            <button onClick={() => setShowCreateModal(true)} className="w-full mb-6 bg-gradient-to-r from-[#00A7A7] to-[#00FFFF] text-[#010B1C] shadow-[0_0_15px_rgba(0,255,255,0.4)] py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 active:scale-95">
                                <i className="fa-solid fa-plus"></i> Create Temporary Room
                            </button>
                        )}

                        <div className="space-y-4 pb-20">
                            {displayRooms.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    <i className="fa-solid fa-folder-open text-4xl mb-3 opacity-50"></i>
                                    <p>No rooms found for this filter.</p>
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