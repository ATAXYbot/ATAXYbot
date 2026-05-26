# Supabase Setup Guide for NEET Questions

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub/Google
4. Create new project:
   - Project name: `neet-prep-app`
   - Database password: Save it safely
   - Region: Closest to you

## 2. Get API Keys

Go to Project Settings → API
- Copy `Project URL` → `VITE_SUPABASE_URL`
- Copy `anon public key` → `VITE_SUPABASE_ANON_KEY`
- Copy `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

## 3. Create Database Tables

Go to SQL Editor and run this:

```sql
-- Chapters Table
CREATE TABLE chapters (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  order_index INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Topics Table
CREATE TABLE topics (
  id BIGSERIAL PRIMARY KEY,
  chapter_id BIGINT REFERENCES chapters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions Table
CREATE TABLE questions (
  id BIGSERIAL PRIMARY KEY,
  topic_id BIGINT REFERENCES topics(id) ON DELETE CASCADE,
  chapter_id BIGINT REFERENCES chapters(id),
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'mcq',
  difficulty TEXT DEFAULT 'medium',
  options JSONB NOT NULL,
  correct_answer INT NOT NULL,
  explanation TEXT,
  solution_text TEXT,
  image_url TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Progress Table
CREATE TABLE user_progress (
  id BIGSERIAL PRIMARY KEY,
  telegram_user_id BIGINT NOT NULL,
  question_id BIGINT REFERENCES questions(id),
  is_correct BOOLEAN,
  attempts INT DEFAULT 0,
  time_spent INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Accounts Table
CREATE TABLE user_accounts (
  id BIGSERIAL PRIMARY KEY,
  telegram_user_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  profile_photo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS (Row Level Security)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- Public access for questions/chapters/topics
CREATE POLICY "Allow public read on chapters" 
  ON chapters FOR SELECT USING (true);

CREATE POLICY "Allow public read on topics" 
  ON topics FOR SELECT USING (true);

CREATE POLICY "Allow public read on questions" 
  ON questions FOR SELECT USING (true);

-- User progress - only own data
CREATE POLICY "Allow users to read own progress" 
  ON user_progress FOR SELECT 
  USING (telegram_user_id = CAST(CURRENT_SETTING('app.telegram_user_id', true) AS BIGINT));

CREATE POLICY "Allow users to insert own progress" 
  ON user_progress FOR INSERT 
  WITH CHECK (telegram_user_id = CAST(CURRENT_SETTING('app.telegram_user_id', true) AS BIGINT));

-- User accounts - own account
CREATE POLICY "Allow users to read own account" 
  ON user_accounts FOR SELECT 
  USING (telegram_user_id = CAST(CURRENT_SETTING('app.telegram_user_id', true) AS BIGINT));

CREATE POLICY "Allow users to update own account" 
  ON user_accounts FOR UPDATE 
  USING (telegram_user_id = CAST(CURRENT_SETTING('app.telegram_user_id', true) AS BIGINT));

CREATE POLICY "Allow users to insert own account" 
  ON user_accounts FOR INSERT 
  WITH CHECK (telegram_user_id = CAST(CURRENT_SETTING('app.telegram_user_id', true) AS BIGINT));
```

## 4. Insert Sample Data (Optional)

Go to SQL Editor:

```sql
-- Insert sample chapters
INSERT INTO chapters (name, subject, description, order_index) VALUES
('Organic Chemistry', 'Chemistry', 'Fundamentals of organic compounds', 1),
('Inorganic Chemistry', 'Chemistry', 'Non-organic compounds and reactions', 2),
('Cell Biology', 'Biology', 'Structure and function of cells', 1),
('Genetics', 'Biology', 'Heredity and gene expression', 2),
('Mechanics', 'Physics', 'Motion and forces', 1),
('Thermodynamics', 'Physics', 'Heat and energy', 2);

-- Insert sample topics
INSERT INTO topics (chapter_id, name, order_index) VALUES
(1, 'Alkanes', 1),
(1, 'Alkenes', 2),
(1, 'Alkynes', 3),
(3, 'Cell Membrane', 1),
(3, 'Cell Nucleus', 2),
(5, 'Newton\'s Laws', 1),
(5, 'Kinematics', 2);

-- Insert sample questions
INSERT INTO questions (
  topic_id, chapter_id, question_text, options, 
  correct_answer, explanation, difficulty
) VALUES
(1, 1, 
  'What is the molecular formula of methane?', 
  '["CH4", "C2H6", "C3H8", "C4H10"]'::jsonb, 
  0, 
  'Methane is the simplest hydrocarbon with one carbon and four hydrogen atoms.',
  'easy'
),
(1, 1,
  'Which alkane has the general formula CnH2n?',
  '["Alkanes", "Alkenes", "Alkynes", "Alcohols"]'::jsonb,
  1,
  'Alkenes have one C=C double bond and follow CnH2n formula.',
  'medium'
),
(4, 3,
  'The cell membrane is primarily composed of:',
  '["Proteins only", "Lipids only", "Phospholipids and proteins", "Carbohydrates only"]'::jsonb,
  2,
  'The fluid mosaic model describes the cell membrane as a bilayer of phospholipids with embedded proteins.',
  'easy'
);
```

## 5. Update .env Files

Create `.env.local` in frontend directory:
```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

Create `.env` in backend directory:
```
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3001
```

Done! Your Supabase is ready to use.
