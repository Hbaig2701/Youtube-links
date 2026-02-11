const pool = require('../db/connection');
const slugify = require('../utils/slugify');

const findAll = async () => {
  const { rows } = await pool.query(`
    SELECT v.*,
           d.domain, d.label AS domain_label,
           COUNT(DISTINCT l.id) AS link_count,
           COUNT(c.id) AS total_clicks
    FROM videos v
    LEFT JOIN domains d ON d.id = v.domain_id
    LEFT JOIN links l ON l.video_id = v.id AND l.active = true
    LEFT JOIN clicks c ON c.link_id = l.id
    WHERE v.archived = false
    GROUP BY v.id, d.domain, d.label
    ORDER BY v.created_at DESC
  `);
  return rows;
};

const findById = async (id) => {
  const { rows } = await pool.query(`
    SELECT v.*,
           d.domain, d.label AS domain_label,
           COUNT(DISTINCT l.id) AS link_count,
           COUNT(c.id) AS total_clicks
    FROM videos v
    LEFT JOIN domains d ON d.id = v.domain_id
    LEFT JOIN links l ON l.video_id = v.id AND l.active = true
    LEFT JOIN clicks c ON c.link_id = l.id
    WHERE v.id = $1
    GROUP BY v.id, d.domain, d.label
  `, [id]);
  return rows[0];
};

const findBySlug = async (slug) => {
  const { rows } = await pool.query(
    'SELECT * FROM videos WHERE slug = $1 AND archived = false', [slug]
  );
  return rows[0];
};

const create = async ({ slug: customSlug, title, youtubeUrl, youtubeVideoId, domainId, sourceType }) => {
  let slug = customSlug ? slugify(customSlug) : slugify(title);

  // Handle slug collisions
  const { rows: existing } = await pool.query(
    'SELECT slug FROM videos WHERE slug LIKE $1', [slug + '%']
  );
  if (existing.some(v => v.slug === slug)) {
    let counter = 2;
    while (existing.some(v => v.slug === `${slug}-${counter}`)) {
      counter++;
    }
    slug = `${slug}-${counter}`;
  }

  const { rows } = await pool.query(`
    INSERT INTO videos (slug, title, youtube_url, youtube_video_id, domain_id, source_type)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `, [slug, title, youtubeUrl || null, youtubeVideoId || null, domainId || null, sourceType || 'youtube']);

  return findById(rows[0].id);
};

const update = async (id, fields) => {
  const allowed = ['title', 'youtube_url', 'youtube_video_id', 'domain_id', 'source_type'];
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
    `UPDATE videos SET ${sets.join(', ')} WHERE id = $${paramIndex}`, values
  );
  return findById(id);
};

const archive = async (id) => {
  await pool.query('UPDATE videos SET archived = true WHERE id = $1', [id]);
};

module.exports = { findAll, findById, findBySlug, create, update, archive };
