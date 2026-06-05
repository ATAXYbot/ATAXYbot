CREATE TABLE IF NOT EXISTS ataxy_cache (
  query_text TEXT PRIMARY KEY,
  text_response TEXT,
  audio_base64 TEXT
);