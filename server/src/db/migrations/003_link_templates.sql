CREATE TABLE IF NOT EXISTS link_templates (
  id              SERIAL PRIMARY KEY,
  label           TEXT    NOT NULL UNIQUE,
  destination_url TEXT    NOT NULL,
  is_booking_link BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
