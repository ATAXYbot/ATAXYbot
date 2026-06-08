import React, { createContext, useContext, useState } from 'react';

export const VoiceRoomContext = createContext(null);

export const VoiceRoomProvider = ({ children, tgUser, activeRoom, supabase }) => {
    // 1. Supabase Source of Truth for Room Participants
    const [roomParticipants, setRoomParticipants] = useState([]);

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
            
            // Success: Trigger Agora hardware / audio publishing here
        } catch (error) {
            console.error("Failed to take seat, reverting state:", error);
            
            // 4. Revert optimistic update
            setRoomParticipants(previousParticipants);
            // Optionally show an alert to the user here
        }
    };

    return (
        <VoiceRoomContext.Provider value={{ roomParticipants, setRoomParticipants, takeSeat }}>
            {children}
        </VoiceRoomContext.Provider>
    );
};

export const useVoiceRoom = () => useContext(VoiceRoomContext);