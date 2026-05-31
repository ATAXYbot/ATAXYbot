const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cron = require('node-cron');
let scrapePWJarvisBatches;
try {
  scrapePWJarvisBatches = require('./scrapers/pwjarvis-scraper').scrapePWJarvisBatches;
} catch (e) {
  console.warn('PWJarvis scraper not available:', e.message);
  scrapePWJarvisBatches = async () => [];
}
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const cloudinary = require('cloudinary').v2;
const fetchFn = typeof fetch !== 'undefined' ? fetch : require('node-fetch');

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
const CLOUDINARY_ENABLED = !!(process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_ID) && !!process.env.CLOUDINARY_API_KEY && !!process.env.CLOUDINARY_API_SECRET;
const GITHUB_RAW_URL = process.env.GITHUB_RAW_URL || 'https://raw.githubusercontent.com/risha-ilahe/ATAXY-BATCHES/main/pwjarvis-batches.json';
const PWJARVIS_SITE_URL = process.env.PWJARVIS_SITE_URL || 'https://www.pwjarvis.com/study/all-batches';
const PWJARVIS_SYNC_CRON = process.env.PWJARVIS_SYNC_CRON || '0 3 * * 0';

const readJSON = (file, fallback) => {
  try { return JSON.parse(fs.readFileSync(file, 'utf8') || 'null') || fallback; } catch (e) { return fallback; }
};
const writeJSON = (file, obj) => fs.writeFileSync(file, JSON.stringify(obj, null, 2));

const app = express();

// Initialize Supabase (optional)
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    app.locals.supabase = supabase;
    console.log('✅ Supabase connected');
  } catch (error) {
    console.warn('⚠️ Supabase initialization failed:', error.message);
  }
} else {
  console.warn('⚠️ Supabase credentials not configured. Using local JSON fallback.');
}

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

