const pool = require('./connection');

// Inline migrations for Vercel serverless compatibility
// (fs.readdirSync won't work because .sql files aren't bundled)
const migrations = [
  {
    name: '001_initial_schema.sql',
    sql: `
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
    `
  },
  {
    name: '002_domains.sql',
    sql: `
CREATE TABLE IF NOT EXISTS domains (
  id         SERIAL PRIMARY KEY,
  domain     TEXT    NOT NULL UNIQUE,
  label      TEXT    NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE videos ADD COLUMN IF NOT EXISTS domain_id INTEGER REFERENCES domains(id);
    `
  },
  {
    name: '003_link_templates.sql',
    sql: `
CREATE TABLE IF NOT EXISTS link_templates (
  id              SERIAL PRIMARY KEY,
  label           TEXT    NOT NULL UNIQUE,
  destination_url TEXT    NOT NULL,
  is_booking_link BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
    `
  },
  {
    name: '004_bookings.sql',
    sql: `
CREATE TABLE IF NOT EXISTS bookings (
  id                    SERIAL PRIMARY KEY,
  click_id              INTEGER REFERENCES clicks(id),
  link_id               INTEGER REFERENCES links(id),
  ghl_contact_id        TEXT,
  ghl_booking_id        TEXT UNIQUE,
  contact_name          TEXT,
  contact_email         TEXT,
  booked_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  appointment_time      TIMESTAMPTZ,
  status                TEXT    NOT NULL DEFAULT 'confirmed',
  utm_source            TEXT,
  utm_campaign          TEXT,
  utm_content           TEXT,
  utm_term              TEXT,
  time_to_book_seconds  INTEGER
);
CREATE INDEX IF NOT EXISTS idx_bookings_link_id ON bookings(link_id);
CREATE INDEX IF NOT EXISTS idx_bookings_click_id ON bookings(click_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_booked_at ON bookings(booked_at);
CREATE INDEX IF NOT EXISTS idx_bookings_ghl_booking_id ON bookings(ghl_booking_id);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);
    `
  }
  },
  {
    name: '005_webhook_logs_and_video_source.sql',
    sql: `
CREATE TABLE IF NOT EXISTS webhook_logs (
  id          SERIAL PRIMARY KEY,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type  TEXT,
  payload     JSONB NOT NULL,
  booking_id  INTEGER REFERENCES bookings(id)
);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_received_at ON webhook_logs(received_at);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_booking_id ON webhook_logs(booking_id);

ALTER TABLE videos ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'youtube';
    `
  }
];

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const { rows } = await pool.query('SELECT name FROM _migrations');
  const ran = new Set(rows.map(r => r.name));

  for (const { name, sql } of migrations) {
    if (ran.has(name)) continue;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO _migrations (name) VALUES ($1)', [name]);
      await client.query('COMMIT');
      console.log(`Migration applied: ${name}`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = migrate;
