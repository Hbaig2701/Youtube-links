const pool = require('../db/connection');

const create = async (data) => {
  const { rows } = await pool.query(`
    INSERT INTO bookings (click_id, link_id, ghl_contact_id, ghl_booking_id, contact_name, contact_email, booked_at, appointment_time, status, utm_source, utm_campaign, utm_content, utm_term, time_to_book_seconds)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING id
  `, [
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
    data.timeToBookSeconds || null,
  ]);
  return findById(rows[0].id);
};

const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
  return rows[0];
};

const findByGhlBookingId = async (ghlBookingId) => {
  const { rows } = await pool.query('SELECT * FROM bookings WHERE ghl_booking_id = $1', [ghlBookingId]);
  return rows[0];
};

const updateStatus = async (ghlBookingId, status) => {
  await pool.query('UPDATE bookings SET status = $1 WHERE ghl_booking_id = $2', [status, ghlBookingId]);
  return findByGhlBookingId(ghlBookingId);
};

const getSummary = async () => {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*) AS total_all_time,
      SUM(CASE WHEN booked_at >= NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END) AS total_7d,
      SUM(CASE WHEN booked_at >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) AS total_30d
    FROM bookings
    WHERE status != 'cancelled'
  `);
  return rows[0];
};

const getConversionRate = async () => {
  const clickResult = await pool.query(`
    SELECT COUNT(*) AS total FROM clicks c
    JOIN links l ON l.id = c.link_id
    JOIN videos v ON v.id = l.video_id
    WHERE l.is_booking_link = true AND l.active = true
      AND v.source_type = 'youtube'
  `);

  const bookingResult = await pool.query(`
    SELECT COUNT(*) AS total FROM bookings b
    JOIN links l ON l.id = b.link_id
    JOIN videos v ON v.id = l.video_id
    WHERE b.status != 'cancelled'
      AND v.source_type = 'youtube'
  `);

  const clicks = parseInt(clickResult.rows[0].total);
  const bookings = parseInt(bookingResult.rows[0].total);
  const rate = clicks > 0 ? (bookings / clicks) * 100 : 0;
  return { clicks, bookings, rate: Math.round(rate * 10) / 10 };
};

const getAvgTimeToBook = async () => {
  const { rows } = await pool.query(`
    SELECT AVG(time_to_book_seconds) AS avg_seconds
    FROM bookings
    WHERE time_to_book_seconds IS NOT NULL AND status != 'cancelled'
  `);
  return rows[0].avg_seconds ? Math.round(parseFloat(rows[0].avg_seconds)) : null;
};

const getByVideoId = async (videoId) => {
  const { rows } = await pool.query(`
    SELECT b.*, v.title AS video_title, v.slug AS video_slug, l.label AS link_label
    FROM bookings b
    LEFT JOIN links l ON l.id = b.link_id
    LEFT JOIN videos v ON v.id = l.video_id
    WHERE l.video_id = $1
    ORDER BY b.booked_at DESC
  `, [videoId]);
  return rows;
};

const getVideoConversionStats = async () => {
  const { rows } = await pool.query(`
    SELECT
      v.id, v.slug, v.title,
      COUNT(DISTINCT c.id) AS booking_clicks,
      COUNT(DISTINCT b.id) AS total_bookings,
      CASE WHEN COUNT(DISTINCT c.id) > 0
        THEN ROUND(COUNT(DISTINCT b.id)::numeric / COUNT(DISTINCT c.id) * 100, 1)
        ELSE 0
      END AS conversion_rate
    FROM videos v
    JOIN links l ON l.video_id = v.id AND l.is_booking_link = true AND l.active = true
    LEFT JOIN clicks c ON c.link_id = l.id
    LEFT JOIN bookings b ON b.link_id = l.id AND b.status != 'cancelled'
    WHERE v.archived = false
    GROUP BY v.id
    ORDER BY total_bookings DESC
  `);
  return rows;
};

const getRecent = async (limit = 10) => {
  const { rows } = await pool.query(`
    SELECT b.*, v.title AS video_title, v.slug AS video_slug, l.label AS link_label
    FROM bookings b
    LEFT JOIN links l ON l.id = b.link_id
    LEFT JOIN videos v ON v.id = l.video_id
    ORDER BY b.booked_at DESC
    LIMIT $1
  `, [limit]);
  return rows;
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
