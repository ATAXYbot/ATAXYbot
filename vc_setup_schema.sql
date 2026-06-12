-- Enable UUID extension just in case
-- ====================================================================================
-- THE ULTIMATE WEPLAY REPLICA SUPABASE SQL SCRIPT
-- Run this in your Supabase SQL Editor to instantly fix all VC room bugs!
-- ====================================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create Active Rooms Table
CREATE TABLE IF NOT EXISTS public.active_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id_5_digit INTEGER UNIQUE DEFAULT floor(random() * 90000 + 10000)::int,
    room_name TEXT NOT NULL,
    host_id TEXT NOT NULL,
    host_name TEXT DEFAULT 'Host',
    host_photo TEXT,
    password TEXT,
    chat_disabled BOOLEAN DEFAULT false,
    require_mic_request BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Seats Table (The Stage)
CREATE TABLE IF NOT EXISTS public.room_seats (
    room_id UUID REFERENCES public.active_rooms(id) ON DELETE CASCADE,
    seat_index INTEGER CHECK (seat_index >= 0 AND seat_index <= 3),
    user_id TEXT,
    user_name TEXT,
    photo_url TEXT,
    is_locked BOOLEAN DEFAULT false,
    is_muted_by_host BOOLEAN DEFAULT false,
    PRIMARY KEY (room_id, seat_index)
);

