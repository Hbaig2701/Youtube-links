CREATE TABLE IF NOT EXISTS videos (
  id              SERIAL PRIMARY KEY,
  slug            TEXT    NOT NULL UNIQUE,
  title           TEXT    NOT NULL,
  youtube_url     TEXT,
  youtube_video_id TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived        BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_videos_slug ON videos(slug);
CREATE INDEX IF NOT EXISTS idx_videos_archived ON videos(archived);

CREATE TABLE IF NOT EXISTS links (
  id              SERIAL PRIMARY KEY,
  video_id        INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  label           TEXT    NOT NULL,
  destination_url TEXT    NOT NULL,
  is_booking_link BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ,
  active          BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(video_id, label)
);

CREATE INDEX IF NOT EXISTS idx_links_video_id ON links(video_id);
CREATE INDEX IF NOT EXISTS idx_links_active ON links(active);

CREATE TABLE IF NOT EXISTS clicks (
  id          SERIAL PRIMARY KEY,
  link_id     INTEGER NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  clicked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
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
