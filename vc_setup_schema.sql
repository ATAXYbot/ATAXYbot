-- Enable UUID extension just in case
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Supabase SQL Schema & RLS for WebRTC VC Tab

CREATE TABLE IF NOT EXISTS public.active_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id_5_digit INTEGER UNIQUE DEFAULT floor(random() * 90000 + 10000)::int,
    room_name TEXT NOT NULL,
    host_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.room_seats (
    room_id UUID REFERENCES public.active_rooms(id) ON DELETE CASCADE,
    seat_index INTEGER CHECK (seat_index >= 0 AND seat_index <= 3),
    user_id TEXT,
    is_locked BOOLEAN DEFAULT false,
    is_muted_by_host BOOLEAN DEFAULT false,
    PRIMARY KEY (room_id, seat_index)
);

CREATE TABLE IF NOT EXISTS public.room_audience (
    room_id UUID REFERENCES public.active_rooms(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (room_id, user_id)
);

-- Prevent duplicate seating per user in the same room
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_per_room_seat 
ON public.room_seats (room_id, user_id) 
WHERE user_id IS NOT NULL;

-- Capacity Constraint Function & Trigger (Limit exactly to 12 participants max like WePlay)
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

-- Atomic Seat Movement RPC (One single transaction for zero desync)
CREATE OR REPLACE FUNCTION public.move_to_seat(p_room_id UUID, p_seat_index INT, p_user_id TEXT, p_user_name TEXT DEFAULT NULL, p_photo_url TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    v_target_locked BOOLEAN;
    v_target_occupant TEXT;
BEGIN
    -- 1. Check if the target seat is locked or occupied
    SELECT is_locked, user_id INTO v_target_locked, v_target_occupant
    FROM public.room_seats 
    WHERE room_id = p_room_id AND seat_index = p_seat_index;

    IF v_target_locked THEN
        RAISE EXCEPTION 'Seat is locked by the host';
    END IF;

    IF v_target_occupant IS NOT NULL AND v_target_occupant != p_user_id THEN
        RAISE EXCEPTION 'Seat is already occupied';
    END IF;

    -- 2. Clear user from ANY other seat they currently occupy in this room
    UPDATE public.room_seats SET user_id = NULL WHERE room_id = p_room_id AND user_id = p_user_id AND seat_index != p_seat_index;
    -- 3. Update the target seat with the user
    UPDATE public.room_seats SET user_id = p_user_id, user_name = p_user_name, photo_url = p_photo_url WHERE room_id = p_room_id AND seat_index = p_seat_index;
    -- 4. Remove the user from the room_audience table
    DELETE FROM public.room_audience WHERE room_id = p_room_id AND user_id = p_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply Public RLS (Allows all clients to read/insert freely for this VC mesh component)
ALTER TABLE public.active_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_audience ENABLE ROW LEVEL SECURITY;

-- Grant API access to the tables
GRANT ALL ON TABLE public.active_rooms TO anon, authenticated;
GRANT ALL ON TABLE public.room_seats TO anon, authenticated;
GRANT ALL ON TABLE public.room_audience TO anon, authenticated;

-- Create bulletproof policies allowing the app to do everything (Insert/Select/Update/Delete)
DROP POLICY IF EXISTS "Enable all actions for public" ON public.active_rooms;
CREATE POLICY "Enable all actions for public" ON public.active_rooms FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all actions for public" ON public.room_seats;
CREATE POLICY "Enable all actions for public" ON public.room_seats FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all actions for public" ON public.room_audience;
CREATE POLICY "Enable all actions for public" ON public.room_audience FOR ALL USING (true) WITH CHECK (true);

-- Add new columns for Telegram names and profile photos safely
ALTER TABLE public.active_rooms ADD COLUMN IF NOT EXISTS host_name TEXT DEFAULT 'Host';
ALTER TABLE public.active_rooms ADD COLUMN IF NOT EXISTS host_photo TEXT;

ALTER TABLE public.room_seats ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE public.room_seats ADD COLUMN IF NOT EXISTS photo_url TEXT;

ALTER TABLE public.room_audience ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE public.room_audience ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- THIS IS THE CRITICAL LINE THAT FIXES YOUR CACHE ERROR:
NOTIFY pgrst, 'reload schema';