const uploadPayloadToGitHub = async (payload) => {
  const repo = process.env.GITHUB_REPO;
  const filePath = process.env.GITHUB_PATH;
  const token = process.env.GITHUB_TOKEN;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!repo || !filePath || !token) return null;

  try {
    const url = `https://api.github.com/repos/${repo}/contents/${filePath}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    };

    const currentResponse = await fetchFn(url, { headers });
    const body = {
      message: `Update PWJarvis batches ${new Date().toISOString()}`,
      content: Buffer.from(JSON.stringify(payload, null, 2)).toString('base64'),
      branch,
      committer: {
        name: 'ATAXYbot',
        email: 'no-reply@ataxybot.local',
      },
    };

    if (currentResponse.ok) {
      const existing = await currentResponse.json();
      if (existing.sha) body.sha = existing.sha;
    }

    const response = await fetchFn(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub upload failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    return result.content?.html_url || result.content?.download_url || null;
  } catch (error) {
    console.error('[GITHUB] upload failed', error.message || error);
    return null;
  }
};

const savePWJarvisData = async (payload) => {
  const entry = {
    ...payload,
    source: 'pwjarvis.com',
    savedAt: new Date().toISOString(),
  };

  writeJSON(PWJARVIS_FILE, entry);

  const cloudinaryUrl = await uploadBackupToCloudinary('pwjarvis', entry);
  if (cloudinaryUrl) {
    entry.cloudinaryUrl = cloudinaryUrl;
    writeJSON(PWJARVIS_FILE, entry);
  }

  const githubUrl = await uploadPayloadToGitHub(entry);
  if (githubUrl) {
    entry.githubUrl = githubUrl;
    writeJSON(PWJARVIS_FILE, entry);
  }

  return entry;
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
// 🟢 PWJarvis Batch API Endpoints
// ===============================================

app.get('/api/pwjarvis/batches', async (req, res) => {
  try {
    // First try to get from local cache
    let data = readJSON(PWJARVIS_FILE, { batches: [], scrapedAt: null });
    
    // If local cache is empty or very old, fetch from GitHub
    if (!data.batches || data.batches.length === 0) {
      console.log('📡 Fetching PWJarvis batches from GitHub...');
      try {
        const response = await fetchFn(GITHUB_RAW_URL);
        if (response.ok) {
          data = await response.json();
          // Save to local cache
          writeJSON(PWJARVIS_FILE, data);
          console.log(`✅ Fetched ${data.batches?.length || 0} batches from GitHub`);
        }
      } catch (error) {
        console.error('⚠️ Failed to fetch from GitHub:', error.message);
      }
    }
    
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

app.get('/api/pwjarvis/batch/:id', async (req, res) => {
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

app.post('/api/pwjarvis/scrape', async (req, res) => {
  try {
    const data = await scrapePWJarvisBatches();
    if (data.success) {
      await savePWJarvisData(data);
      return res.json({ ok: true, message: `Successfully scraped ${data.count} batches`, data });
    } else {
      return res.status(500).json({ ok: false, error: data.error });
    }
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

app.post('/api/pwjarvis/refresh', async (req, res) => {
  try {
    const data = await scrapePWJarvisBatches();
    if (data.success) {
      await savePWJarvisData(data);
      return res.json({ ok: true, message: `Refreshed ${data.count} batches`, data });
    }
    return res.status(500).json({ ok: false, error: 'Refresh failed' });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

const performPWJarvisSync = async () => {
  console.log('[CRON] PWJarvis weekly sync triggered');
  try {
    const data = await scrapePWJarvisBatches();
    if (data.success) {
      await savePWJarvisData(data);
      console.log(`✅ [CRON] PWJarvis sync completed - ${data.count} batches scraped`);
    }
  } catch (err) {
    console.error('❌ [CRON] PWJarvis sync failed:', err);
  }
};

// Weekly Cron Job for Auto-Sync
cron.schedule(PWJARVIS_SYNC_CRON, () => {
  performPWJarvisSync();
});

// ============================================================
// NEET QUESTIONS API - Supabase Integration
// ============================================================

// Middleware to set Telegram user ID
const setTelegramUserId = (req, res, next) => {
  const telegramUserId = req.headers['x-telegram-user-id'];
  if (telegramUserId) {
    res.locals.telegramUserId = telegramUserId;
  }
  next();
};

app.use('/api/neet', setTelegramUserId);

// Get all chapters
app.get('/api/neet/chapters', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('chapters')
      .select('id, name, subject, description, order_index')
      .order('order_index', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get topics by chapter
app.get('/api/neet/chapters/:chapterId/topics', async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { data, error } = await supabase
      .from('topics')
      .select('id, name, order_index')
      .eq('chapter_id', chapterId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get questions by topic (with pagination & protection)
app.get('/api/neet/topics/:topicId/questions', async (req, res) => {
  try {
    const { topicId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    // Limit max questions per request (protection against bulk copying)
    const queryLimit = Math.min(parseInt(limit), 20);

    const { data, error, count } = await supabase
      .from('questions')
      .select('id, question_text, question_type, options, difficulty, image_url, tags', { count: 'exact' })
      .eq('topic_id', topicId)
      .order('id', { ascending: true })
      .range(offset, offset + queryLimit - 1);

    if (error) throw error;

    res.json({
      questions: data,
      total: count,
      limit: queryLimit,
      offset: parseInt(offset)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single question with answer
app.get('/api/neet/questions/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit answer and track progress
app.post('/api/neet/questions/:questionId/submit', async (req, res) => {
  try {
    const { questionId } = req.params;
    const { userAnswer } = req.body;
    const telegramUserId = res.locals.telegramUserId;

    if (!telegramUserId) {
      return res.status(401).json({ error: 'Unauthorized: No Telegram user ID' });
    }

    // Get question
    const { data: question, error: qError } = await supabase
      .from('questions')
      .select('correct_answer, explanation')
      .eq('id', questionId)
      .single();

    if (qError) throw qError;

    const isCorrect = question.correct_answer === userAnswer;

    // Log progress
    const { error: pError } = await supabase
      .from('user_progress')
      .insert({
        telegram_user_id: parseInt(telegramUserId),
        question_id: questionId,
        is_correct: isCorrect,
        attempts: 1
      });

    if (pError) throw pError;

    res.json({
      isCorrect,
      correctAnswer: question.correct_answer,
      explanation: question.explanation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user stats
app.get('/api/neet/user/stats', async (req, res) => {
  try {
    const telegramUserId = res.locals.telegramUserId;

    if (!telegramUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get overall stats
    const { data: stats, error: statsError } = await supabase
      .from('user_progress')
      .select('is_correct')
      .eq('telegram_user_id', parseInt(telegramUserId));

    if (statsError) throw statsError;

    const correct = stats.filter(s => s.is_correct).length;
    const total = stats.length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    res.json({
      totalAttempts: total,
      correctAnswers: correct,
      accuracy: accuracy
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register/update user account
app.post('/api/neet/user/register', async (req, res) => {
  try {
    const { telegramUserId, username, firstName, lastName, photoUrl } = req.body;

    if (!telegramUserId) {
      return res.status(400).json({ error: 'Missing telegram_user_id' });
    }

    // Try Supabase first
    if (supabase) {
      const { data, error } = await supabase
        .from('user_accounts')
        .upsert({
          telegram_user_id: parseInt(telegramUserId),
          username,
          first_name: firstName,
          last_name: lastName,
          profile_photo_url: photoUrl,
          updated_at: new Date().toISOString()
        }, { onConflict: 'telegram_user_id' })
        .select();

      if (error) throw error;
      return res.json({ success: true, user: data[0] });
    }

    // Fallback to local JSON
    const users = readJSON(USERS_FILE, {});
    users[telegramUserId] = {
      telegram_user_id: parseInt(telegramUserId),
      username,
      first_name: firstName,
      last_name: lastName,
      profile_photo_url: photoUrl,
      updated_at: new Date().toISOString()
    };
    writeJSON(USERS_FILE, users);
    res.json({ success: true, user: users[telegramUserId] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/neet/users', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('user_accounts')
        .select('telegram_user_id, username, first_name, last_name, profile_photo_url, updated_at')
        .order('updated_at', { ascending: false });

      if (!error && data) {
        return res.json({ users: data || [] });
      }
    }

    const users = readJSON(USERS_FILE, {});
    return res.json({ users: Object.values(users) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟢 NEET Practice Topics API - Get unique subject/chapter/topic filters
app.get('/api/neet/practice-topics', async (req, res) => {
  try {
    // Try Supabase first
    if (supabase) {
      const tableName = 'Raceee_testttingg_checkinggg';
      
      // Get all unique subjects
      const { data: allData, error } = await supabase
        .from(tableName)
        .select('subject, chapter, topic')
        .order('subject', { ascending: true })
        .order('chapter', { ascending: true })
        .order('topic', { ascending: true });

      if (!error && allData && allData.length > 0) {
        const result = allData.map(row => ({
          batch: 'Allen Module',
          file: 'Race',
          subject: row.subject,
          chapter: row.chapter,
          topic: row.topic
        }));
        return res.json({ data: result });
      } else if (error) {
        console.warn('Supabase error:', error.message);
      }
    }

    // Fallback to local JSON
    const practiceData = readJSON(path.join(DATA_DIR, 'practice-topics.json'), []);
    const mappedData = practiceData.map(row => ({
      batch: 'Allen Module',
      file: 'Race',
      subject: row.subject,
      chapter: row.chapter,
      topic: row.topic
    }));
    res.json({ data: mappedData });
  } catch (error) {
    console.error('Error fetching practice topics:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🟢 NEET Quiz Questions API - Get all questions for subject/chapter/topic
app.get('/api/neet/quiz/:subject/:chapter/:topic', async (req, res) => {
  try {
    const { subject, chapter, topic } = req.params;
    const decodedSubject = decodeURIComponent(subject);
    const decodedChapter = decodeURIComponent(chapter);
    const decodedTopic = decodeURIComponent(topic);

    if (supabase) {
      const tableName = 'Raceee_testttingg_checkinggg';
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('subject', decodedSubject)
        .eq('chapter', decodedChapter)
        .eq('topic', decodedTopic);

      if (!error && data && data.length > 0) {
        // Transform data to match quiz format
        const questions = data.map((q, idx) => ({
          id: `q_${idx}`,
          globalIndex: idx + 1,
          text: q.question_text || q.question || 'Unnamed Question',
          imageUrl: q.image_url || null,
          options: [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean),
          correct: ['A', 'B', 'C', 'D'].indexOf((q.correct_option || 'A').toUpperCase()),
          correctOption: q.correct_option,
          topicName: decodedTopic,
          subject: decodedSubject,
          chapter: decodedChapter
        }));
        return res.json({ data: questions });
      } else if (error) {
        console.warn('Supabase error:', error.message);
      }
    }

    res.status(404).json({ error: 'No questions found' });
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend listening on port ${PORT}`);
  console.log(`📡 PWJarvis API: GET http://localhost:${PORT}/api/pwjarvis/batches`);
  console.log(`📡 NEET Practice API: GET http://localhost:${PORT}/api/neet/practice-topics`);
  console.log(`📡 NEET Quiz API: GET http://localhost:${PORT}/api/neet/quiz/:subject/:chapter/:topic`);
});

// ============================================================
// TELEGRAM BOT WEBAPP INTEGRATION
// ============================================================
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7977433269:AAFCtV_YvR8zcg5tiAr433tNE-4bSCgjkZ0';
// Automatically try to configure the Bot's Menu button to launch your App
const setupTelegramBotMenu = async () => {
  if (!TELEGRAM_BOT_TOKEN) return;
  // Define your Frontend URL here (Make sure to set this in your .env for production)
  const webAppUrl = process.env.FRONTEND_URL || process.env.RENDER_EXTERNAL_URL || 'https://risha-ilahe.github.io/ATAXYbot/';
  
  try {
    const response = await fetchFn(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: {
          type: 'web_app',
          text: 'Practice 🚀',
          web_app: { url: webAppUrl }
        }
      })
    });
    
    const result = await response.json();
    if (result.ok) {
      console.log(`✅ Telegram Bot Menu Button successfully linked to Web App`);
    } else {
      console.warn(`⚠️ Could not set Telegram Bot Menu Button: ${result.description}`);
    }
  } catch (error) {
    console.error(`❌ Error configuring Telegram Bot Web App: ${error.message}`);
  }
};

setupTelegramBotMenu();
