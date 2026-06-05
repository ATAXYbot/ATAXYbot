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

    const joinRoom = async (roomData, password = null) => {
        try {
            // 1. Fetch Token
            const bodyStr = JSON.stringify({ channelName: roomData.channel_name, uid: String(tgUser.id), password });
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
                    volumes.forEach(v => { newMap[v.uid] = v.level > 5; });
                    return newMap; 
                });
            });

            // CRITICAL: Join using String User Account
            await agoraClient.setClientRole("audience");
            await agoraClient.join(AGORA_APP_ID, String(roomData.channel_name), token, String(tgUser?.id || "1001"));
            
            // 3. Setup Supabase Realtime Ephemeral Channel
            await supabase.from('room_participants').upsert({
                room_id: roomData.id, user_id: String(tgUser.id), user_name: tgUser.first_name, seat_number: null
            });

            const channel = supabase.channel(`room:${roomData.id}`)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'room_participants', filter: `room_id=eq.${roomData.id}` }, () => {
                    fetchParticipants(roomData.id);
                })
                .on('broadcast', { event: 'kick' }, (payload) => {
                    if (payload.targetUserId === String(tgUser.id)) leaveRoom();
                })
                .on('broadcast', { event: 'mute' }, (payload) => {
                    if (payload.targetUserId === String(tgUser.id)) {
                        setLocalAudioTrack(t => { t?.setMuted(true); return t; });
                        setIsMuted(true);
                    }
                })
                .on('broadcast', { event: 'text_chat' }, (payload) => {
                    setChatMessages(prev => [...prev, payload]);
                })
                .subscribe();
            
            setRealtimeChannel(channel);
            fetchParticipants(roomData.id);
            setActiveRoom(roomData);
            setChatMessages([]);
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
            await supabase.from('room_participants').delete().match({ room_id: activeRoom.id, user_id: String(tgUser.id) });
            if (realtimeChannel) supabase.removeChannel(realtimeChannel);
        }
        setActiveRoom(null);
        setLocalAudioTrack(null);
        setClient(null);
        setRemoteUsers([]);
        setRealtimeChannel(null);
        setChatMessages([]);
    };

    const toggleMute = async () => {
        if (!client) return;

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
        const payload = { userId: String(tgUser.id), userName: tgUser.first_name, text, time: new Date().toISOString() };
        realtimeChannel?.send({ type: 'broadcast', event: 'text_chat', payload });
        setChatMessages(prev => [...prev, payload]); // Optimistic update
    };

    const hostAction = (action, targetUserId) => {
        realtimeChannel?.send({ type: 'broadcast', event: action, payload: { targetUserId: String(targetUserId) } });
    };

    return (
        <VoiceRoomContext.Provider value={{ client, activeRoom, participants, remoteUsers, isMuted, activeSpeakers, chatMessages, joinRoom, leaveRoom, toggleMute, sendChat, hostAction }}>
            {children}
        </VoiceRoomContext.Provider>
    );
};

export const useVoiceRoom = () => useContext(VoiceRoomContext);