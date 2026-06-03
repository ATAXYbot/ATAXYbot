DROP TABLE IF EXISTS ai_answers_cache;

CREATE TABLE IF NOT EXISTS ai_answers_cache (
  question_id TEXT,
  selected_option TEXT,
  user_query TEXT,
  ai_explanation TEXT,
  PRIMARY KEY (question_id, selected_option, user_query)
);