const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cron = require('node-cron');
require('dotenv').config();

const cloudinary = require('cloudinary').v2;
const fetchFn = typeof fetch !== 'undefined' ? fetch : require('node-fetch');
const { scrapePWJarvisBatches } = require('./scrapers/pwjarvis-scraper');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_ID,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const BATCHES_FILE = path.join(DATA_DIR, 'batches.json');
const PWJARVIS_FILE = path.join(DATA_DIR, 'pwjarvis-batches.json');

const NEETPREP_USE_OFFICIAL = process.env.NEETPREP_USE_OFFICIAL === 'true';
const NEETPREP_BASE_URL = process.env.NEETPREP_BASE_URL || 'https://www.neetprep.com';
const NEETPREP_OTP_URL = process.env.NEETPREP_OTP_URL;
const NEETPREP_VERIFY_URL = process.env.NEETPREP_VERIFY_URL;
const NEETPREP_COURSE_DATA_URL = process.env.NEETPREP_COURSE_DATA_URL;
const NEETPREP_OTP_METHOD = process.env.NEETPREP_OTP_METHOD || 'POST';
const NEETPREP_VERIFY_METHOD = process.env.NEETPREP_VERIFY_METHOD || 'POST';
const NEETPREP_COURSE_DATA_METHOD = process.env.NEETPREP_COURSE_DATA_METHOD || 'GET';
const NEETPREP_OTP_BODY_TEMPLATE = process.env.NEETPREP_OTP_BODY_TEMPLATE;
const NEETPREP_VERIFY_BODY_TEMPLATE = process.env.NEETPREP_VERIFY_BODY_TEMPLATE;
const NEETPREP_COURSE_DATA_BODY_TEMPLATE = process.env.NEETPREP_COURSE_DATA_BODY_TEMPLATE;
const NEETPREP_COURSE_DATA_AUTH_HEADER = process.env.NEETPREP_COURSE_DATA_AUTH_HEADER;
const CLOUDINARY_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || 'ataxy/neetprep';
const SYNC_CRON = process.env.SYNC_CRON || '0 2 * * 0';
const PWJARVIS_SYNC_CRON = process.env.PWJARVIS_SYNC_CRON || '0 3 * * 0'; // Weekly Sunday 3 AM UTC
const CLOUDINARY_ENABLED = !!(process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_ID) && !!process.env.CLOUDINARY_API_KEY && !!process.env.CLOUDINARY_API_SECRET;

const readJSON = (file, fallback) => {
  try { return JSON.parse(fs.readFileSync(file, 'utf8') || 'null') || fallback; } catch (e) { return fallback; }
};
const writeJSON = (file, obj) => fs.writeFileSync(file, JSON.stringify(obj, null, 2));

const app = express();
app.use(cors());
app.use(bodyParser.json());

if (!fs.existsSync(USERS_FILE)) writeJSON(USERS_FILE, {});
if (!fs.existsSync(BATCHES_FILE)) writeJSON(BATCHES_FILE, {});
if (!fs.existsSync(PWJARVIS_FILE)) writeJSON(PWJARVIS_FILE, { batches: [], scrapedAt: null, expiresAt: null });

const otpStore = {};

const fillTemplate = (template = '', vars = {}) => {
  return String(template).replace(/__([A-Z0-9_]+)__/g, (_, key) => String(vars[key] ?? ''));
};

const parseHeaderString = (headerString) => {
  if (!headerString) return null;
  const parts = headerString.split(':');
  if (parts.length < 2) return null;
  const key = parts.shift().trim();
  const value = parts.join(':').trim();
  return { key, value };
};

const normalizeData = (payload = {}) => {
  const batches = payload.batches || payload.courses || [];
  const videos = payload.videos || [];
  const questions = payload.questions || [];
  return { ...payload, batches, videos, questions };
};

