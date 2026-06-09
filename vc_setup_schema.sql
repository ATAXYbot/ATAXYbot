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

-- THIS IS THE CRITICAL LINE THAT FIXES YOUR CACHE ERROR:
NOTIFY pgrst, 'reload schema';