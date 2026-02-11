CREATE TABLE IF NOT EXISTS domains (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  domain     TEXT    NOT NULL UNIQUE,
  label      TEXT    NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

ALTER TABLE videos ADD COLUMN domain_id INTEGER REFERENCES domains(id);
