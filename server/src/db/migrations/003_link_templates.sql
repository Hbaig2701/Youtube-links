CREATE TABLE IF NOT EXISTS link_templates (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  label           TEXT    NOT NULL UNIQUE,
  destination_url TEXT    NOT NULL,
  is_booking_link INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);
