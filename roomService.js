import { useState, useEffect, createContext, useContext, useRef } from 'react';

const SUPABASE_URL = 'https://kwzpnupjtvfrevpwfaao.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_' + 'BQ3FzD6jag0nHhYmUu0Bcw_Qq1CEeal';
const AGORA_APP_ID = "1711d81c41114b1bb4f102b27147821c";

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
    const [chatMessages, setChatMessages] = useState([]);

    const [isMinimized, setIsMinimized] = useState(false);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [lockedSeats, setLockedSeats] = useState({});
    const [mutedSeats, setMutedSeats] = useState({});

    const [peer, setPeer] = useState(null);

    const tgUserExt = window.Telegram?.WebApp?.initDataUnsafe?.user || tgUser || {};
    const tgId = String(tgUserExt.id || "1001");
    const tgName = tgUserExt.first_name || tgUserExt.username || "Anonymous";
    const tgPhoto = tgUserExt.photo_url || null;

    const activeRoomRef = useRef(null);
    useEffect(() => { activeRoomRef.current = activeRoom; }, [activeRoom]);
    const participantsRef = useRef([]);
    useEffect(() => { participantsRef.current = participants; }, [participants]);

    // ===============================================
    // FEATURE: DECENTRALIZED P2P WEBRTC DATA CHANNELS
    // ===============================================
    useEffect(() => {
        const initPeer = () => {
            const newPeer = new window.Peer(String(tgId), { debug: 1 });
            newPeer.on('connection', (conn) => {
                conn.on('data', (data) => handlePeerData(data));
            });
            setPeer(newPeer);
        };
        if (!window.Peer) {
            const script = document.createElement('script');
            script.src = "https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js";
            document.head.appendChild(script);
            script.onload = initPeer;
        } else {
            initPeer();
        }
        return () => peer && peer.destroy();
    }, [tgId]);

    const handlePeerData = (data) => {
        if (!data || !data.type) return;

        if (data.type === 'FRIEND_REQUEST') {
            window.Telegram.WebApp.CloudStorage.getItem('ataxy_pending_friends', (err, val) => {
                const pending = val ? JSON.parse(val) : [];
                if (!pending.includes(data.senderId)) {
                    pending.push(data.senderId);
                    window.Telegram.WebApp.CloudStorage.setItem('ataxy_pending_friends', JSON.stringify(pending));
                    window.dispatchEvent(new Event('dm_updated'));
                }
            });
        } else if (data.type === 'FRIEND_ACCEPT') {
            window.Telegram.WebApp.CloudStorage.getItem('ataxy_friends', (err, val) => {
                const friends = val ? JSON.parse(val) : [];
                if (!friends.includes(data.senderId)) {
                    friends.push(data.senderId);
                    window.Telegram.WebApp.CloudStorage.setItem('ataxy_friends', JSON.stringify(friends));
                    window.dispatchEvent(new Event('dm_updated'));
                }
            });
        } else if (data.type === 'PRIVATE_DM') {
            window.Telegram.WebApp.CloudStorage.getItem('ataxy_friends', (err, fVal) => {
                const friends = fVal ? JSON.parse(fVal) : [];
                const isFriend = friends.includes(data.senderId);
                
                window.Telegram.WebApp.CloudStorage.getItem('dms_' + data.senderId, (err, dVal) => {
                    const history = dVal ? JSON.parse(dVal) : [];
                    
                    // Feature 4: The 2-Message Privacy Guard
                    if (!isFriend && history.filter(m => m.sender === data.senderId).length >= 2) {
                        console.log("Blocked by 2-Message Guard");
                        return; 
                    }
                    
                    history.push({ sender: data.senderId, text: data.text, time: Date.now() });
                    window.Telegram.WebApp.CloudStorage.setItem('dms_' + data.senderId, JSON.stringify(history));
                    window.dispatchEvent(new Event('dm_updated'));
                });
            });
        } else if (data.type === 'room_broadcast') {
            const { event, payload } = data;
            if (event === 'text_chat') setChatMessages(prev => [...prev, payload]);
            else if (event === 'kick' && payload.targetUserId === tgId) leaveRoom();
            else if (event === 'force_mute' && payload.targetUserId === tgId) {
                setLocalAudioTrack(t => { t?.setMuted(true); return t; });
                setIsMuted(true);
            }
            else if (event === 'seat_lock') setLockedSeats(prev => ({ ...prev, [payload.seatNumber]: payload.isLocked }));
            else if (event === 'seat_mute') setMutedSeats(prev => ({ ...prev, [payload.seatNumber]: payload.isMuted }));
            else if (event === 'HOST_CHANGED') setActiveRoom(prev => prev ? { ...prev, host_user_id: payload.newHostId } : null);
            else if (event === 'ROOM_UPDATED') setActiveRoom(prev => prev ? { ...prev, ...payload } : null);
            else if (event === 'refresh_participants') {
                if (activeRoomRef.current) fetchParticipants(activeRoomRef.current.id);
            }
        }
    };

    const broadcastToRoom = (event, payload) => {
        participantsRef.current.forEach(p => {
            if (p.user_id !== tgId && peer) {
                const conn = peer.connect(String(p.user_id));
                conn.on('open', () => {
                    conn.send({ type: 'room_broadcast', event, payload, senderId: tgId });
                    setTimeout(() => conn.close(), 1000);
                });
            }
        });
    };

    const sendFriendRequest = (targetId) => {
        if (peer) {
            const conn = peer.connect(String(targetId));
            conn.on('open', () => {
                conn.send({ type: 'FRIEND_REQUEST', senderId: tgId });
                setTimeout(() => conn.close(), 1000);
            });
        }
    };

    const acceptFriendRequest = (targetId) => {
        window.Telegram.WebApp.CloudStorage.getItem('ataxy_friends', (err, val) => {
            const friends = val ? JSON.parse(val) : [];
            if (!friends.includes(targetId)) {
                friends.push(targetId);
                window.Telegram.WebApp.CloudStorage.setItem('ataxy_friends', JSON.stringify(friends));
            }
        });
        window.Telegram.WebApp.CloudStorage.getItem('ataxy_pending_friends', (err, val) => {
            let pending = val ? JSON.parse(val) : [];
            pending = pending.filter(id => id !== targetId);
            window.Telegram.WebApp.CloudStorage.setItem('ataxy_pending_friends', JSON.stringify(pending));
        });
        window.dispatchEvent(new Event('dm_updated'));
        
        if (peer) {
            const conn = peer.connect(String(targetId));
            conn.on('open', () => {
                conn.send({ type: 'FRIEND_ACCEPT', senderId: tgId });
                setTimeout(() => conn.close(), 1000);
            });
        }
    };

    const sendPrivateDM = (targetId, text) => {
        if (peer) {
            const conn = peer.connect(String(targetId));
            conn.on('open', () => {
                conn.send({ type: 'PRIVATE_DM', senderId: tgId, text });
                setTimeout(() => conn.close(), 1000);
            });
            
            window.Telegram.WebApp.CloudStorage.getItem('dms_' + targetId, (err, val) => {
                const history = val ? JSON.parse(val) : [];
                history.push({ sender: tgId, text, time: Date.now() });
                window.Telegram.WebApp.CloudStorage.setItem('dms_' + targetId, JSON.stringify(history));
                window.dispatchEvent(new Event('dm_updated'));
            });
        }
    };

    // HTTP Discovery Feed Fetcher
    const fetchAvailableRooms = async () => {
        const { data, error } = await supabase.from('rooms').select('*, room_participants(count, seat_number, user_id)').eq('is_live', true);
        if (data && !error) setAvailableRooms(data);
    };

    useEffect(() => {
        if (!supabase) return;
        fetchAvailableRooms();
        const interval = setInterval(fetchAvailableRooms, 15000); // Polling for Discovery Feed 
        return () => clearInterval(interval);
    }, []);

    const createRoom = async (roomName, roomType = 'temporary') => {
        if (!supabase) return;
        try {
            if (roomType === 'advance') {
                const { data: existing } = await supabase.from('rooms').select('id').eq('host_user_id', String(tgId)).eq('room_type', 'advance');
                if (existing && existing.length > 0) { alert("You can only own one permanent Advance Room."); return; }
            }

            const { data, error } = await supabase.from('rooms').insert({
                channel_name: roomName, host_user_id: String(tgId), is_live: true, room_type: roomType, locked_seats: []
            }).select().single();
            if (error) throw error;
            if (data) joinRoom(data);
        } catch (e) { alert("Failed to create room: " + e.message); }
    };

    const joinRoom = async (roomData, password = null) => {
        try {
            const bodyStr = JSON.stringify({ channelName: roomData.channel_name, uid: tgId, password });
            const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` };

            const res = await fetch('https://kwzpnupjtvfrevpwfaao.supabase.co/functions/v1/agora-token', { method: 'POST', headers, body: bodyStr });
            if (!res.ok) throw new Error(`Token fetch failed with status ${res.status}`);

            const data = await res.json();
            if (data.error) throw new Error(data.error);
            
            const token = data.token;
            if (!token) throw new Error("Received an empty token from the server.");

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

            await agoraClient.setClientRole("audience");
            await agoraClient.join(AGORA_APP_ID, String(roomData.channel_name), token, tgId);
            
            // HTTP Setup for Participant Tracking
            await supabase.from('room_participants').upsert({ room_id: roomData.id, user_id: tgId, user_name: tgName, photo_url: tgPhoto, seat_number: null });
            
            fetchParticipants(roomData.id);
            broadcastToRoom('refresh_participants', {});
            
            setActiveRoom(roomData);
            setChatMessages([]);
            setIsMinimized(false);
            
            setLockedSeats((roomData.locked_seats || []).reduce((acc, seatNum) => { acc[seatNum] = true; return acc; }, {}));
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
                await supabase.from('room_participants').delete().match({ room_id: activeRoom.id, user_id: String(tgId) });

                const { data: remaining } = await supabase.from('room_participants').select('*').eq('room_id', activeRoom.id).order('created_at', { ascending: true });

                if (remaining) {
                    const count = remaining.length;
                    
                    // Feature 2: Strict Terminate Rule on 0 participants
                    if (count === 0 && activeRoom.room_type === 'temporary') {
                        await supabase.from('rooms').delete().eq('id', activeRoom.id);
                    } 
                    else if (count > 0 && String(activeRoom.host_user_id) === String(tgId)) {
                        const nextHost = remaining[0];
                        await supabase.from('rooms').update({ host_user_id: String(nextHost.user_id) }).eq('id', activeRoom.id);
                        await supabase.from('room_participants').update({ seat_number: 0 }).eq('room_id', activeRoom.id).eq('user_id', String(nextHost.user_id));
                        
                        broadcastToRoom('HOST_CHANGED', { newHostId: String(nextHost.user_id), roomId: activeRoom.id });
                    }
                }
                broadcastToRoom('refresh_participants', {});
            } catch (error) { console.error("Error during graceful room exit flow:", error); }
        }
        setActiveRoom(null);
        setLocalAudioTrack(null);
        setClient(null);
        setRemoteUsers([]);
        setChatMessages([]);
        setIsMinimized(false);
        setMutedSeats({});
    };

    const toggleMute = async () => {
        if (!client) return;
        const myParticipant = participants.find(p => p.user_id === tgId);
        if (myParticipant && myParticipant.seat_number !== null && myParticipant.seat_number !== undefined) {
            if (mutedSeats[myParticipant.seat_number]) { alert("This seat is currently muted by the host. You cannot unmute."); return; }
        }

        try {
            if (!localAudioTrack) {
                await client.setClientRole("host");
                const track = await window.AgoraRTC.createMicrophoneAudioTrack();
                await client.publish(track);
                setLocalAudioTrack(track);
                setIsMuted(false);
            } else {
                await localAudioTrack.setMuted(!isMuted);
                setIsMuted(!isMuted);
            }
        } catch (err) { alert("Microphone access denied or error occurred."); }
    };

    const sendChat = (text) => {
        const payload = { userId: tgId, userName: tgName, text, time: new Date().toISOString() };
        broadcastToRoom('text_chat', payload);
        setChatMessages(prev => [...prev, payload]);
    };

    const updateRoomSettings = async (updates) => {
        if (!activeRoom || activeRoom.room_type !== 'advance') return;
        try {
            await supabase.from('rooms').update(updates).eq('id', activeRoom.id);
            setActiveRoom(prev => ({ ...prev, ...updates }));
            broadcastToRoom('ROOM_UPDATED', updates);
        } catch(e) {}
    };

    const hostAction = (action, targetUserId, extraPayload = {}) => {
        broadcastToRoom(action, { targetUserId: targetUserId ? String(targetUserId) : null, ...extraPayload });

        if (activeRoom && activeRoom.room_type === 'advance') {
            if (action === 'assign_mod' && targetUserId) {
                supabase.from('room_participants').update({ is_admin: extraPayload.isAdmin }).match({ room_id: activeRoom.id, user_id: String(targetUserId) }).then();
            }
            if (action === 'seat_lock') {
                let currentLocked = activeRoom.locked_seats || [];
                if (extraPayload.isLocked && !currentLocked.includes(extraPayload.seatNumber)) { currentLocked.push(extraPayload.seatNumber); } 
                else if (!extraPayload.isLocked) { currentLocked = currentLocked.filter(s => s !== extraPayload.seatNumber); }
                supabase.from('rooms').update({ locked_seats: currentLocked }).eq('id', activeRoom.id).then();
                setActiveRoom(prev => ({ ...prev, locked_seats: currentLocked }));
            }
        }
    };

    const takeSeat = async (seatNumber) => {
        if (!activeRoom) return;
        if (mutedSeats[seatNumber]) {
            if (localAudioTrack) await localAudioTrack.setMuted(true);
            setIsMuted(true);
        }
        await supabase.from('room_participants').update({ seat_number: seatNumber }).match({ room_id: activeRoom.id, user_id: tgId });
        broadcastToRoom('refresh_participants', {});
        fetchParticipants(activeRoom.id);
    };

    const leaveSeat = async () => {
        if (!activeRoom) return;
        await supabase.from('room_participants').update({ seat_number: null }).match({ room_id: activeRoom.id, user_id: tgId });
        broadcastToRoom('refresh_participants', {});
        fetchParticipants(activeRoom.id);
    };

    // Volume Gatekeepers
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
            isMinimized, setIsMinimized, availableRooms, fetchAvailableRooms,
            takeSeat, leaveSeat, lockedSeats, mutedSeats, createRoom, updateRoomSettings, tgId,
            sendFriendRequest, acceptFriendRequest, sendPrivateDM 
        }}>
            {children}
        </VoiceRoomContext.Provider>
    );
};

export const useVoiceRoom = () => useContext(VoiceRoomContext);