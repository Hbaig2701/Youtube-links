const db = require('../db/connection');

const create = (data) => {
  return db.prepare(`
    INSERT INTO clicks (link_id, ip_hash, country, city, device_type, browser, os, referrer, session_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.linkId,
    data.ipHash,
    data.country,
    data.city,
    data.deviceType,
    data.browser,
    data.os,
    data.referrer,
    data.sessionId
  );
};

const getSummary = () => {
  return db.prepare(`
    SELECT
      COUNT(*) AS total_all_time,
      SUM(CASE WHEN clicked_at >= datetime('now', '-7 days') THEN 1 ELSE 0 END) AS total_7d,
      SUM(CASE WHEN clicked_at >= datetime('now', '-30 days') THEN 1 ELSE 0 END) AS total_30d
    FROM clicks c
    JOIN links l ON l.id = c.link_id
    JOIN videos v ON v.id = l.video_id
    WHERE v.archived = 0 AND l.active = 1
  `).get();
};

const getClicksOverTime = (range = '7d') => {
  const rangeMap = {
    '7d': '-7 days',
    '30d': '-30 days',
    '90d': '-90 days',
    'all': '-100 years',
  };
  const offset = rangeMap[range] || rangeMap['7d'];

  return db.prepare(`
    SELECT date(clicked_at) AS date, COUNT(*) AS count
    FROM clicks c
    JOIN links l ON l.id = c.link_id
    JOIN videos v ON v.id = l.video_id
    WHERE v.archived = 0 AND l.active = 1
      AND clicked_at >= datetime('now', ?)
    GROUP BY date(clicked_at)
    ORDER BY date(clicked_at) ASC
  `).all(offset);
};

const getByVideoId = (videoId, range = '30d') => {
  const rangeMap = {
    '7d': '-7 days',
    '30d': '-30 days',
    '90d': '-90 days',
    'all': '-100 years',
  };
  const offset = rangeMap[range] || rangeMap['30d'];

  return db.prepare(`
    SELECT date(c.clicked_at) AS date, COUNT(*) AS count
    FROM clicks c
    JOIN links l ON l.id = c.link_id
    WHERE l.video_id = ? AND l.active = 1
      AND c.clicked_at >= datetime('now', ?)
    GROUP BY date(c.clicked_at)
    ORDER BY date(c.clicked_at) ASC
  `).all(videoId, offset);
};

const getDeviceBreakdown = (videoId) => {
  if (videoId) {
    return db.prepare(`
      SELECT device_type, COUNT(*) AS count
      FROM clicks c
      JOIN links l ON l.id = c.link_id
      WHERE l.video_id = ? AND l.active = 1
      GROUP BY device_type
      ORDER BY count DESC
    `).all(videoId);
  }
  return db.prepare(`
    SELECT device_type, COUNT(*) AS count
    FROM clicks c
    JOIN links l ON l.id = c.link_id
    JOIN videos v ON v.id = l.video_id
    WHERE v.archived = 0 AND l.active = 1
    GROUP BY device_type
    ORDER BY count DESC
  `).all();
};

const getGeoBreakdown = (videoId) => {
  if (videoId) {
    return db.prepare(`
      SELECT country, COUNT(*) AS count
      FROM clicks c
      JOIN links l ON l.id = c.link_id
      WHERE l.video_id = ? AND l.active = 1 AND country IS NOT NULL
      GROUP BY country
      ORDER BY count DESC
      LIMIT 20
    `).all(videoId);
  }
  return db.prepare(`
    SELECT country, COUNT(*) AS count
    FROM clicks c
    JOIN links l ON l.id = c.link_id
    JOIN videos v ON v.id = l.video_id
    WHERE v.archived = 0 AND l.active = 1 AND country IS NOT NULL
    GROUP BY country
    ORDER BY count DESC
    LIMIT 20
  `).all();
};

const getTopVideos = (limit = 10) => {
  return db.prepare(`
    SELECT v.id, v.slug, v.title, v.created_at,
           COUNT(DISTINCT l.id) AS link_count,
           COUNT(c.id) AS total_clicks
    FROM videos v
    LEFT JOIN links l ON l.video_id = v.id AND l.active = 1
    LEFT JOIN clicks c ON c.link_id = l.id
    WHERE v.archived = 0
    GROUP BY v.id
    ORDER BY total_clicks DESC
    LIMIT ?
  `).all(limit);
};

const getRecentActivity = (limit = 20) => {
  return db.prepare(`
    SELECT c.*, l.label, l.destination_url, v.title AS video_title, v.slug AS video_slug, v.id AS video_id
    FROM clicks c
    JOIN links l ON l.id = c.link_id
    JOIN videos v ON v.id = l.video_id
    WHERE v.archived = 0
    ORDER BY c.clicked_at DESC
    LIMIT ?
  `).all(limit);
};

module.exports = {
  create,
  getSummary,
  getClicksOverTime,
  getByVideoId,
  getDeviceBreakdown,
  getGeoBreakdown,
  getTopVideos,
  getRecentActivity,
};
