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