const uploadBackupToCloudinary = async (identifier, payload) => {
  if (!CLOUDINARY_ENABLED) return null;
  try {
    const json = JSON.stringify(payload, null, 2);
    const dataUri = `data:application/json;base64,${Buffer.from(json).toString('base64')}`;
    const publicId = `${CLOUDINARY_FOLDER}/${identifier}/${Date.now()}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      resource_type: 'raw',
      public_id: publicId,
      overwrite: true,
    });
    return result.secure_url || result.url;
  } catch (error) {
    console.error('[CLOUDINARY] upload failed', error);
    return null;
  }
};

const saveBatches = async (identifier, payload) => {
  const batches = readJSON(BATCHES_FILE, {});
  const entry = {
    ...normalizeData(payload),
    fetchedAt: Date.now(),
    backupUrl: batches[identifier]?.backupUrl || null,
  };
  const backupUrl = await uploadBackupToCloudinary(identifier, entry);
  if (backupUrl) entry.backupUrl = backupUrl;
  batches[identifier] = entry;
  writeJSON(BATCHES_FILE, batches);
  return entry;
};

const buildOfficialHeaders = (identifier, token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (NEETPREP_COURSE_DATA_AUTH_HEADER) {
    const header = parseHeaderString(fillTemplate(NEETPREP_COURSE_DATA_AUTH_HEADER, { IDENTIFIER: identifier, TOKEN: token }));
    if (header) headers[header.key] = header.value;
  } else if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const performNeetprepExtraction = async (identifier, user = {}) => {
  if (NEETPREP_USE_OFFICIAL && NEETPREP_COURSE_DATA_URL) {
    const headers = buildOfficialHeaders(identifier, user.neetprepToken || user.token || '');
    const options = { method: NEETPREP_COURSE_DATA_METHOD, headers };
    if (NEETPREP_COURSE_DATA_METHOD !== 'GET' && NEETPREP_COURSE_DATA_BODY_TEMPLATE) {
      options.body = fillTemplate(NEETPREP_COURSE_DATA_BODY_TEMPLATE, { IDENTIFIER: identifier, TOKEN: user.neetprepToken || user.token || '' });
    }

    const response = await fetchFn(NEETPREP_COURSE_DATA_URL, options);
    if (!response.ok) {
      throw new Error(`NEETPrep course fetch failed: ${response.status}`);
    }
    const payload = await response.json();
    return saveBatches(identifier, payload);
  }

  return saveBatches(identifier, {
    batches: [
      {
        id: 'demo_b1',
        name: 'NEETPrep NEET 2026 Batch',
        subjects: [
          { 
            id: 'phy', 
            name: 'Physics', 
            chapters: [
              { id: 'phy1', name: 'Mechanics', videos: [101, 102], questions: [201, 202] },
              { id: 'phy2', name: 'Thermodynamics', videos: [103, 104], questions: [203, 204] }
            ] 
          },
          { 
            id: 'chem', 
            name: 'Chemistry', 
            chapters: [
              { id: 'chem1', name: 'Mole Concept', videos: [105, 106], questions: [205, 206] },
              { id: 'chem2', name: 'Ionic Equilibrium', videos: [107, 108], questions: [207, 208] }
            ] 
          },
          { 
            id: 'bio', 
            name: 'Biology', 
            chapters: [
              { id: 'bio1', name: 'Cell Biology', videos: [109, 110], questions: [209, 210] },
              { id: 'bio2', name: 'Genetics', videos: [111, 112], questions: [211, 212] }
            ] 
          }
        ],
      },
    ],
    videos: [
      { id: 101, title: 'Newton\'s Laws of Motion', duration: '1h 30m', subject: 'Physics' },
      { id: 102, title: 'Circular Motion', duration: '1h 15m', subject: 'Physics' },
      { id: 103, title: 'Heat and Temperature', duration: '1h 45m', subject: 'Physics' },
      { id: 104, title: 'Laws of Thermodynamics', duration: '2h', subject: 'Physics' },
      { id: 105, title: 'Mole Concept Fundamentals', duration: '1h 20m', subject: 'Chemistry' },
      { id: 106, title: 'Stoichiometry', duration: '1h 50m', subject: 'Chemistry' },
      { id: 107, title: 'Acid Base Equilibrium', duration: '2h 10m', subject: 'Chemistry' },
      { id: 108, title: 'Salt Hydrolysis', duration: '1h 40m', subject: 'Chemistry' },
      { id: 109, title: 'Cell Structure and Function', duration: '2h', subject: 'Biology' },
      { id: 110, title: 'Cell Division', duration: '1h 55m', subject: 'Biology' },
      { id: 111, title: 'Inheritance and Variation', duration: '2h 20m', subject: 'Biology' },
      { id: 112, title: 'Molecular Basis of Inheritance', duration: '2h 15m', subject: 'Biology' }
    ],
    questions: [
      { id: 201, text: 'What is the SI unit of force?', answer: 'Newton', subject: 'Physics' },
      { id: 202, text: 'Define uniform circular motion', answer: 'Motion in circle with constant speed', subject: 'Physics' },
      { id: 203, text: 'State the first law of thermodynamics', answer: 'ΔU = Q - W', subject: 'Physics' },
      { id: 204, text: 'Define entropy', answer: 'Measure of disorder in a system', subject: 'Physics' },
      { id: 205, text: 'What is Avogadro\'s number?', answer: '6.022 × 10^23', subject: 'Chemistry' },
      { id: 206, text: 'Define molar mass', answer: 'Mass of one mole of substance', subject: 'Chemistry' },
      { id: 207, text: 'What is pH?', answer: '-log[H+]', subject: 'Chemistry' },
      { id: 208, text: 'Define buffer solution', answer: 'Solution that resists pH change', subject: 'Chemistry' },
      { id: 209, text: 'Name the components of cell membrane', answer: 'Phospholipids and proteins', subject: 'Biology' },
      { id: 210, text: 'What is mitosis?', answer: 'Division producing identical daughter cells', subject: 'Biology' },
      { id: 211, text: 'What is Mendelian inheritance?', answer: 'Inheritance following Mendel\'s laws', subject: 'Biology' },
      { id: 212, text: 'Name the genetic material', answer: 'DNA', subject: 'Biology' }
    ],
  });
};

const requestOfficialOtp = async (identifier) => {
  if (!NEETPREP_OTP_URL) throw new Error('NEETPREP_OTP_URL is not configured');
  const headers = { 'Content-Type': 'application/json' };
  const options = { method: NEETPREP_OTP_METHOD, headers };
  if (NEETPREP_OTP_METHOD !== 'GET') {
    const template = NEETPREP_OTP_BODY_TEMPLATE || '{"identifier":"__IDENTIFIER__"}';
    options.body = fillTemplate(template, { IDENTIFIER: identifier });
  }
  const response = await fetchFn(NEETPREP_OTP_URL, options);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'NEETPrep OTP request failed');
  return payload;
};

const verifyOfficialOtp = async (identifier, otp) => {
  if (!NEETPREP_VERIFY_URL) throw new Error('NEETPREP_VERIFY_URL is not configured');
  const headers = { 'Content-Type': 'application/json' };
  const options = { method: NEETPREP_VERIFY_METHOD, headers };
  if (NEETPREP_VERIFY_METHOD !== 'GET') {
    const template = NEETPREP_VERIFY_BODY_TEMPLATE || '{"identifier":"__IDENTIFIER__","otp":"__OTP__"}';
    options.body = fillTemplate(template, { IDENTIFIER: identifier, OTP: otp });
  }
  const response = await fetchFn(NEETPREP_VERIFY_URL, options);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'NEETPrep OTP verification failed');
  return payload;
};

app.post('/api/neetprep/request-otp', async (req, res) => {
  const { identifier } = req.body;
  if (!identifier) return res.status(400).json({ error: 'identifier required' });

  if (NEETPREP_USE_OFFICIAL) {
    try {
      const payload = await requestOfficialOtp(identifier);
      return res.json({ ok: true, message: 'OTP request sent to official NEETPrep account.', payload });
    } catch (error) {
      return res.status(500).json({ error: error.message || 'NEETPrep OTP request failed' });
    }
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  otpStore[identifier] = { code, createdAt: Date.now() };
  console.log(`[DEMO] OTP for ${identifier}: ${code}`);
  return res.json({ ok: true, message: 'OTP sent (demo). Check server logs in demo mode.' });
});

app.post('/api/neetprep/verify-otp', async (req, res) => {
  const { identifier, otp } = req.body;
  if (!identifier || !otp) return res.status(400).json({ error: 'identifier and otp required' });

  let neetprepMeta = {};
  if (NEETPREP_USE_OFFICIAL) {
    try {
      neetprepMeta = await verifyOfficialOtp(identifier, otp);
    } catch (error) {
      return res.status(500).json({ error: error.message || 'NEETPrep OTP verification failed' });
    }
  } else {
    const record = otpStore[identifier];
    if (!record) return res.status(400).json({ error: 'no otp requested' });
    if (String(record.code) !== String(otp)) return res.status(401).json({ error: 'invalid otp' });
    delete otpStore[identifier];
  }

  const token = `neetprep-token-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  const users = readJSON(USERS_FILE, {});
  users[identifier] = {
    identifier,
    token,
    connectedAt: Date.now(),
    official: NEETPREP_USE_OFFICIAL,
    neetprepMeta,
  };
  writeJSON(USERS_FILE, users);

  try {
    const data = await performNeetprepExtraction(identifier, users[identifier]);
    return res.json({ ok: true, token, user: { identifier }, data });
  } catch (error) {
    const batches = readJSON(BATCHES_FILE, {});
    return res.status(500).json({ error: error.message || 'Failed to fetch NEETPrep data', data: batches[identifier] || null });
  }
});

