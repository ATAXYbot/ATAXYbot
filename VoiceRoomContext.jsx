import React, { createContext, useContext, useState } from 'react';

export const VoiceRoomContext = createContext(null);

export const VoiceRoomProvider = ({ children, tgUser, activeRoom, supabase, agoraClient, mutedSeats = {} }) => {
    // 1. Supabase Source of Truth for Room Participants
    const [roomParticipants, setRoomParticipants] = useState([]);
    const [localAudioTrack, setLocalAudioTrack] = useState(null);

    const takeSeat = async (seatNum) => {
        if (!tgUser) return;
        
        const tgId = String(tgUser.id);
        
        // Save previous state to revert if the database call fails
        const previousParticipants = [...roomParticipants];
        
        // 2. Optimistic UI Update (Instant visual snap feel)
        setRoomParticipants(prev => {
            const isExisting = prev.some(p => String(p.user_id) === tgId);
            if (isExisting) {
                return prev.map(p => String(p.user_id) === tgId ? { ...p, seat_number: seatNum } : p);
            } else {
                return [...prev, { 
                    user_id: tgId, 
                    user_name: tgUser.first_name, 
                    photo_url: tgUser.photo_url, 
                    seat_number: seatNum 
                }];
            }
        });

        try {
            // 3. Database Operation
            const { error } = await supabase
                .from('room_participants')
                .upsert({ 
                    room_id: activeRoom.id, 
                    user_id: tgId, 
                    seat_number: seatNum,
                    user_name: tgUser.first_name,
                    photo_url: tgUser.photo_url
                });

            if (error) throw error;
            
        } catch (error) {
            console.error("Failed to take seat, reverting state:", error);
            
            // 4. Revert optimistic update
            setRoomParticipants(previousParticipants);
            // Optionally show an alert to the user here
        }
    };

    // --- 1. SEAT-BASED AUDIO TRACK CONTROL ---
    useEffect(() => {
        const syncAgoraState = async () => {
            if (!tgUser || !agoraClient) return;
            
            const tgId = String(tgUser.id);
            const myParticipant = roomParticipants.find(p => String(p.user_id) === tgId);

            if (myParticipant && myParticipant.seat_number !== null) {
                const seatNum = myParticipant.seat_number;
                
                if (mutedSeats[seatNum]) {
                    if (localAudioTrack) await localAudioTrack.setMuted(true);
                } else {
                    await agoraClient.setClientRole("host");
                    if (!localAudioTrack) {
                        const track = await window.AgoraRTC.createMicrophoneAudioTrack();
                        await agoraClient.publish(track);
                        setLocalAudioTrack(track);
                    } else {
                        await localAudioTrack.setMuted(false);
                    }
                }
            } else {
                await agoraClient.setClientRole("audience");
            }
        };
        syncAgoraState();
    }, [roomParticipants, mutedSeats, tgUser, agoraClient, localAudioTrack]);

    // --- 2. FAIL-SAFE CLEANUP ON UNMOUNT ---
    useEffect(() => {
        return () => {
            const cleanup = async () => {
                if (!agoraClient) return;
                try {
                    if (localAudioTrack) {
                        localAudioTrack.stop();
                        localAudioTrack.close();
                    }
                    await agoraClient.unpublish();
                    await agoraClient.leave();
                } catch(e) {
                    console.log("Safe exit bypassed hardware conflict: ", e);
                }
            };
            cleanup();
        };
    }, [agoraClient, localAudioTrack]);

    return (
        <VoiceRoomContext.Provider value={{ roomParticipants, setRoomParticipants, takeSeat, localAudioTrack }}>
            {children}
        </VoiceRoomContext.Provider>
    );
};

export const useVoiceRoom = () => useContext(VoiceRoomContext);