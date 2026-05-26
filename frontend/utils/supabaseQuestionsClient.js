import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client using your specific project URL and publishable key
const supabaseUrl = 'https://kwzpnupjtvfrevpwfaao.supabase.co';
const supabaseKey = 'sb_publishable_BQ3FzD6jag0nHhYmUu0Bcw_Qq1CEeal';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetches all multiple-choice questions from the 'questions' table.
 * @returns {Promise<Array>} Array of question objects
 */
export async function fetchQuestions() {
  const { data, error } = await supabase
    .from('questions')
    .select('*');

  if (error) {
    console.error('Error fetching questions from Supabase:', error.message);
    return []; // Return an empty array as a fallback
  }

  console.log(`Successfully fetched ${data ? data.length : 0} questions:`, data);
  return data;
}