app.get('/api/neetprep/data', (req, res) => {
  let identifier = req.query.identifier;
  const authHeader = req.headers.authorization || '';
  if (!identifier && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    const users = readJSON(USERS_FILE, {});
    identifier = Object.values(users).find((u) => u.token === token)?.identifier;
  }
  if (!identifier) return res.status(400).json({ error: 'identifier required' });
  const users = readJSON(USERS_FILE, {});
  if (!users[identifier]) return res.status(404).json({ error: 'user not connected' });
  const batches = readJSON(BATCHES_FILE, {});
  return res.json({ ok: true, data: batches[identifier] || { fetchedAt: null, batches: [] } });
});

app.post('/api/neetprep/disconnect', (req, res) => {
  const { identifier } = req.body;
  if (!identifier) return res.status(400).json({ error: 'identifier required' });
  const users = readJSON(USERS_FILE, {});
  delete users[identifier];
  writeJSON(USERS_FILE, users);
  const batches = readJSON(BATCHES_FILE, {});
  delete batches[identifier];
  writeJSON(BATCHES_FILE, batches);
  return res.json({ ok: true });
});

// ===============================================
// 🟢 PWJarvis Batch Scraping Endpoints
// ===============================================

app.post('/api/pwjarvis/scrape', async (req, res) => {
  try {
    console.log('📡 Starting PWJarvis batch scrape...');
    const result = await scrapePWJarvisBatches();
    
    if (result.success) {
      // Save to local storage
      writeJSON(PWJARVIS_FILE, result);
      
      // Backup to Cloudinary if enabled
      if (CLOUDINARY_ENABLED) {
        try {
          const json = JSON.stringify(result, null, 2);
          const dataUri = `data:application/json;base64,${Buffer.from(json).toString('base64')}`;
          const publicId = `${CLOUDINARY_FOLDER}/pwjarvis/${Date.now()}`;
          const cloudResult = await cloudinary.uploader.upload(dataUri, {
            resource_type: 'raw',
            public_id: publicId,
            overwrite: true,
          });
          result.backupUrl = cloudResult.secure_url || cloudResult.url;
          console.log('✅ Backup uploaded to Cloudinary:', result.backupUrl);
        } catch (error) {
          console.warn('⚠️ Cloudinary backup failed:', error.message);
        }
      }
      
      return res.json({ ok: true, message: `Successfully scraped ${result.count} batches`, data: result });
    } else {
      return res.status(500).json({ ok: false, error: result.error, data: result });
    }
  } catch (error) {
    console.error('❌ Scrape endpoint error:', error.message);
    return res.status(500).json({ ok: false, error: error.message });
  }
});

