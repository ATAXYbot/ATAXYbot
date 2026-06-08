// LAYER 3: FRONTEND STATE ENGINE & STRING SIGN-IN
import { useState, useEffect, createContext, useContext } from 'react';

const SUPABASE_URL = 'https://kwzpnupjtvfrevpwfaao.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_' + 'BQ3FzD6jag0nHhYmUu0Bcw_Qq1CEeal';
const AGORA_APP_ID = "1711d81c" + "41114b1bb4f102b27147821c";

const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const VoiceRoomContext = createContext(null);

export const VoiceRoomProvider = ({ children, tgUser }) => {
    const [client, setClient] = useState(null);
    const [activeRoom, setActiveRoom] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [localAudioTrack, setLocalAudioTrack] = useState(null);
    const [isMuted, setIsMuted] = useState(true);
    const [remoteUsers, setRemoteUsers] = useState([]);
    const [activeSpeakers, setActiveSpeakers] = useState({});
    const [realtimeChannel, setRealtimeChannel] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);

    // NEW: WePlay features
    const [isMinimized, setIsMinimized] = useState(false);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [lockedSeats, setLockedSeats] = useState({});
    const [mutedSeats, setMutedSeats] = useState({});

    // Telegram Profile Extraction
    const tgUserExt = window.Telegram?.WebApp?.initDataUnsafe?.user || tgUser || {};
    const tgId = String(tgUserExt.id || "1001");
    const tgName = tgUserExt.first_name || tgUserExt.username || "Anonymous";
    const tgPhoto = tgUserExt.photo_url || null;

    useEffect(() => {
        if (!supabase) return;
        fetchAvailableRooms();
        const channel = supabase.channel('public:rooms')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
                fetchAvailableRooms();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'room_participants' }, () => {
                fetchAvailableRooms();
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    const fetchAvailableRooms = async () => {
        const { data, error } = await supabase.from('rooms').select('*, room_participants(count)').eq('is_live', true);
        if (data && !error) setAvailableRooms(data);
    };

    const createRoom = async (roomName, roomType = 'temporary') => {
        if (!supabase) return;
        try {
            // 1. THE ONE-ROOM ENFORCEMENT CHECK
            if (roomType === 'advance') {
                const { data: existing } = await supabase.from('rooms')
                    .select('id')
                    .eq('host_user_id', String(tgId))
                    .eq('room_type', 'advance');
                
                if (existing && existing.length > 0) {
                    alert("You can only own one permanent Advance Room.");
                    return;
                }
            }

            const { data, error } = await supabase.from('rooms').insert({
                channel_name: roomName, host_user_id: String(tgId), is_live: true, room_type: roomType, locked_seats: []
            }).select().single();
            if (error) throw error;
            if (data) joinRoom(data);
        } catch (e) {
            alert("Failed to create room: " + e.message);
        }
    };

    const joinRoom = async (roomData, password = null) => {
        try {
            // 1. Fetch Token
            const bodyStr = JSON.stringify({ channelName: roomData.channel_name, uid: tgId, password });
            const headers = { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            };

            const res = await fetch('https://kwzpnupjtvfrevpwfaao.supabase.co/functions/v1/agora-token', {
                method: 'POST',
                headers: headers,
                body: bodyStr
            });
            
            if (!res.ok) {
                let errData;
                try { errData = await res.json(); } catch (e) { throw new Error(`Token fetch failed with status ${res.status}`); }
                throw new Error(errData?.error || `Token fetch failed with status ${res.status}`);
            }

            const data = await res.json();
            if (data.error) throw new Error(data.error);
            
            const token = data.token;
            if (!token) throw new Error("Received an empty token from the server.");

            // 2. Initialize Agora
            const agoraClient = window.AgoraRTC.createClient({ mode: "live", codec: "vp8" });
            setClient(agoraClient);
            
            agoraClient.on("user-published", async (user, mediaType) => {
                await agoraClient.subscribe(user, mediaType);
                if (mediaType === "audio") user.audioTrack.play();
                setRemoteUsers(prev => Array.from(new Map([...prev, [user.uid, user]]).values()));
            });
            
            agoraClient.on("user-unpublished", (user) => setRemoteUsers(prev => Array.from(new Map([...prev, [user.uid, user]]).values())));
            agoraClient.on("user-left", (user) => setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid)));
            
            agoraClient.enableAudioVolumeIndicator();
            agoraClient.on("volume-indicator", (volumes) => {
                setActiveSpeakers(prev => {
                    const newMap = { ...prev };
                    volumes.forEach(v => { newMap[v.uid] = v.level > 10; });
                    return newMap; 
                });
            });

            // CRITICAL: Join using String User Account
            await agoraClient.setClientRole("audience");
            await agoraClient.join(AGORA_APP_ID, String(roomData.channel_name), token, tgId);
            
            // 3. Setup Supabase Realtime Ephemeral Channel
            await supabase.from('room_participants').upsert({
                room_id: roomData.id, user_id: tgId, user_name: tgName, photo_url: tgPhoto, seat_number: null
            });

            const channel = supabase.channel(`room:${roomData.id}`)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'room_participants', filter: `room_id=eq.${roomData.id}` }, () => {
                    fetchParticipants(roomData.id);
                })
                .on('broadcast', { event: 'kick' }, (payload) => {
                    if (payload.targetUserId === tgId) leaveRoom();
                })
                .on('broadcast', { event: 'force_mute' }, (payload) => {
                    if (payload.targetUserId === tgId) {
                        setLocalAudioTrack(t => { t?.setMuted(true); return t; });
                        setIsMuted(true);
                    }
                })
                .on('broadcast', { event: 'seat_lock' }, (payload) => {
                    setLockedSeats(prev => ({ ...prev, [payload.seatNumber]: payload.isLocked }));
                })
                .on('broadcast', { event: 'seat_mute' }, (payload) => {
                    setMutedSeats(prev => ({ ...prev, [payload.seatNumber]: payload.isMuted }));
                })
                .on('broadcast', { event: 'text_chat' }, (payload) => {
                    setChatMessages(prev => [...prev, payload]);
                })
                .on('broadcast', { event: 'HOST_CHANGED' }, (payload) => {
                    setActiveRoom(prev => prev ? { ...prev, host_user_id: payload.newHostId } : null);
                })
                .on('broadcast', { event: 'ROOM_UPDATED' }, (payload) => {
                    setActiveRoom(prev => prev ? { ...prev, ...payload } : null);
                })
                .subscribe();
            
            setRealtimeChannel(channel);
            fetchParticipants(roomData.id);
            setActiveRoom(roomData);
            setChatMessages([]);
            setIsMinimized(false);
            
            // Pre-load DB locked seats state into UI dictionary
            setLockedSeats(
                (roomData.locked_seats || []).reduce((acc, seatNum) => {
                    acc[seatNum] = true;
                    return acc;
                }, {})
            );
            setMutedSeats({});
            return true;
        } catch (e) {
            alert("Failed to join room: " + e.message);
            return false;
        }
    };

    const fetchParticipants = async (roomId) => {
        const { data } = await supabase.from('room_participants').select('*').eq('room_id', roomId);
        if (data) setParticipants(data);
    };

    const leaveRoom = async () => {
        if (localAudioTrack) { localAudioTrack.stop(); localAudioTrack.close(); }
        if (client) await client.leave();
        if (activeRoom) {
            try {
                // 1. Remove the user from the room_participants table
                await supabase.from('room_participants')
                    .delete()
                    .match({ room_id: activeRoom.id, user_id: String(tgId) });

                // 2. Query remaining participants to check for termination or host transfer
                const { data: remaining, error: queryError } = await supabase
                    .from('room_participants')
                    .select('*')
                    .eq('room_id', activeRoom.id)
                    .order('created_at', { ascending: true }); // Oldest remaining user first

                if (!queryError && remaining) {
                    const count = remaining.length;

                    // 3. AUTOMATIC TERMINATION CONSTRAINTS
                    if (count === 0 && activeRoom.room_type === 'temporary') {
                        await supabase.from('rooms')
                            .update({ is_live: false })
                            .eq('id', activeRoom.id);
                    } 
                    // 4. AUTOMATIC HOST TRANSFER CONSTRAINTS
                    else if (count > 0 && String(activeRoom.host_user_id) === String(tgId)) {
                        const nextHost = remaining[0];
                        
                        await supabase.from('rooms')
                            .update({ host_user_id: String(nextHost.user_id) })
                            .eq('id', activeRoom.id);
                        
                        await supabase.from('room_participants')
                            .update({ seat_number: 0 })
                            .eq('room_id', activeRoom.id)
                            .eq('user_id', String(nextHost.user_id));
                        
                        realtimeChannel?.send({
                            type: 'broadcast',
                            event: 'HOST_CHANGED',
                            payload: { newHostId: String(nextHost.user_id), roomId: activeRoom.id }
                        });
                    }
                }
            } catch (error) {
                console.error("Error during graceful room exit flow:", error);
            }

            if (realtimeChannel) supabase.removeChannel(realtimeChannel);
        }
        setActiveRoom(null);
        setLocalAudioTrack(null);
        setClient(null);
        setRemoteUsers([]);
        setRealtimeChannel(null);
        setChatMessages([]);
        setIsMinimized(false);
        setMutedSeats({});
    };

    const toggleMute = async () => {
        if (!client) return;

        const myParticipant = participants.find(p => p.user_id === tgId);
        if (myParticipant && myParticipant.seat_number !== null && myParticipant.seat_number !== undefined) {
            if (mutedSeats[myParticipant.seat_number]) {
                alert("This seat is currently muted by the host. You cannot unmute.");
                return;
            }
        }

        try {
            if (!localAudioTrack) {
                // If no track exists, upgrade to host, create mic track, and publish
                await client.setClientRole("host");
                const track = await window.AgoraRTC.createMicrophoneAudioTrack();
                await client.publish(track);
                setLocalAudioTrack(track);
                setIsMuted(false);
            } else {
                // Toggle existing track
                await localAudioTrack.setMuted(!isMuted);
                setIsMuted(!isMuted);
            }
        } catch (err) {
            console.error("Failed to toggle mute/publish:", err);
            alert("Microphone access denied or error occurred.");
        }
    };

    const sendChat = (text) => {
        const payload = { userId: tgId, userName: tgName, text, time: new Date().toISOString() };
        realtimeChannel?.send({ type: 'broadcast', event: 'text_chat', payload });
        setChatMessages(prev => [...prev, payload]); // Optimistic update
    };

    const updateRoomSettings = async (updates) => {
        if (!activeRoom || activeRoom.room_type !== 'advance') return;
        try {
            await supabase.from('rooms').update(updates).eq('id', activeRoom.id);
            setActiveRoom(prev => ({ ...prev, ...updates }));
            
            realtimeChannel?.send({ type: 'broadcast', event: 'ROOM_UPDATED', payload: updates });
        } catch(e) {
            console.error("Failed to update settings", e);
        }
    };

    const hostAction = (action, targetUserId, extraPayload = {}) => {
        realtimeChannel?.send({ type: 'broadcast', event: action, payload: { targetUserId: targetUserId ? String(targetUserId) : null, ...extraPayload } });

        if (activeRoom && activeRoom.room_type === 'advance') {
            if (action === 'assign_mod' && targetUserId) {
                supabase.from('room_participants')
                    .update({ is_admin: extraPayload.isAdmin })
                    .match({ room_id: activeRoom.id, user_id: String(targetUserId) })
                    .then(); // Fire and forget
            }
            if (action === 'seat_lock') {
                let currentLocked = activeRoom.locked_seats || [];
                if (extraPayload.isLocked && !currentLocked.includes(extraPayload.seatNumber)) {
                    currentLocked.push(extraPayload.seatNumber);
                } else if (!extraPayload.isLocked) {
                    currentLocked = currentLocked.filter(s => s !== extraPayload.seatNumber);
                }
                supabase.from('rooms').update({ locked_seats: currentLocked }).eq('id', activeRoom.id).then();
                setActiveRoom(prev => ({ ...prev, locked_seats: currentLocked }));
            }
        }
    };

    const takeSeat = async (seatNumber) => {
        if (!activeRoom) return;
        if (mutedSeats[seatNumber]) {
            if (localAudioTrack) {
                await localAudioTrack.setMuted(true);
            }
            setIsMuted(true);
        }
        await supabase.from('room_participants').update({ seat_number: seatNumber }).match({ room_id: activeRoom.id, user_id: tgId });
    };

    const leaveSeat = async () => {
        if (!activeRoom) return;
        await supabase.from('room_participants').update({ seat_number: null }).match({ room_id: activeRoom.id, user_id: tgId });
    };

    // 1. LOCAL MICROPHONE LAW (Enforce seat-based muting on the local user)
    useEffect(() => {
        const enforceLocalMute = async () => {
            const myParticipant = participants.find(p => p.user_id === tgId);
            if (myParticipant && myParticipant.seat_number !== null && myParticipant.seat_number !== undefined) {
                const seatNum = myParticipant.seat_number;
                if (mutedSeats[seatNum] && localAudioTrack && !isMuted) {
                    await localAudioTrack.setMuted(true);
                    setIsMuted(true);
                }
            }
        };
        enforceLocalMute();
    }, [mutedSeats, participants, localAudioTrack, isMuted, tgId]);

    // 2. REMOTE STREAM GATEKEEPER (Fail-safe audio leak prevention via volume)
    useEffect(() => {
        if (!client) return;
        client.remoteUsers.forEach(rUser => {
            if (rUser.audioTrack) {
                const participant = participants.find(p => String(p.user_id) === String(rUser.uid));
                let seatMuted = false;
                if (participant && participant.seat_number !== null && participant.seat_number !== undefined) {
                    seatMuted = !!mutedSeats[participant.seat_number];
                }
                const shouldBeMuted = (participant && participant.is_muted) || seatMuted;
                try { rUser.audioTrack.setVolume(shouldBeMuted ? 0 : 100); } catch (e) {}
            }
        });
    }, [mutedSeats, participants, client, remoteUsers]);

    return (
        <VoiceRoomContext.Provider value={{ 
            client, activeRoom, participants, remoteUsers, isMuted, activeSpeakers, chatMessages, 
            joinRoom, leaveRoom, toggleMute, sendChat, hostAction,
            isMinimized, setIsMinimized, availableRooms,
            takeSeat, leaveSeat, lockedSeats, mutedSeats, createRoom, updateRoomSettings, tgId 
        }}>
            {children}
        </VoiceRoomContext.Provider>
    );
};

export const useVoiceRoom = () => useContext(VoiceRoomContext);