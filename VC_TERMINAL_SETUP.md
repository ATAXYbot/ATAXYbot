# Setting up the VC Tables via Terminal

To make the WebRTC VC tab operational, your Supabase project needs the `active_rooms`, `room_seats`, and `room_audience` tables.

### Option 1: Using the Supabase CLI (Terminal)
If you have Node.js installed, open your terminal at `c:\Users\risha\Desktop\ATAXYbot\ATAXYbot\` and run:

```bash
# 1. Install the Supabase CLI globally
npm install -g supabase

# 2. Login to your Supabase account
supabase login

# 3. Link this folder to your specific Supabase project
supabase link --project-ref kwzpnupjtvfrevpwfaao

# 4. Push the SQL script directly to your remote database
supabase db execute --file vc_setup_schema.sql
```

### Option 2: Using standard Postgres (Terminal)
If you have `psql` installed on your machine, you can run the SQL script against your database directly:
```bash
psql "postgres://postgres.[YOUR-PROJECT-ID]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" -f vc_setup_schema.sql
```

*(Note: You can also just copy the entire contents of `vc_setup_schema.sql` and paste it into the **SQL Editor** on your Supabase web dashboard and click "Run" - this is usually the fastest method!)*