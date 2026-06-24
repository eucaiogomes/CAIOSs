use rusqlite::{Connection, Result};

const SCHEMA: &str = "
CREATE TABLE IF NOT EXISTS tools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  description TEXT,
  command TEXT,
  url TEXT,
  path TEXT,
  icon TEXT,
  is_favorite INTEGER DEFAULT 0,
  open_mode TEXT DEFAULT 'internal',
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'idea',
  local_path TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS prompts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  content TEXT NOT NULL,
  recommended_tool_id TEXT,
  project_id TEXT,
  tags TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS experiments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  objective TEXT,
  result TEXT,
  rating INTEGER,
  should_continue INTEGER,
  project_id TEXT,
  tools_used TEXT,
  logs TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS project_tools (
  project_id TEXT NOT NULL,
  tool_id TEXT NOT NULL,
  PRIMARY KEY (project_id, tool_id)
);

CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY,
  type TEXT,
  message TEXT,
  tool_id TEXT,
  project_id TEXT,
  created_at TEXT
);
";

#[tauri::command]
pub fn init_db(db_path: String) -> Result<(), String> {
    let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;
    conn.execute_batch(SCHEMA).map_err(|e| e.to_string())?;
    Ok(())
}