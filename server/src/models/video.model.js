const db = require('../db/connection');
const slugify = require('../utils/slugify');

const findAll = () => {
  return db.prepare(`
    SELECT v.*,
           d.domain, d.label AS domain_label,
           COUNT(DISTINCT l.id) AS link_count,
           COUNT(c.id) AS total_clicks
    FROM videos v
    LEFT JOIN domains d ON d.id = v.domain_id
    LEFT JOIN links l ON l.video_id = v.id AND l.active = 1
    LEFT JOIN clicks c ON c.link_id = l.id
    WHERE v.archived = 0
    GROUP BY v.id
    ORDER BY v.created_at DESC
  `).all();
};

const findById = (id) => {
  return db.prepare(`
    SELECT v.*,
           d.domain, d.label AS domain_label,
           COUNT(DISTINCT l.id) AS link_count,
           COUNT(c.id) AS total_clicks
    FROM videos v
    LEFT JOIN domains d ON d.id = v.domain_id
    LEFT JOIN links l ON l.video_id = v.id AND l.active = 1
    LEFT JOIN clicks c ON c.link_id = l.id
    WHERE v.id = ?
    GROUP BY v.id
  `).get(id);
};

const findBySlug = (slug) => {
  return db.prepare('SELECT * FROM videos WHERE slug = ? AND archived = 0').get(slug);
};

const create = ({ slug: customSlug, title, youtubeUrl, youtubeVideoId, domainId }) => {
  let slug = customSlug ? slugify(customSlug) : slugify(title);

  // Handle slug collisions
  const existing = db.prepare('SELECT slug FROM videos WHERE slug LIKE ?').all(slug + '%');
  if (existing.some(v => v.slug === slug)) {
    let counter = 2;
    while (existing.some(v => v.slug === `${slug}-${counter}`)) {
      counter++;
    }
    slug = `${slug}-${counter}`;
  }

  const result = db.prepare(`
    INSERT INTO videos (slug, title, youtube_url, youtube_video_id, domain_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(slug, title, youtubeUrl || null, youtubeVideoId || null, domainId || null);

  return findById(result.lastInsertRowid);
};

const update = (id, fields) => {
  const allowed = ['title', 'youtube_url', 'youtube_video_id', 'domain_id'];
  const sets = [];
  const values = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }

  if (sets.length === 0) return findById(id);

  values.push(id);
  db.prepare(`UPDATE videos SET ${sets.join(', ')} WHERE id = ?`).run(...values);
  return findById(id);
};

const archive = (id) => {
  db.prepare('UPDATE videos SET archived = 1 WHERE id = ?').run(id);
};

module.exports = { findAll, findById, findBySlug, create, update, archive };