-- 3. Create Audience Table
CREATE TABLE IF NOT EXISTS public.room_audience (
    room_id UUID REFERENCES public.active_rooms(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_name TEXT,
    photo_url TEXT,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (room_id, user_id)
);

-- 4. Create Messages Table (Live Chat)
CREATE TABLE IF NOT EXISTS public.room_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.active_rooms(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_name TEXT,
    user_avatar TEXT,
    message TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================================
-- BUG FIX 1: Prevent Duplicate Seating (User sitting on multiple seats at once)
-- ====================================================================================
DROP INDEX IF EXISTS unique_user_per_room_seat;
CREATE UNIQUE INDEX unique_user_per_room_seat 
ON public.room_seats (room_id, user_id) 
WHERE user_id IS NOT NULL;

-- ====================================================================================
-- BUG FIX 2: Strict 12-User Capacity Constraint
-- ====================================================================================
CREATE OR REPLACE FUNCTION public.check_room_capacity()
RETURNS TRIGGER AS $$
DECLARE
    seat_count INT;
    audience_count INT;
BEGIN
    SELECT COUNT(user_id) INTO seat_count FROM public.room_seats WHERE room_id = NEW.room_id AND user_id IS NOT NULL;
    SELECT COUNT(*) INTO audience_count FROM public.room_audience WHERE room_id = NEW.room_id;
    
    IF (seat_count + audience_count) >= 12 THEN
        RAISE EXCEPTION 'Room is at full capacity (12 users max)';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_room_capacity ON public.room_audience;
CREATE TRIGGER enforce_room_capacity BEFORE INSERT ON public.room_audience FOR EACH ROW EXECUTE FUNCTION public.check_room_capacity();

DROP TRIGGER IF EXISTS enforce_seat_capacity ON public.room_seats;
CREATE TRIGGER enforce_seat_capacity BEFORE UPDATE ON public.room_seats FOR EACH ROW WHEN (OLD.user_id IS NULL AND NEW.user_id IS NOT NULL) EXECUTE FUNCTION public.check_room_capacity();

-- ====================================================================================
-- BUG FIX 3: Atomic Seat Movement RPC (Fixes UI Desync and Ghost Seat Occupancy)
-- ====================================================================================
CREATE OR REPLACE FUNCTION public.move_to_seat(p_room_id UUID, p_seat_index INT, p_user_id TEXT, p_user_name TEXT DEFAULT NULL, p_photo_url TEXT DEFAULT NULL, p_force BOOLEAN DEFAULT false)
RETURNS BOOLEAN AS $$
DECLARE
    v_target_locked BOOLEAN;
    v_target_occupant TEXT;
BEGIN
    -- A. Check if the target seat is locked or already occupied by someone else
    SELECT is_locked, user_id INTO v_target_locked, v_target_occupant
    FROM public.room_seats 
    WHERE room_id = p_room_id AND seat_index = p_seat_index;

    IF v_target_locked AND NOT p_force THEN
        RAISE EXCEPTION 'Seat is locked by the host';
    END IF;

    IF v_target_occupant IS NOT NULL AND v_target_occupant != p_user_id THEN
        RAISE EXCEPTION 'Seat is already occupied';
    END IF;

    -- B. Clear user from ANY other seat they currently occupy in this room (Instant Lift)
    UPDATE public.room_seats 
    SET user_id = NULL, user_name = NULL, photo_url = NULL 
    WHERE room_id = p_room_id AND user_id = p_user_id AND seat_index != p_seat_index;
    
    -- C. Drop the user into the target seat
    UPDATE public.room_seats 
    SET user_id = p_user_id, user_name = p_user_name, photo_url = p_photo_url 
    WHERE room_id = p_room_id AND seat_index = p_seat_index;
    
    -- D. Ensure they are removed from the audience
    DELETE FROM public.room_audience 
    WHERE room_id = p_room_id AND user_id = p_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================================
-- BUG FIX 4: Emergency Leave RPC for Swiping Away / Disconnects
-- ====================================================================================
CREATE OR REPLACE FUNCTION public.emergency_leave_vc_room(p_room_id UUID, p_user_id TEXT, p_is_host BOOLEAN)
RETURNS VOID AS $$
DECLARE
    v_next_host RECORD;
    v_remaining_count INT;
BEGIN
    UPDATE public.room_seats SET user_id = NULL, user_name = NULL, photo_url = NULL WHERE room_id = p_room_id AND user_id = p_user_id;
    DELETE FROM public.room_audience WHERE room_id = p_room_id AND user_id = p_user_id;

    SELECT (
        (SELECT COUNT(*) FROM public.room_seats WHERE room_id = p_room_id AND user_id IS NOT NULL) +
        (SELECT COUNT(*) FROM public.room_audience WHERE room_id = p_room_id)
    ) INTO v_remaining_count;

    IF v_remaining_count = 0 THEN
        DELETE FROM public.active_rooms WHERE id = p_room_id;
    ELSIF p_is_host THEN
        SELECT * INTO v_next_host FROM public.room_seats WHERE room_id = p_room_id AND user_id IS NOT NULL AND seat_index > 0 ORDER BY seat_index ASC LIMIT 1;
        IF FOUND THEN
            UPDATE public.active_rooms SET host_id = v_next_host.user_id, host_name = v_next_host.user_name, host_photo = v_next_host.photo_url WHERE id = p_room_id;
            UPDATE public.room_seats SET user_id = NULL, user_name = NULL, photo_url = NULL WHERE room_id = p_room_id AND seat_index = v_next_host.seat_index;
            UPDATE public.room_seats SET user_id = v_next_host.user_id, user_name = v_next_host.user_name, photo_url = v_next_host.photo_url WHERE room_id = p_room_id AND seat_index = 0;
        ELSE
            SELECT * INTO v_next_host FROM public.room_audience WHERE room_id = p_room_id ORDER BY joined_at ASC LIMIT 1;
            IF FOUND THEN
                UPDATE public.active_rooms SET host_id = v_next_host.user_id, host_name = v_next_host.user_name, host_photo = v_next_host.photo_url WHERE id = p_room_id;
                DELETE FROM public.room_audience WHERE room_id = p_room_id AND user_id = v_next_host.user_id;
                UPDATE public.room_seats SET user_id = v_next_host.user_id, user_name = v_next_host.user_name, photo_url = v_next_host.photo_url WHERE room_id = p_room_id AND seat_index = 0;
            ELSE
                DELETE FROM public.active_rooms WHERE id = p_room_id;
            END IF;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================================
-- SECURITY: Free Access for WebRTC Signaling (Row Level Security)
-- ====================================================================================
ALTER TABLE public.active_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_audience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.active_rooms TO anon, authenticated;
GRANT ALL ON TABLE public.room_seats TO anon, authenticated;
GRANT ALL ON TABLE public.room_audience TO anon, authenticated;
GRANT ALL ON TABLE public.room_messages TO anon, authenticated;

-- Bulletproof explicit permissive policies for API Roles
DROP POLICY IF EXISTS "Enable all actions for public" ON public.active_rooms;
CREATE POLICY "Enable full access for active_rooms" ON public.active_rooms FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all actions for public" ON public.room_seats;
CREATE POLICY "Enable full access for room_seats" ON public.room_seats FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all actions for public" ON public.room_audience;
CREATE POLICY "Enable full access for room_audience" ON public.room_audience FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all actions for public" ON public.room_messages;
CREATE POLICY "Enable full access for room_messages" ON public.room_messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Refresh the API Cache to instantly reflect these new functions and columns
NOTIFY pgrst, 'reload schema';