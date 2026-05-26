# NEET Questions App - GitHub & Render Deployment Guide

## Overview
- **Frontend**: GitHub Pages (free static hosting)
- **Backend**: Render.com (free tier with auto-deploy)
- **Database**: Supabase (free tier)

---

## **PART 1: Prepare Your GitHub Repository**

### 1. Create/Update Repository Structure
```
your-repo/
├── docs/                    # GitHub Pages folder
│   ├── index.html          # Your Telegram mini app
│   ├── css/
│   ├── js/
│   └── frontend/
│       ├── components/
│       └── utils/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── routes/
│   ├── .env.example
│   └── Procfile             # For Render deployment
├── .env.example
└── README.md
```

### 2. Create Procfile for Render
**File: `backend/Procfile`**
```
web: npm start
```

### 3. Update backend/package.json
Make sure you have:
```json
{
  "name": "neet-prep-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "engines": {
    "node": "18.x"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "@supabase/supabase-js": "^2.38.0"
  }
}
```

### 4. Push to GitHub
```bash
git add .
git commit -m "Add NEET questions app with Supabase"
git push origin main
```

---

## **PART 2: Deploy Backend to Render.com**

### 1. Sign Up
- Go to [render.com](https://render.com)
- Click "Sign up"
- Sign in with GitHub (recommended)

### 2. Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Select your GitHub repository
3. Give it a name: `neet-prep-backend`
4. Environment:
   - Runtime: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`

### 3. Add Environment Variables
Click **"Environment"** and add:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | Your Supabase URL |
| `SUPABASE_ANON_KEY` | Your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key |
| `PORT` | `3001` |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `https://yourusername.github.io,https://your-domain.com` |

### 4. Deploy
Click **"Create Web Service"**
- Wait 5-10 minutes for deployment
- Get your URL: `https://neet-prep-backend.onrender.com`

### 5. Update CORS_ORIGIN
After deployment, update `CORS_ORIGIN` to include your actual frontend URL

---

## **PART 3: Deploy Frontend to GitHub Pages**

### 1. Enable GitHub Pages
1. Go to your repo → **Settings**
2. Go to **Pages**
3. Source: `Deploy from a branch`
4. Branch: `main`
5. Folder: `docs` (or `/` if files are in root)
6. Save

Your site will be at: `https://yourusername.github.io/your-repo-name`

### 2. Update Frontend Configuration
In your frontend code, update the backend URL:

**In your HTML/JS:**
```javascript
const API_URL = 'https://neet-prep-backend.onrender.com';
const TELEGRAM_BOT_LINK = 'https://t.me/your_bot_username/your-app-name';
```

### 3. Commit and Push
```bash
git add .
git commit -m "Update API URLs for production"
git push origin main
```

GitHub Pages will automatically deploy!

---

## **PART 4: Create Telegram Mini App**

### 1. Create Telegram Bot
1. Open Telegram, find `@BotFather`
2. Send `/newbot`
3. Follow prompts:
   - Name: `NEET Prep Bot`
   - Username: `neet_prep_bot` (must be unique)
4. Copy your **Bot Token**

### 2. Create Mini App
1. Send `/newapp` to `@BotFather`
2. Select your bot
3. Fill in:
   - Short name: `neetprep`
   - Title: `NEET Prep`
   - Web App URL: `https://yourusername.github.io/your-repo-name`
   - Description: "Practice NEET questions"

### 3. Make Bot Private (Optional)
Send `/mybotfather` → Edit Bot → Toggle to Private

### 4. Get Mini App Link
Your mini app link: `https://t.me/your_bot_username/neetprep`

---

## **PART 5: Update Environment Variables**

### Frontend (.env.local or hardcoded)
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BACKEND_URL=https://neet-prep-backend.onrender.com
```

### In Your HTML
```html
<script>
  window.API_CONFIG = {
    backendUrl: 'https://neet-prep-backend.onrender.com',
    supabaseUrl: 'your-url',
    supabaseKey: 'your-key'
  };
</script>
```

---

## **PART 6: Test Everything**

### Test Backend
```bash
curl https://neet-prep-backend.onrender.com/health
# Should return: {"status":"ok"}

curl https://neet-prep-backend.onrender.com/api/neet/chapters
# Should return JSON list of chapters
```

### Test Frontend
1. Open `https://yourusername.github.io/your-repo-name` in browser
2. You should see your Telegram mini app

### Test in Telegram
1. Open Telegram
2. Go to `https://t.me/your_bot_username/neetprep`
3. Click "Open App"
4. Your mini app should load

---

## **Deploy Updates**

### For Backend Changes
```bash
git add backend/
git commit -m "Update backend logic"
git push origin main
# Render.com will auto-deploy in 2-5 minutes
```

### For Frontend Changes
```bash
git add docs/
git commit -m "Update frontend UI"
git push origin main
# GitHub Pages will update immediately
```

---

## **Troubleshooting**

### Render deployment fails
- Check **Logs** in Render dashboard
- Make sure `Procfile` exists in `backend/` folder
- Verify `package.json` has correct start command

### GitHub Pages shows 404
- Check **Settings** → **Pages** → Source is correct
- Make sure files are in the `docs/` folder
- Wait 1-2 minutes after push

### Frontend can't reach backend
- Check backend URL in frontend code
- Make sure `CORS_ORIGIN` includes frontend URL in Render env vars
- Test with `curl` command above

### Questions not showing
- Check Supabase data exists
- Look at browser console for errors
- Test API endpoint directly with curl

---

## **Free Tier Limits**

**Render.com**: Auto-spins down after 15 min inactivity (5-10 sec cold start)  
**GitHub Pages**: Unlimited  
**Supabase**: 1GB storage, rate limits (plenty for starting)

To avoid slow startups on Render, add a ping every 14 minutes.

---

## **Production Checklist**

- [ ] Supabase project created
- [ ] GitHub repo set up with correct structure
- [ ] Backend deployed to Render
- [ ] Frontend deployed to GitHub Pages
- [ ] Environment variables configured
- [ ] Bot created on Telegram
- [ ] Mini app linked in BotFather
- [ ] Sample data added to Supabase
- [ ] CORS working (test from frontend)
- [ ] Questions appearing in app

**You're ready!** 🚀
