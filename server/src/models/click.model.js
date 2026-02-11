const pool = require('../db/connection');

const create = async (data) => {
  await pool.query(`
    INSERT INTO clicks (link_id, ip_hash, country, city, device_type, browser, os, referrer, session_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [
    data.linkId,
    data.ipHash,
    data.country,
    data.city,
    data.deviceType,
    data.browser,
    data.os,
    data.referrer,
    data.sessionId,
  ]);
};

const getSummary = async () => {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*) AS total_all_time,
      SUM(CASE WHEN clicked_at >= NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END) AS total_7d,
      SUM(CASE WHEN clicked_at >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) AS total_30d
    FROM clicks c
    JOIN links l ON l.id = c.link_id
    JOIN videos v ON v.id = l.video_id
    WHERE v.archived = false AND l.active = true
  `);
  return rows[0];
};

const getClicksOverTime = async (range = '7d', { startDate, endDate } = {}) => {
  if (startDate && endDate) {
    const { rows } = await pool.query(`
      SELECT clicked_at::date AS date, COUNT(*) AS count
      FROM clicks c
      JOIN links l ON l.id = c.link_id
      JOIN videos v ON v.id = l.video_id
      WHERE v.archived = false AND l.active = true
        AND clicked_at >= $1::date AND clicked_at < ($2::date + INTERVAL '1 day')
      GROUP BY clicked_at::date
      ORDER BY clicked_at::date ASC
    `, [startDate, endDate]);
    return rows;
  }

  if (range === 'today') {
    const { rows } = await pool.query(`
      SELECT clicked_at::date AS date, COUNT(*) AS count
      FROM clicks c
      JOIN links l ON l.id = c.link_id
      JOIN videos v ON v.id = l.video_id
      WHERE v.archived = false AND l.active = true
        AND clicked_at >= CURRENT_DATE
      GROUP BY clicked_at::date
      ORDER BY clicked_at::date ASC
    `);
    return rows;
  }

  const rangeMap = {
    '7d': "7 days",
    '30d': "30 days",
    '90d': "90 days",
    'all': "100 years",
  };
  const interval = rangeMap[range] || rangeMap['7d'];

  const { rows } = await pool.query(`
    SELECT clicked_at::date AS date, COUNT(*) AS count
    FROM clicks c
    JOIN links l ON l.id = c.link_id
    JOIN videos v ON v.id = l.video_id
    WHERE v.archived = false AND l.active = true
      AND clicked_at >= NOW() - $1::interval
    GROUP BY clicked_at::date
    ORDER BY clicked_at::date ASC
  `, [interval]);
  return rows;
};

const getByVideoId = async (videoId, range = '30d', { startDate, endDate, linkId } = {}) => {
  const conditions = ['l.video_id = $1', 'l.active = true'];
  const params = [videoId];
  let idx = 2;

  if (linkId) {
    conditions.push(`c.link_id = $${idx}`);
    params.push(linkId);
    idx++;
  }

  if (startDate && endDate) {
    conditions.push(`c.clicked_at >= $${idx}::date`);
    params.push(startDate);
    idx++;
    conditions.push(`c.clicked_at < ($${idx}::date + INTERVAL '1 day')`);
    params.push(endDate);
    idx++;
  } else if (range === 'today') {
    conditions.push('c.clicked_at >= CURRENT_DATE');
  } else {
    const rangeMap = {
      '7d': "7 days",
      '30d': "30 days",
      '90d': "90 days",
      'all': "100 years",
    };
    const interval = rangeMap[range] || rangeMap['30d'];
    conditions.push(`c.clicked_at >= NOW() - $${idx}::interval`);
    params.push(interval);
    idx++;
  }

  const { rows } = await pool.query(`
    SELECT c.clicked_at::date AS date, COUNT(*) AS count
    FROM clicks c
    JOIN links l ON l.id = c.link_id
    WHERE ${conditions.join(' AND ')}
    GROUP BY c.clicked_at::date
    ORDER BY c.clicked_at::date ASC
  `, params);
  return rows;
};

const getDeviceBreakdown = async (videoId) => {
  if (videoId) {
    const { rows } = await pool.query(`
      SELECT device_type, COUNT(*) AS count
      FROM clicks c
      JOIN links l ON l.id = c.link_id
      WHERE l.video_id = $1 AND l.active = true
      GROUP BY device_type
      ORDER BY count DESC
    `, [videoId]);
    return rows;
  }
  const { rows } = await pool.query(`
    SELECT device_type, COUNT(*) AS count
    FROM clicks c
    JOIN links l ON l.id = c.link_id
    JOIN videos v ON v.id = l.video_id
    WHERE v.archived = false AND l.active = true
    GROUP BY device_type
    ORDER BY count DESC
  `);
  return rows;
};

const getGeoBreakdown = async (videoId) => {
  if (videoId) {
    const { rows } = await pool.query(`
      SELECT country, COUNT(*) AS count
      FROM clicks c
      JOIN links l ON l.id = c.link_id
      WHERE l.video_id = $1 AND l.active = true AND country IS NOT NULL
      GROUP BY country
      ORDER BY count DESC
      LIMIT 20
    `, [videoId]);
    return rows;
  }
  const { rows } = await pool.query(`
    SELECT country, COUNT(*) AS count
    FROM clicks c
    JOIN links l ON l.id = c.link_id
    JOIN videos v ON v.id = l.video_id
    WHERE v.archived = false AND l.active = true AND country IS NOT NULL
    GROUP BY country
    ORDER BY count DESC
    LIMIT 20
  `);
  return rows;
};

const getTopVideos = async (limit = 10) => {
  const { rows } = await pool.query(`
    SELECT v.id, v.slug, v.title, v.created_at, v.source_type,
           COUNT(DISTINCT l.id) AS link_count,
           COUNT(c.id) AS total_clicks
    FROM videos v
    LEFT JOIN links l ON l.video_id = v.id AND l.active = true
    LEFT JOIN clicks c ON c.link_id = l.id
    WHERE v.archived = false
    GROUP BY v.id
    ORDER BY total_clicks DESC
    LIMIT $1
  `, [limit]);
  return rows;
};

const getRecentActivity = async (limit = 20) => {
  const { rows } = await pool.query(`
    SELECT c.*, l.label, l.destination_url, v.title AS video_title, v.slug AS video_slug, v.id AS video_id
    FROM clicks c
    JOIN links l ON l.id = c.link_id
    JOIN videos v ON v.id = l.video_id
    WHERE v.archived = false
    ORDER BY c.clicked_at DESC
    LIMIT $1
  `, [limit]);
  return rows;
};

const getByLinkId = async (linkId) => {
  const { rows } = await pool.query(
    'SELECT * FROM clicks WHERE link_id = $1 ORDER BY clicked_at DESC LIMIT 20',
    [linkId]
  );
  return rows;
};

const deleteByLinkId = async (linkId) => {
  await pool.query('DELETE FROM clicks WHERE link_id = $1', [linkId]);
};

module.exports = {
  create,
  getByLinkId,
  deleteByLinkId,
  getSummary,
  getClicksOverTime,
  getByVideoId,
  getDeviceBreakdown,
  getGeoBreakdown,
  getTopVideos,
  getRecentActivity,
};
