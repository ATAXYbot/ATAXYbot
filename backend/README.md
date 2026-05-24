# ATAXY Backend (NEETPrep bridge)

This backend is designed to support NEETPrep OTP login, weekly course extraction, and Cloudinary backup for the ATAXY app.

## Features
- `POST /api/neetprep/request-otp` — request NEETPrep OTP for a verified user
- `POST /api/neetprep/verify-otp` — verify the OTP and establish a connection
- `GET /api/neetprep/data` — return extracted course and batch data for the connected user
- `POST /api/neetprep/disconnect` — disconnect a NEETPrep user
- Weekly sync via cron to refresh extracted course data
- Cloudinary backup of extracted course payloads

## Environment
Copy `backend/.env.example` to `backend/.env` and fill in your values.

Important variables:
- `NEETPREP_USE_OFFICIAL=true` to use official NEETPrep endpoint configuration
- `NEETPREP_OTP_URL` — official OTP request endpoint
- `NEETPREP_VERIFY_URL` — official OTP verification endpoint
- `NEETPREP_COURSE_DATA_URL` — endpoint used to fetch course/batch data after login
- `NEETPREP_OTP_BODY_TEMPLATE` — JSON body template for the OTP request
- `NEETPREP_VERIFY_BODY_TEMPLATE` — JSON body template for OTP verification
- `NEETPREP_COURSE_DATA_AUTH_HEADER` — authorization header for course data fetch
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Cloudinary backup credentials
- `CLOUDINARY_UPLOAD_FOLDER` — Cloudinary folder prefix for backups
- `SYNC_CRON` — cron schedule for weekly sync

## Notes
- This backend is responsible for the secure server-side integration with NEETPrep.
- It does not expose NEETPrep credentials to the browser.
- The official flow is configurable via environment variables so you can adapt to NEETPrep's real API or web endpoints.

## Run locally
```bash
cd backend
npm install
npm start
```

## Deploy to Heroku
1. Create a Heroku app: `heroku create YOUR_APP_NAME`
2. Push this folder: `git subtree push --prefix backend heroku main`
3. Make sure your `backend/.env` values are set on Heroku config vars.
4. Confirm the app starts and the API is reachable.
