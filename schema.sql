CREATE TABLE IF NOT EXISTS ai_answers_cache (
  question_id TEXT,
  selected_option TEXT,
  ai_explanation TEXT,
  PRIMARY KEY (question_id, selected_option)
);