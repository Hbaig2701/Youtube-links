const db = require('../db/connection');

const create = (data) => {
  const result = db.prepare(`
    INSERT INTO bookings (click_id, link_id, ghl_contact_id, ghl_booking_id, contact_name, contact_email, booked_at, appointment_time, status, utm_source, utm_campaign, utm_content, utm_term, time_to_book_seconds)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.clickId || null,
    data.linkId || null,
    data.ghlContactId || null,
    data.ghlBookingId || null,
    data.contactName || null,
    data.contactEmail || null,
    data.bookedAt || new Date().toISOString(),
    data.appointmentTime || null,
    data.status || 'confirmed',
    data.utmSource || null,
    data.utmCampaign || null,
    data.utmContent || null,
    data.utmTerm || null,
    data.timeToBookSeconds || null
  );
  return findById(result.lastInsertRowid);
};

const findById = (id) => {
  return db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
};

const findByGhlBookingId = (ghlBookingId) => {
  return db.prepare('SELECT * FROM bookings WHERE ghl_booking_id = ?').get(ghlBookingId);
};

const updateStatus = (ghlBookingId, status) => {
  db.prepare('UPDATE bookings SET status = ? WHERE ghl_booking_id = ?').run(status, ghlBookingId);
  return findByGhlBookingId(ghlBookingId);
};

const getSummary = () => {
  return db.prepare(`
    SELECT
      COUNT(*) AS total_all_time,
      SUM(CASE WHEN booked_at >= datetime('now', '-7 days') THEN 1 ELSE 0 END) AS total_7d,
      SUM(CASE WHEN booked_at >= datetime('now', '-30 days') THEN 1 ELSE 0 END) AS total_30d
    FROM bookings
    WHERE status != 'cancelled'
  `).get();
};

const getConversionRate = () => {
  const clicks = db.prepare(`
    SELECT COUNT(*) AS total FROM clicks c
    JOIN links l ON l.id = c.link_id
    WHERE l.is_booking_link = 1 AND l.active = 1
  `).get();

  const bookings = db.prepare(`
    SELECT COUNT(*) AS total FROM bookings WHERE status != 'cancelled'
  `).get();

  const rate = clicks.total > 0 ? (bookings.total / clicks.total) * 100 : 0;
  return { clicks: clicks.total, bookings: bookings.total, rate: Math.round(rate * 10) / 10 };
};

const getAvgTimeToBook = () => {
  const result = db.prepare(`
    SELECT AVG(time_to_book_seconds) AS avg_seconds
    FROM bookings
    WHERE time_to_book_seconds IS NOT NULL AND status != 'cancelled'
  `).get();
  return result.avg_seconds ? Math.round(result.avg_seconds) : null;
};

const getByVideoId = (videoId) => {
  return db.prepare(`
    SELECT b.*, v.title AS video_title, v.slug AS video_slug, l.label AS link_label
    FROM bookings b
    LEFT JOIN links l ON l.id = b.link_id
    LEFT JOIN videos v ON v.id = l.video_id
    WHERE l.video_id = ?
    ORDER BY b.booked_at DESC
  `).all(videoId);
};

const getVideoConversionStats = () => {
  return db.prepare(`
    SELECT
      v.id, v.slug, v.title,
      COUNT(DISTINCT c.id) AS booking_clicks,
      COUNT(DISTINCT b.id) AS total_bookings,
      CASE WHEN COUNT(DISTINCT c.id) > 0
        THEN ROUND(CAST(COUNT(DISTINCT b.id) AS REAL) / COUNT(DISTINCT c.id) * 100, 1)
        ELSE 0
      END AS conversion_rate
    FROM videos v
    JOIN links l ON l.video_id = v.id AND l.is_booking_link = 1 AND l.active = 1
    LEFT JOIN clicks c ON c.link_id = l.id
    LEFT JOIN bookings b ON b.link_id = l.id AND b.status != 'cancelled'
    WHERE v.archived = 0
    GROUP BY v.id
    ORDER BY total_bookings DESC
  `).all();
};

const getRecent = (limit = 10) => {
  return db.prepare(`
    SELECT b.*, v.title AS video_title, v.slug AS video_slug, l.label AS link_label
    FROM bookings b
    LEFT JOIN links l ON l.id = b.link_id
    LEFT JOIN videos v ON v.id = l.video_id
    ORDER BY b.booked_at DESC
    LIMIT ?
  `).all(limit);
};

module.exports = {
  create,
  findById,
  findByGhlBookingId,
  updateStatus,
  getSummary,
  getConversionRate,
  getAvgTimeToBook,
  getByVideoId,
  getVideoConversionStats,
  getRecent,
};
