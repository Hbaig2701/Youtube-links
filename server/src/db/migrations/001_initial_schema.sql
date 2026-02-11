CREATE TABLE IF NOT EXISTS videos (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  slug            TEXT    NOT NULL UNIQUE,
  title           TEXT    NOT NULL,
  youtube_url     TEXT,
  youtube_video_id TEXT,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  archived        INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_videos_slug ON videos(slug);
CREATE INDEX IF NOT EXISTS idx_videos_archived ON videos(archived);

CREATE TABLE IF NOT EXISTS links (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id        INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  label           TEXT    NOT NULL,
  destination_url TEXT    NOT NULL,
  is_booking_link INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  expires_at      TEXT,
  active          INTEGER NOT NULL DEFAULT 1,
  UNIQUE(video_id, label)
);

CREATE INDEX IF NOT EXISTS idx_links_video_id ON links(video_id);
CREATE INDEX IF NOT EXISTS idx_links_active ON links(active);

CREATE TABLE IF NOT EXISTS clicks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  link_id     INTEGER NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  clicked_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  ip_hash     TEXT,
  country     TEXT,
  city        TEXT,
  device_type TEXT,
  browser     TEXT,
  os          TEXT,
  referrer    TEXT,
  session_id  TEXT
);

CREATE INDEX IF NOT EXISTS idx_clicks_link_id ON clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_clicks_link_clicked ON clicks(link_id, clicked_at);
CREATE INDEX IF NOT EXISTS idx_clicks_session_id ON clicks(session_id);
