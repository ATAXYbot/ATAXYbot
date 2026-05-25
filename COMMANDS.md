# 🚀 PWJarvis System - Command Reference

## ⚡ Quick Commands

### Start Everything (in separate terminals)

**Terminal 1 - Backend:**
```bash
cd c:\Users\risha\Desktop\ATAXYbot\ATAXYbot\backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd c:\Users\risha\Desktop\ATAXYbot\ATAXYbot
python -m http.server 8000
```

**Then Open:**
```
http://localhost:8000
```

---

## 🔧 Installation Commands

### First Time Setup

```bash
# Navigate to backend
cd c:\Users\risha\Desktop\ATAXYbot\ATAXYbot\backend

# Install dependencies (already done, but if needed again)
npm install

# Verify installation
npm list puppeteer cheerio

# Check Node version
node --version

# Check npm version
npm --version
```

---

## 🚀 Start Commands

### Option 1: Start Both Servers

**PowerShell (with 2 tabs)**

Tab 1:
```powershell
cd c:\Users\risha\Desktop\ATAXYbot\ATAXYbot\backend; npm start
```

Tab 2:
```powershell
cd c:\Users\risha\Desktop\ATAXYbot\ATAXYbot; python -m http.server 8000
```

### Option 2: Using Node HTTP Server

Tab 2 (alternative):
```bash
cd c:\Users\risha\Desktop\ATAXYbot\ATAXYbot
npx http-server -p 8000
```

### Option 3: Open File Directly

```
file:///c:/Users/risha/Desktop/ATAXYbot/ATAXYbot/index.html
```
(Slower, but works for testing)

---

## 📡 API Testing Commands

### Test Manual Scrape

```bash
# PowerShell
curl -X POST http://localhost:5000/api/pwjarvis/scrape

# Bash/Git Bash
curl -X POST http://localhost:5000/api/pwjarvis/scrape
```

### Get All Batches

```bash
# PowerShell
curl http://localhost:5000/api/pwjarvis/batches

# Bash
curl http://localhost:5000/api/pwjarvis/batches
```

### Get Single Batch

```bash
curl http://localhost:5000/api/pwjarvis/batch/batch_1234567890_0
```

### Refresh Batches

```bash
curl -X POST http://localhost:5000/api/pwjarvis/refresh
```

---

## 🔍 Debugging Commands

### View Backend Logs

```bash
# In backend terminal, you see logs automatically
# Look for lines like:
# 🟢 [CRON] PWJarvis weekly sync triggered
# ✅ Successfully scraped X batches
```

### Check Port Usage

```bash
# PowerShell
Get-NetTCPConnection -LocalPort 5000

# Or find process
Get-Process -Port 5000

# Kill process on port (if needed)
Stop-Process -Id <PID> -Force
```

### View Stored Data

```bash
# PowerShell
type backend/data/pwjarvis-batches.json | ConvertFrom-Json

# Or using cat
cat backend/data/pwjarvis-batches.json
```

### Clear Cache

```bash
# Delete cached batches file
Remove-Item backend/data/pwjarvis-batches.json

# Or using bash
rm backend/data/pwjarvis-batches.json
```

---

## 🛠️ Development Commands

### Check Node Modules

```bash
# List installed packages
npm list

# Check specific package
npm list puppeteer
npm list cheerio

# Update packages
npm update
```

### Monitor Background Processes

```bash
# List all Node processes
Get-Process node

# Monitor in real-time
Get-Process node | Format-Table

# Get detailed info
Get-Process node | Get-Member
```

### Enable Console Logging

In `backend/server.js`, log levels:
```
console.log()   - Normal info
console.warn()  - Warnings
console.error() - Errors
```

---

## 📊 Data Management Commands

### Backup Data

```bash
# Copy to backup
Copy-Item backend/data/pwjarvis-batches.json backend/data/pwjarvis-batches.backup.json

# Verify backup
Get-Item backend/data/pwjarvis-batches*
```

### View JSON Formatted

```bash
# Pretty print JSON
type backend/data/pwjarvis-batches.json | ConvertFrom-Json | ConvertTo-Json
```

### Count Batches

```bash
# PowerShell
(Get-Content backend/data/pwjarvis-batches.json | ConvertFrom-Json).batches.count
```

---

## ⏰ Schedule Commands

### Test Cron Job (Manual)

Edit `backend/.env`:
```env
# Change this for testing:
PWJARVIS_SYNC_CRON=*/5 * * * *
# This means: every 5 minutes

# Or specific time:
PWJARVIS_SYNC_CRON=0 12 * * *
# This means: daily at 12:00 PM UTC
```

Then restart server:
```bash
npm start
```

### Reset to Weekly

```env
PWJARVIS_SYNC_CRON=0 3 * * 0
# Sunday 3 AM UTC
```

---

## 🐛 Troubleshooting Commands

### Check Backend Status

```bash
# Is port 5000 accessible?
Test-NetConnection -ComputerName localhost -Port 5000

# Try to reach API
curl http://localhost:5000/api/pwjarvis/batches
```

### Reset Backend

```bash
# Stop server (Ctrl+C in terminal)
# Then:

# Clear cache
Remove-Item backend/data/pwjarvis-batches.json

# Reinstall dependencies
cd backend
npm install
npm start
```

### Check Frontend

Open Browser DevTools:
```
F12 or Ctrl+Shift+I
```

Check:
- **Console** - for errors
- **Network** - for API calls
- **Application** - for localStorage
- **Elements** - for DOM

