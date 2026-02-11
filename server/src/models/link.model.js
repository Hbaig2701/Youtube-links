const db = require('../db/connection');

const findByVideoId = (videoId) => {
  return db.prepare(`
    SELECT l.*, COUNT(c.id) AS total_clicks
    FROM links l
    LEFT JOIN clicks c ON c.link_id = l.id
    WHERE l.video_id = ? AND l.active = 1
    GROUP BY l.id
    ORDER BY l.created_at DESC
  `).all(videoId);
};

const findById = (id) => {
  return db.prepare(`
    SELECT l.*, COUNT(c.id) AS total_clicks
    FROM links l
    LEFT JOIN clicks c ON c.link_id = l.id
    WHERE l.id = ?
    GROUP BY l.id
  `).get(id);
};

const findByVideoSlugAndLabel = (slug, label) => {
  return db.prepare(`
    SELECT l.*, v.slug AS video_slug
    FROM links l
    JOIN videos v ON v.id = l.video_id
    WHERE v.slug = ? AND l.label = ? AND l.active = 1 AND v.archived = 0
  `).get(slug, label);
};

const create = ({ videoId, label, destinationUrl, isBookingLink, expiresAt }) => {
  const result = db.prepare(`
    INSERT INTO links (video_id, label, destination_url, is_booking_link, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(videoId, label, destinationUrl, isBookingLink ? 1 : 0, expiresAt || null);

  return findById(result.lastInsertRowid);
};

const update = (id, fields) => {
  const allowed = ['label', 'destination_url', 'is_booking_link', 'expires_at'];
  const sets = [];
  const values = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = ?`);
      values.push(key === 'is_booking_link' ? (fields[key] ? 1 : 0) : fields[key]);
    }
  }

  if (sets.length === 0) return findById(id);

  values.push(id);
  db.prepare(`UPDATE links SET ${sets.join(', ')} WHERE id = ?`).run(...values);
  return findById(id);
};

const deactivate = (id) => {
  db.prepare('UPDATE links SET active = 0 WHERE id = ?').run(id);
};

module.exports = { findByVideoId, findById, findByVideoSlugAndLabel, create, update, deactivate };
