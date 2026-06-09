import { useEffect, useRef, useState } from 'react';

export function useVoiceRoomAudio(supabase, roomId, currentSeatIndex, currentUserId, isMutedByHost, isLocalMuted) {
    const peersRef = useRef({});
    const localStreamRef = useRef(null);
    const channelRef = useRef(null);
    const [remoteStreams, setRemoteStreams] = useState({});
    
    useEffect(() => {
        if (!roomId || !supabase) return;
        
        const channel = supabase.channel(`webrtc:${roomId}`);
        channelRef.current = channel;

        const initWebRTC = async () => {
            const isSpeaker = currentSeatIndex !== null && currentSeatIndex >= 0 && currentSeatIndex <= 3;
            
            if (isSpeaker) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                    localStreamRef.current = stream;
                    
                    const isAudioEnabled = (!isLocalMuted && !isMutedByHost);
                    stream.getAudioTracks().forEach(track => {
                        track.enabled = isAudioEnabled;
                    });
                } catch (err) {
                    console.error('Failed to get local audio', err);
                }
            } else {
                // Automatically clear hardware & network resources if moved to audience
                if (localStreamRef.current) {
                    localStreamRef.current.getTracks().forEach(t => t.stop());
                    localStreamRef.current = null;
                }
                Object.values(peersRef.current).forEach(p => p.close());
                peersRef.current = {};
                setRemoteStreams({});
            }

            channel.on('broadcast', { event: 'webrtc-signaling' }, async ({ payload }) => {
                const { type, senderId, targetId, data } = payload;
                if (targetId !== currentUserId) return; // Not for me

                if (type === 'offer') {
                    const peer = createPeerConnection(senderId, isSpeaker);
                    await peer.setRemoteDescription(new RTCSessionDescription(data));
                    const answer = await peer.createAnswer();
                    await peer.setLocalDescription(answer);
                    channel.send({
                        type: 'broadcast',
                        event: 'webrtc-signaling',
                        payload: { type: 'answer', senderId: currentUserId, targetId: senderId, data: answer }
                    });
                } else if (type === 'answer') {
                    const peer = peersRef.current[senderId];
                    if (peer) {
                        await peer.setRemoteDescription(new RTCSessionDescription(data));
                    }
                } else if (type === 'ice-candidate') {
                    const peer = peersRef.current[senderId];
                    if (peer) {
                        await peer.addIceCandidate(new RTCIceCandidate(data));
                    }
                }
            });

            channel.subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    channel.send({
                        type: 'broadcast',
                        event: 'peer-join',
                        payload: { senderId: currentUserId, isSpeaker }
                    });
                }
            });

            channel.on('broadcast', { event: 'peer-join' }, async ({ payload }) => {
                const { senderId, isSpeaker: senderIsSpeaker } = payload;
                if (senderId === currentUserId) return;
                
                if (isSpeaker || senderIsSpeaker) {
                     const peer = createPeerConnection(senderId, isSpeaker);
                     const offer = await peer.createOffer();
                     await peer.setLocalDescription(offer);
                     channel.send({
                         type: 'broadcast',
                         event: 'webrtc-signaling',
                         payload: { type: 'offer', senderId: currentUserId, targetId: senderId, data: offer }
                     });
                }
            });
            
            channel.on('broadcast', { event: 'peer-leave' }, ({ payload }) => {
                const { senderId } = payload;
                if (peersRef.current[senderId]) {
                    peersRef.current[senderId].close();
                    delete peersRef.current[senderId];
                    setRemoteStreams(prev => {
                        const newStreams = { ...prev };
                        delete newStreams[senderId];
                        return newStreams;
                    });
                }
            });
        };

        const createPeerConnection = (peerId, amISpeaker) => {
            if (peersRef.current[peerId]) return peersRef.current[peerId];

            const peer = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });

            if (amISpeaker && localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => {
                    peer.addTrack(track, localStreamRef.current);
                });
            }

            peer.onicecandidate = (event) => {
                if (event.candidate) {
                    channel.send({
                        type: 'broadcast',
                        event: 'webrtc-signaling',
                        payload: { type: 'ice-candidate', senderId: currentUserId, targetId: peerId, data: event.candidate }
                    });
                }
            };

            peer.ontrack = (event) => {
                setRemoteStreams(prev => ({
                    ...prev,
                    [peerId]: event.streams[0]
                }));
            };

            peersRef.current[peerId] = peer;
            return peer;
        };

        initWebRTC();

        return () => {
            if (channelRef.current) {
                channelRef.current.send({
                    type: 'broadcast',
                    event: 'peer-leave',
                    payload: { senderId: currentUserId }
                });
                supabase.removeChannel(channelRef.current);
            }
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(t => t.stop());
            }
            Object.values(peersRef.current).forEach(p => p.close());
            peersRef.current = {};
            setRemoteStreams({});
        };
    }, [roomId, currentSeatIndex, currentUserId]);

    useEffect(() => {
        if (localStreamRef.current) {
            const isAudioEnabled = (!isLocalMuted && !isMutedByHost);
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = isAudioEnabled;
            });
        }
    }, [isMutedByHost, isLocalMuted]);

    return { remoteStreams };
}