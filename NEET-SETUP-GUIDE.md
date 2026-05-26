# NEET Questions App - Complete Setup Guide

## 🚀 Quick Start

This guide will help you set up the NEET question preparation app with Supabase backend.

---

## **STEP 1: Supabase Setup**

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub/Google
3. Click "New Project"
   - Name: `neet-prep-app`
   - Password: Save it safely
   - Region: Closest to you
4. Click "Create new project" (wait 2-3 minutes)

### Get API Keys
1. Go to **Project Settings** → **API**
2. Copy these and save them:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` → `VITE_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### Create Database Tables
1. In Supabase, go to **SQL Editor**
2. Click "New Query"
3. Copy the SQL from `SUPABASE-SETUP.md` (the big SQL block)
4. Click "Run"
5. Wait for completion (should see checkmark)

### Add Sample Data (Optional)
1. Go to **SQL Editor** → **New Query**
2. Copy the INSERT statements from `SUPABASE-SETUP.md`
3. Click "Run"

---

## **STEP 2: Environment Variables**

### Frontend (.env.local)
Create file: `ATAXYbot/.env.local`
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BACKEND_URL=http://localhost:3001
```

### Backend (.env)
Create file: `ATAXYbot/backend/.env`
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:3001
```

---

## **STEP 3: Install Dependencies**

### Backend
```bash
cd backend
npm install
```

### Frontend (if using separate build)
```bash
npm install @supabase/supabase-js
npm install vite
```

---

## **STEP 4: Run the App**

### Terminal 1: Start Backend
```bash
cd backend
npm start
# or
npm run dev
```
You should see: `Backend listening on port 3001`

### Terminal 2: Start Frontend (if applicable)
```bash
npm run dev
```

### Test the API
Open in browser: `http://localhost:3001/api/neet/chapters`
Should return list of chapters.

---

## **STEP 5: Integrate into Your App**

### Option A: Use Provided React Components
If you're using React in your `index.html`:

```jsx
import { NEETChapters, NEETQuestionViewer } from './frontend/components/NEETComponents.jsx';
import { preventContentCopy } from './frontend/utils/supabaseClient.js';

// In your app:
<NEETChapters onSelectTopic={(topicId, name, chapter) => {
  // Handle topic selection
}} />
```

### Option B: Add to Your Existing Code
```javascript
// In your React app
import { neetApi } from './frontend/utils/supabaseClient.js';

// Load chapters
const chapters = await neetApi.getChapters();

// Load questions
const data = await neetApi.getQuestions(topicId, 10, 0);

// Submit answer
const result = await neetApi.submitAnswer(questionId, userAnswerIndex);

// Get user stats
const stats = await neetApi.getUserStats();
```

---

## **STEP 6: GitHub Deployment**

### Push to GitHub
```bash
git add .
git commit -m "Add NEET questions integration"
git push origin main
```

### Deploy Backend to Render.com (Free)
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New+" → "Web Service"
4. Select your GitHub repository
5. Configure:
   - Name: `neet-prep-backend`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Environment Variables: (add from your .env)
6. Click "Create Web Service"
7. Get your URL from the deployment → Use in `VITE_BACKEND_URL`

### Deploy Frontend to GitHub Pages
1. In your repo, go to **Settings** → **Pages**
2. Source: `Deploy from a branch`
3. Branch: `main` → `docs` (or `/`)
4. Your app will be at: `https://username.github.io/repo-name`

---

## **STEP 7: Content Protection**

The app includes built-in protections:

```javascript
// Automatically enabled
- Copy-paste disabled
- Right-click disabled
- Question bulk download limited (max 20 per request)
- User tracking via Telegram ID
```

Add to your components:
```javascript
import { preventContentCopy } from './frontend/utils/supabaseClient.js';

// Call once on app load
preventContentCopy();
```

---

## **API Endpoints**

### Public Endpoints
```
GET  /api/neet/chapters
GET  /api/neet/chapters/:id/topics
GET  /api/neet/topics/:id/questions?limit=10&offset=0
```

### Authenticated Endpoints (need x-telegram-user-id header)
```
GET  /api/neet/questions/:id
POST /api/neet/questions/:id/submit
GET  /api/neet/user/stats
POST /api/neet/user/register
```

---

## **Adding Your Own Questions**

### Using Supabase Console
1. Go to Supabase → **Table Editor**
2. Select `questions` table
3. Click "Insert Row"
4. Fill in:
   - topic_id
   - question_text
   - options (JSON array: ["A", "B", "C", "D"])
   - correct_answer (0-3)
   - explanation

### Using SQL
```sql
INSERT INTO questions (
  topic_id, chapter_id, question_text, options, correct_answer, explanation, difficulty
) VALUES
(1, 1, 'Question text?', '["Option A", "Option B", "Option C", "Option D"]'::jsonb, 0, 'Explanation here', 'medium');
```

---

## **Troubleshooting**

### "Cannot find module @supabase/supabase-js"
```bash
cd backend
npm install @supabase/supabase-js
```

### "CORS error" when fetching from frontend
Make sure `CORS_ORIGIN` in backend `.env` includes your frontend URL

### "Supabase connection failed"
- Check `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Make sure Supabase project is running
- Check internet connection

### Questions not showing
- Verify data was inserted in Supabase
- Check browser console for errors
- Test API endpoint directly: `http://localhost:3001/api/neet/chapters`

---

## **Next Steps**

1. ✅ Set up Supabase
2. ✅ Install dependencies
3. ✅ Run backend & frontend
4. ✅ Add your questions
5. Deploy to GitHub Pages + Render
6. Share Telegram bot link
7. Monitor user progress in Supabase

**Done!** Your NEET prep app is ready! 🎉
