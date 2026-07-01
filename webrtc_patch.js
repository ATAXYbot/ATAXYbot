const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Add `peer.on('call')` logic in `initPeer`
const initPeerStart = content.indexOf(`peerRef.current = peer;`);
if (initPeerStart !== -1) {
    const replacement = `peerRef.current = peer;
                    window.vcPeerRef = peer;

                    peer.on('call', (call) => {
                        // Answer incoming audio calls automatically
                        if (trackRef.current && trackRef.current.getMediaStreamTrack) {
                            const ms = new MediaStream([trackRef.current.getMediaStreamTrack()]);
                            call.answer(ms);
                        } else if (localMediaStreamRef.current) {
                            call.answer(localMediaStreamRef.current);
                        } else {
                            call.answer(); // Answer without stream if listening only
                        }
                        
                        call.on('stream', (remoteStream) => {
                            const audio = new Audio();
                            audio.srcObject = remoteStream;
                            audio.play().catch(e => console.error("PeerJS Audio play failed:", e));
                            
                            // To manage volume indicator for PeerJS, you can set up AudioContext here
                            // but for now, just play it
                        });
                    });`;
    content = content.replace(`peerRef.current = peer;`, replacement);
}

// 2. Add `localMediaStreamRef` and `mediaCallsRef` at the top of `useVoiceRoom`
const refStart = content.indexOf(`const trackRef = useRef(null);`);
if (refStart !== -1) {
    content = content.replace(`const trackRef = useRef(null);`, `const trackRef = useRef(null);
            const localMediaStreamRef = useRef(null);
            const mediaCallsRef = useRef({});`);
}

// 3. Update `syncHardwareWithState` to branch between Agora and WebRTC
const syncHardwareRegex = /const syncHardwareWithState = async \(\) => \{[\s\S]*?if \(!clientRef\.current\) return;/;
const newSyncHardware = `const syncHardwareWithState = async () => {
                    const tgData = window.Telegram?.WebApp?.initDataUnsafe?.user || tgUser;
                    const userIdString = String(tgData?.id || "1001");
                    const myParticipant = participants.find(p => String(p.user_id) === userIdString);
                    const hasSeat = myParticipant && myParticipant.seat_number !== null && myParticipant.seat_number !== undefined;
                    
                    const isTempRoom = activeRoom && activeRoom.room_type !== 'permanent' && activeRoom.room_type !== 'advance';

                    if (isTempRoom) {
                        // WEBRTC PEERJS LOGIC FOR TEMPORARY ROOMS
                        try {
                            const seatIsMuted = myParticipant ? (mutedSeats[myParticipant.seat_number] || false) : false;
                            const effectiveMute = isMutedRef.current || seatIsMuted;

                            if (hasSeat) {
                                if (!localMediaStreamRef.current) {
                                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                                    localMediaStreamRef.current = stream;
                                    setLocalAudioTrack({ isPeerJs: true }); // Dummy object just to signify we are live
                                    
                                    // Call all other seated peers
                                    const activePeer = window.vcPeerRef;
                                    if (activePeer) {
                                        [...participants.filter(p => p && p.seat_number !== null && p.seat_number !== undefined)].forEach(p => {
                                            if (String(p.user_id) !== userIdString) {
                                                const targetPeerId = \`ataxy-vc-\${p.user_id}\`;
                                                const call = activePeer.call(targetPeerId, stream);
                                                if (call) {
                                                    mediaCallsRef.current[targetPeerId] = call;
                                                    call.on('stream', (remoteStream) => {
                                                        const audio = new Audio();
                                                        audio.srcObject = remoteStream;
                                                        audio.play().catch(e => {});
                                                    });
                                                }
                                            }
                                        });
                                    }
                                }
                                
                                // Apply mute
                                if (localMediaStreamRef.current) {
                                    localMediaStreamRef.current.getAudioTracks().forEach(t => t.enabled = !effectiveMute);
                                }
                            } else {
                                if (localMediaStreamRef.current) {
                                    localMediaStreamRef.current.getTracks().forEach(t => t.stop());
                                    localMediaStreamRef.current = null;
                                    setLocalAudioTrack(null);
                                    
                                    Object.values(mediaCallsRef.current).forEach(call => call.close());
                                    mediaCallsRef.current = {};
                                }
                            }
                        } catch (e) { console.error("WebRTC Error:", e); }
                        return;
                    }

                    // AGORA LOGIC FOR OFFICIAL ROOMS
                    if (!clientRef.current) return;`;

content = content.replace(syncHardwareRegex, newSyncHardware);

fs.writeFileSync('index.html', content);
console.log('Successfully patched index.html for WebRTC PeerJS Audio support!');
