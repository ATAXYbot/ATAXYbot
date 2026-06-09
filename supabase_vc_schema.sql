-- Supabase SQL Schema & RLS for VC Tab

CREATE TABLE active_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id_5_digit INTEGER UNIQUE DEFAULT floor(random() * 90000 + 10000)::int,
    room_name TEXT NOT NULL,
    host_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE room_seats (
    room_id UUID REFERENCES active_rooms(id) ON DELETE CASCADE,
    seat_index INTEGER CHECK (seat_index >= 0 AND seat_index <= 3),
    user_id TEXT,
    is_locked BOOLEAN DEFAULT false,
    is_muted_by_host BOOLEAN DEFAULT false,
    PRIMARY KEY (room_id, seat_index)
);

CREATE TABLE room_audience (
    room_id UUID REFERENCES active_rooms(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (room_id, user_id)
);

-- Capacity Constraint Function & Trigger
CREATE OR REPLACE FUNCTION check_room_capacity()
RETURNS TRIGGER AS $$
DECLARE
    seat_count INT;
    audience_count INT;
BEGIN
    SELECT COUNT(user_id) INTO seat_count FROM room_seats WHERE room_id = NEW.room_id AND user_id IS NOT NULL;
    SELECT COUNT(*) INTO audience_count FROM room_audience WHERE room_id = NEW.room_id;
    
    IF (seat_count + audience_count) >= 12 THEN
        RAISE EXCEPTION 'Room is at full capacity (12 users max)';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_room_capacity
BEFORE INSERT ON room_audience
FOR EACH ROW EXECUTE FUNCTION check_room_capacity();

CREATE TRIGGER enforce_seat_capacity
BEFORE UPDATE ON room_seats
FOR EACH ROW 
WHEN (OLD.user_id IS NULL AND NEW.user_id IS NOT NULL)
EXECUTE FUNCTION check_room_capacity();

-- Apply basic RLS
ALTER TABLE active_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_audience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON active_rooms FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON active_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete access" ON active_rooms FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON room_seats FOR SELECT USING (true);
CREATE POLICY "Allow public update access" ON room_seats FOR UPDATE USING (true);
CREATE POLICY "Allow public insert access" ON room_seats FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON room_audience FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON room_audience FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete access" ON room_audience FOR DELETE USING (true);