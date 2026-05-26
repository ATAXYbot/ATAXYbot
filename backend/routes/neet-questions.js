// routes/neet-questions.js
// API routes for NEET question management

const express = require('express');
const router = express.Router();

// Middleware to set Telegram user ID
const setTelegramUserId = (req, res, next) => {
  const telegramUserId = req.headers['x-telegram-user-id'];
  if (telegramUserId) {
    res.locals.telegramUserId = telegramUserId;
  }
  next();
};

router.use(setTelegramUserId);

// Get all chapters
router.get('/chapters', async (req, res) => {
  try {
    const { supabase } = req.app.locals;
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
router.get('/chapters/:chapterId/topics', async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { supabase } = req.app.locals;

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
router.get('/topics/:topicId/questions', async (req, res) => {
  try {
    const { topicId } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    const { supabase } = req.app.locals;

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

// Get single question with answer (after user selects answer)
router.get('/questions/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const { supabase } = req.app.locals;

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
router.post('/questions/:questionId/submit', async (req, res) => {
  try {
    const { questionId } = req.params;
    const { userAnswer } = req.body;
    const telegramUserId = res.locals.telegramUserId;

    if (!telegramUserId) {
      return res.status(401).json({ error: 'Unauthorized: No Telegram user ID' });
    }

    const { supabase } = req.app.locals;

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
        telegram_user_id: telegramUserId,
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
router.get('/user/stats', async (req, res) => {
  try {
    const telegramUserId = res.locals.telegramUserId;

    if (!telegramUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { supabase } = req.app.locals;

    // Get overall stats
    const { data: stats, error: statsError } = await supabase
      .from('user_progress')
      .select('is_correct')
      .eq('telegram_user_id', telegramUserId);

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
router.post('/user/register', async (req, res) => {
  try {
    const { telegramUserId, username, firstName, lastName, photoUrl } = req.body;

    if (!telegramUserId) {
      return res.status(400).json({ error: 'Missing telegram_user_id' });
    }

    const { supabase } = req.app.locals;

    // Upsert user
    const { data, error } = await supabase
      .from('user_accounts')
      .upsert({
        telegram_user_id: telegramUserId,
        username,
        first_name: firstName,
        last_name: lastName,
        profile_photo_url: photoUrl,
        updated_at: new Date().toISOString()
      }, { onConflict: 'telegram_user_id' })
      .select();

    if (error) throw error;

    res.json({ success: true, user: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search questions by tags
router.get('/questions/search', async (req, res) => {
  try {
    const { tags, difficulty, limit = 10 } = req.query;
    const { supabase } = req.app.locals;

    let query = supabase.from('questions').select('id, question_text, difficulty, tags');

    if (tags) {
      query = query.contains('tags', [tags]);
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    const { data, error } = await query.limit(Math.min(parseInt(limit), 20));

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
