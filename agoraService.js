/**
 * ATAXY - Agora Service Layer
 * Handles real-time communication using Agora RTC SDK (Web)
 */

const AGORA_APP_ID = "1711d81c41114b1bb4f102b27147821c";

export const useAgoraVoice = (roomName, user) => {
    const [client, setClient] = React.useState(null);
    const [localAudioTrack, setLocalAudioTrack] = React.useState(null);
    const [isMuted, setIsMuted] = React.useState(true);
    const [remoteUsers, setRemoteUsers] = React.useState([]);
    const [isSpeaker, setIsSpeaker] = React.useState(false);
    const [isConnected, setIsConnected] = React.useState(false);

    React.useEffect(() => {
        if (!roomName) return;
        
        const initAgora = async () => {
            if (!window.AgoraRTC) return;

            // Create a live-broadcasting client to handle roles (Host/Audience)
            const agoraClient = window.AgoraRTC.createClient({ mode: "live", codec: "vp8" });
            setClient(agoraClient);

            agoraClient.on("user-published", async (remoteUser, mediaType) => {
                await agoraClient.subscribe(remoteUser, mediaType);
                if (mediaType === "audio") {
                    remoteUser.audioTrack.play();
                }
                setRemoteUsers(prev => Array.from(new Map([...prev, [remoteUser.uid, remoteUser]]).values()));
            });

            agoraClient.on("user-unpublished", (remoteUser, mediaType) => {
                if (mediaType === "audio" && remoteUser.audioTrack) {
                    remoteUser.audioTrack.stop();
                }
            });

            agoraClient.on("user-left", (remoteUser) => {
                setRemoteUsers(prev => prev.filter(u => u.uid !== remoteUser.uid));
            });

            try {
                // Fetch token first
                const uid = String(user?.id || Math.floor(Math.random() * 10000));
                const apikey = 'sb_publishable_BQ3FzD6jag0nHhYmUu0Bcw_Qq1CEeal';
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apikey}`
                };
                const bodyStr = JSON.stringify({ channelName: String(roomName), uid });

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

                // By default, join as audience
                await agoraClient.setClientRole("audience");
                await agoraClient.join(AGORA_APP_ID, String(roomName), token, uid);
                setIsConnected(true);
            } catch (e) {
                console.error("Agora Join Failed:", e);
            }
        };

        initAgora();

        return () => {
            if (localAudioTrack) {
                localAudioTrack.stop();
                localAudioTrack.close();
            }
            if (client) {
                client.leave();
            }
        };
    }, [roomName]);

    return { 
        client, 
        isConnected, 
        remoteUsers, 
        isMuted, 
        setIsMuted,
        localAudioTrack,
        setLocalAudioTrack,
        isSpeaker, 
        setIsSpeaker 
    };
};