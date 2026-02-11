CREATE TABLE IF NOT EXISTS bookings (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  click_id              INTEGER REFERENCES clicks(id),
  link_id               INTEGER REFERENCES links(id),
  ghl_contact_id        TEXT,
  ghl_booking_id        TEXT UNIQUE,
  contact_name          TEXT,
  contact_email         TEXT,
  booked_at             TEXT    NOT NULL DEFAULT (datetime('now')),
  appointment_time      TEXT,
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