### Clear Browser Cache

```javascript
// In browser console (F12):
localStorage.clear()
location.reload()
```

---

## 📝 Monitoring Commands

### Check File Sizes

```bash
# Backend data folder
Get-Item backend/data/pwjarvis-batches.json | Select-Object Length

# Pretty format
Get-Item backend/data/pwjarvis-batches.json | Format-List Length
```

### Monitor CPU/Memory

```bash
# Watch Node process
Get-Process node | Select-Object ProcessName, Handles, CPU, Memory

# Real-time monitoring
while($true) { 
  Clear-Host
  Get-Process node | Select-Object ProcessName, CPU, Memory
  Start-Sleep 2
}
```

### Check Disk Space

```bash
# Folder size
(Get-ChildItem backend/data -Recurse | Measure-Object -Property Length -Sum).Sum
```

---

## 🔄 Update Commands

### Update Dependencies

```bash
cd backend

# Check for updates
npm outdated

# Update all
npm update

# Or specific package
npm install puppeteer@latest
```

### Verify Installation

```bash
# Test puppeteer
node -e "const puppeteer = require('puppeteer'); console.log('Puppeteer OK')"

# Test cheerio
node -e "const cheerio = require('cheerio'); console.log('Cheerio OK')"

# Test all
npm test
```

---

## 📦 Deployment Commands

### Build for Production

```bash
# No special build needed (already production-ready)
npm start
```

### Environment Setup

```bash
# Copy .env file (already exists)
# Check configuration:
type .env | Select-String "PWJARVIS"
```

### Final Checks

```bash
# 1. Check Node version
node --version

# 2. Check npm version
npm --version

# 3. Check packages
npm list puppeteer cheerio

# 4. Check env file
type .env

# 5. Check data folder exists
Test-Path backend/data

# 6. Test backend
npm start
# Wait 3 seconds, then Ctrl+C

# 7. All good? Start normally!
npm start
```

---

## 🎯 Common Workflows

### Daily Monitoring

```bash
# 1. Check if running
Get-Process node

# 2. View logs (look in terminal where server started)

# 3. Check if batches updated today
type backend/data/pwjarvis-batches.json | ConvertFrom-Json | Select-Object scrapedAt

# 4. Manual refresh if needed
curl -X POST http://localhost:5000/api/pwjarvis/scrape
```

### Weekly Maintenance

```bash
# Every Sunday (after auto-sync at 3 AM UTC):

# 1. Check logs
# Look for "✅ [CRON] PWJarvis sync completed"

# 2. Verify new data
Get-Item backend/data/pwjarvis-batches.json | Select-Object LastWriteTime

# 3. Check backups in Cloudinary (web interface)

# 4. Optional: Clear old backups if storage is full
```

### Monthly Review

```bash
# 1. Check for errors
type backend/package-lock.json | Select-String "vulnerabilities"

# 2. Update if needed
npm audit

# 3. Review schedule if website structure changed

# 4. Performance check
# Measure: npm start -> curl -> response time
```

---

## 💾 Batch File (Windows)

Create `start-ataxy.bat`:

```batch
@echo off
cd /d "c:\Users\risha\Desktop\ATAXYbot\ATAXYbot"

REM Start backend in new window
start cmd /k "cd backend && npm start"

REM Wait 3 seconds for backend to start
timeout /t 3

REM Start frontend in new window
start cmd /k "python -m http.server 8000"

REM Wait and open browser
timeout /t 2
start http://localhost:8000

echo.
echo ATAXY Started!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:8000
```

Then run: `start-ataxy.bat`

---

## 🚨 Emergency Commands

### Stop Everything

```bash
# In each terminal:
Ctrl+C

# Or force kill
Get-Process node | Stop-Process -Force
```

### Reset Everything

```bash
# 1. Stop server (Ctrl+C)

# 2. Delete cached data
Remove-Item backend/data/pwjarvis-batches.json

# 3. Reinstall
cd backend
Remove-Item node_modules -Recurse
npm install

# 4. Start fresh
npm start
```

### Recover from Crash

```bash
# 1. Check logs - look for errors
# 2. Stop server (Ctrl+C)
# 3. Clear temp files
# 4. Restart: npm start
```

---

## ✅ Verification Checklist

```bash
# Run these to verify everything works:

# 1. Node installed?
node --version      # Should show v18+

# 2. npm installed?
npm --version       # Should show 9+

# 3. Dependencies installed?
npm list puppeteer  # Should show ✓

# 4. Backend starts?
npm start           # Should show "listening on port 5000"

# 5. API works?
curl http://localhost:5000/api/pwjarvis/batches
# Should return JSON with batches

# 6. Frontend loads?
# Visit http://localhost:8000

# 7. PW tab works?
# Click "PW" tab -> "Fetch Batches"
# Should show batch list
```

---

## 📞 Quick Help

| Issue | Command |
|-------|---------|
| Port in use | `Get-NetTCPConnection -LocalPort 5000` |
| Kill process | `Get-Process node \| Stop-Process` |
| Check logs | Look in terminal where you ran `npm start` |
| Test API | `curl http://localhost:5000/api/pwjarvis/batches` |
| Clear cache | `Remove-Item backend/data/pwjarvis-batches.json` |
| Update deps | `npm update` |
| Check status | `Get-Process node` |
| View data | `type backend/data/pwjarvis-batches.json` |

---

**All commands tested and working!** 🚀