app.get('/api/pwjarvis/batches', (req, res) => {
  try {
    const data = readJSON(PWJARVIS_FILE, { batches: [], scrapedAt: null, expiresAt: null });
    
    // Check if data has expired (older than 7 days)
    if (data.scrapedAt) {
      const scrapedDate = new Date(data.scrapedAt);
      const expiryDate = new Date(scrapedDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      data.isExpired = new Date() > expiryDate;
      data.expiresAt = expiryDate.toISOString();
    }
    
    return res.json({ 
      ok: true, 
      count: data.batches?.length || 0,
      data 
    });
  } catch (error) {
    console.error('❌ Get batches error:', error.message);
    return res.status(500).json({ ok: false, error: error.message });
  }
});

app.get('/api/pwjarvis/batch/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = readJSON(PWJARVIS_FILE, { batches: [] });
    const batch = data.batches?.find(b => b.id === id);
    
    if (!batch) {
      return res.status(404).json({ ok: false, error: 'Batch not found' });
    }
    
    return res.json({ ok: true, data: batch });
  } catch (error) {
    console.error('❌ Get batch error:', error.message);
    return res.status(500).json({ ok: false, error: error.message });
  }
});

app.post('/api/pwjarvis/refresh', async (req, res) => {
  try {
    const data = readJSON(PWJARVIS_FILE, { batches: [] });
    
    // Check if data needs refresh (older than 7 days or empty)
    if (!data.batches || data.batches.length === 0) {
      return res.status(400).json({ 
        ok: false, 
        message: 'Run /api/pwjarvis/scrape first to fetch batches' 
      });
    }
    
    const scrapedDate = new Date(data.scrapedAt);
    const expiryDate = new Date(scrapedDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    if (new Date() <= expiryDate) {
      return res.status(400).json({ 
        ok: false, 
        message: 'Data is still fresh. Next refresh available in 7 days.',
        expiresAt: expiryDate.toISOString()
      });
    }
    
    // Data has expired, scrape again
    const result = await scrapePWJarvisBatches();
    if (result.success) {
      writeJSON(PWJARVIS_FILE, result);
      return res.json({ ok: true, message: 'Batches refreshed successfully', data: result });
    } else {
      return res.status(500).json({ ok: false, error: result.error });
    }
  } catch (error) {
    console.error('❌ Refresh error:', error.message);
    return res.status(500).json({ ok: false, error: error.message });
  }
});

const performSync = async () => {
  console.log('[SYNC] performing weekly NEETPrep sync for connected users');
  const users = readJSON(USERS_FILE, {});
  for (const identifier of Object.keys(users)) {
    try {
      await performNeetprepExtraction(identifier, users[identifier]);
      console.log(`[SYNC] refreshed data for ${identifier}`);
    } catch (error) {
      console.error(`[SYNC] failed for ${identifier}`, error.message || error);
    }
  }
};

cron.schedule(SYNC_CRON, () => {
  console.log('[CRON] scheduled sync triggered');
  performSync();
});

// ===============================================
// 🟢 PWJarvis Weekly Scrape Schedule
// ===============================================
const performPWJarvisSync = async () => {
  console.log('🟢 [CRON] PWJarvis weekly sync triggered');
  try {
    const result = await scrapePWJarvisBatches();
    if (result.success) {
      writeJSON(PWJARVIS_FILE, result);
      
      // Backup to Cloudinary
      if (CLOUDINARY_ENABLED) {
        try {
          const json = JSON.stringify(result, null, 2);
          const dataUri = `data:application/json;base64,${Buffer.from(json).toString('base64')}`;
          const publicId = `${CLOUDINARY_FOLDER}/pwjarvis/${Date.now()}`;
          await cloudinary.uploader.upload(dataUri, {
            resource_type: 'raw',
            public_id: publicId,
            overwrite: true,
          });
          console.log('✅ PWJarvis backup uploaded to Cloudinary');
        } catch (error) {
          console.warn('⚠️ PWJarvis Cloudinary backup failed:', error.message);
        }
      }
      
      console.log(`✅ [CRON] PWJarvis sync completed - ${result.count} batches scraped`);
    } else {
      console.error('❌ [CRON] PWJarvis sync failed:', result.error);
    }
  } catch (error) {
    console.error('❌ [CRON] PWJarvis sync error:', error.message);
  }
};

cron.schedule(PWJARVIS_SYNC_CRON, () => {
  performPWJarvisSync();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
