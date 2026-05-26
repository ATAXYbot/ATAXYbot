// Frontend utilities for Supabase integration
// utils/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// API functions
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const neetApi = {
  // Get all chapters
  async getChapters() {
    try {
      const response = await fetch(`${API_URL}/api/neet/chapters`);
      if (!response.ok) throw new Error('Failed to fetch chapters');
      return await response.json();
    } catch (error) {
      console.error('Error fetching chapters:', error);
      return [];
    }
  },

  // Get topics by chapter
  async getTopics(chapterId) {
    try {
      const response = await fetch(`${API_URL}/api/neet/chapters/${chapterId}/topics`);
      if (!response.ok) throw new Error('Failed to fetch topics');
      return await response.json();
    } catch (error) {
      console.error('Error fetching topics:', error);
      return [];
    }
  },

  // Get questions by topic
  async getQuestions(topicId, limit = 10, offset = 0) {
    try {
      const response = await fetch(
        `${API_URL}/api/neet/topics/${topicId}/questions?limit=${limit}&offset=${offset}`,
        {
          headers: {
            'x-telegram-user-id': getTelegramUserId() || ''
          }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch questions');
      return await response.json();
    } catch (error) {
      console.error('Error fetching questions:', error);
      return { questions: [], total: 0, limit, offset };
    }
  },

  // Get single question
  async getQuestion(questionId) {
    try {
      const response = await fetch(`${API_URL}/api/neet/questions/${questionId}`, {
        headers: {
          'x-telegram-user-id': getTelegramUserId() || ''
        }
      });
      if (!response.ok) throw new Error('Failed to fetch question');
      return await response.json();
    } catch (error) {
      console.error('Error fetching question:', error);
      return null;
    }
  },

  // Submit answer
  async submitAnswer(questionId, userAnswer) {
    try {
      const response = await fetch(`${API_URL}/api/neet/questions/${questionId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-user-id': getTelegramUserId() || ''
        },
        body: JSON.stringify({ userAnswer })
      });
      if (!response.ok) throw new Error('Failed to submit answer');
      return await response.json();
    } catch (error) {
      console.error('Error submitting answer:', error);
      return null;
    }
  },

  // Get user stats
  async getUserStats() {
    try {
      const response = await fetch(`${API_URL}/api/neet/user/stats`, {
        headers: {
          'x-telegram-user-id': getTelegramUserId() || ''
        }
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { totalAttempts: 0, correctAnswers: 0, accuracy: 0 };
    }
  },

  // Register user
  async registerUser(telegramData) {
    try {
      const response = await fetch(`${API_URL}/api/neet/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramUserId: telegramData.id,
          username: telegramData.username,
          firstName: telegramData.first_name,
          lastName: telegramData.last_name,
          photoUrl: telegramData.photo_url
        })
      });
      if (!response.ok) throw new Error('Failed to register user');
      return await response.json();
    } catch (error) {
      console.error('Error registering user:', error);
      return null;
    }
  }
};

// Telegram utilities
export const getTelegramUserId = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user) {
    return window.Telegram.WebApp.initDataUnsafe.user.id.toString();
  }
  return null;
};

export const getTelegramUser = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user) {
    return window.Telegram.WebApp.initDataUnsafe.user;
  }
  return null;
};

// Content protection
export const preventContentCopy = () => {
  if (typeof document === 'undefined') return;

  document.addEventListener('copy', (e) => {
    e.preventDefault();
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert('Content protected - copying disabled');
    }
  });

  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // Disable text selection on long press
  document.addEventListener('selectstart', (e) => {
    if (e.target.closest('[data-protected]')) {
      e.preventDefault();
    }
  });
};
