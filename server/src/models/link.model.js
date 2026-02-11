const pool = require('../db/connection');

const findByVideoId = async (videoId) => {
  const { rows } = await pool.query(`
    SELECT l.*, COUNT(c.id) AS total_clicks
    FROM links l
    LEFT JOIN clicks c ON c.link_id = l.id
    WHERE l.video_id = $1 AND l.active = true
    GROUP BY l.id
    ORDER BY l.created_at DESC
  `, [videoId]);
  return rows;
};

const findById = async (id) => {
  const { rows } = await pool.query(`
    SELECT l.*, COUNT(c.id) AS total_clicks
    FROM links l
    LEFT JOIN clicks c ON c.link_id = l.id
    WHERE l.id = $1
    GROUP BY l.id
  `, [id]);
  return rows[0];
};

const findByVideoSlugAndLabel = async (slug, label) => {
  const { rows } = await pool.query(`
    SELECT l.*, v.slug AS video_slug
    FROM links l
    JOIN videos v ON v.id = l.video_id
    WHERE v.slug = $1 AND l.label = $2 AND l.active = true AND v.archived = false
  `, [slug, label]);
  return rows[0];
};

const create = async ({ videoId, label, destinationUrl, isBookingLink, expiresAt }) => {
  const { rows } = await pool.query(`
    INSERT INTO links (video_id, label, destination_url, is_booking_link, expires_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `, [videoId, label, destinationUrl, isBookingLink || false, expiresAt || null]);

  return findById(rows[0].id);
};

const update = async (id, fields) => {
  const allowed = ['label', 'destination_url', 'is_booking_link', 'expires_at'];
  const sets = [];
  const values = [];
  let paramIndex = 1;

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = $${paramIndex}`);
      values.push(fields[key]);
      paramIndex++;
    }
  }

  if (sets.length === 0) return findById(id);

  values.push(id);
  await pool.query(
    `UPDATE links SET ${sets.join(', ')} WHERE id = $${paramIndex}`, values
  );
  return findById(id);
};

const deactivate = async (id) => {
  await pool.query('UPDATE links SET active = false WHERE id = $1', [id]);
};

module.exports = { findByVideoId, findById, findByVideoSlugAndLabel, create, update, deactivate };
