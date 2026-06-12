-- ==============================================================
-- LAYER 1: VOICE ROOMS SCHEMA & SPATIAL HOST-TRANSFER TRIGGERS (TELEGRAM STRING FIX VERIFIED)
-- ==============================================================

-- 1. Voice Rooms Table
CREATE TABLE voice_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_name TEXT UNIQUE NOT NULL,
    host_user_id TEXT NOT NULL, -- MUST BE TEXT for Telegram IDs
    owner_id TEXT,
    password TEXT,
    room_type TEXT DEFAULT 'temporary' CHECK (room_type IN ('temporary', 'permanent')),
    is_live BOOLEAN DEFAULT true,
    is_partner_seat_open BOOLEAN DEFAULT false,
    require_mic_request BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now()
);

-- 2. Room Participants Table
CREATE TABLE room_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES voice_rooms(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- MUST BE TEXT for Telegram IDs
    user_name TEXT,
    seat_number INTEGER CHECK (seat_number >= 0 AND seat_number <= 9),
    joined_at TIMESTAMP DEFAULT now()
);

-- 3. Spatial Host-Transfer Trigger Logic
CREATE OR REPLACE FUNCTION handle_participant_leave()
RETURNS TRIGGER AS $$
DECLARE
    v_room RECORD;
    v_next_host RECORD;
    v_participant_count INTEGER;
BEGIN
    SELECT * INTO v_room FROM voice_rooms WHERE id = OLD.room_id;
    IF NOT FOUND THEN RETURN OLD; END IF;

    SELECT COUNT(*) INTO v_participant_count FROM room_participants WHERE room_id = OLD.room_id;

    -- Rule: 0 Participants -> Close or Delete Room
    IF v_participant_count = 0 THEN
        IF v_room.room_type = 'temporary' THEN
            DELETE FROM voice_rooms WHERE id = OLD.room_id;
        ELSE
            UPDATE voice_rooms SET is_live = false, host_user_id = owner_id WHERE id = OLD.room_id;
        END IF;
        RETURN OLD;
    END IF;

    -- Rule: Host Left -> Transfer Power Spatially (Seat 1 -> 9)
    IF OLD.seat_number = 0 THEN
        SELECT * INTO v_next_host FROM room_participants 
        WHERE room_id = OLD.room_id AND seat_number > 0 AND seat_number <= 9
        ORDER BY seat_number ASC LIMIT 1;

        IF FOUND THEN
            UPDATE voice_rooms SET host_user_id = v_next_host.user_id WHERE id = OLD.room_id;
            UPDATE room_participants SET seat_number = 0 WHERE id = v_next_host.id;
        ELSE
                -- No one on mic -> No one is host, but audience can stay
                UPDATE voice_rooms SET host_user_id = 'no_host' WHERE id = OLD.room_id;
        END IF;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_participant_leave
AFTER DELETE ON room_participants
FOR EACH ROW
EXECUTE FUNCTION handle_participant_leave();