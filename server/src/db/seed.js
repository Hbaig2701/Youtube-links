require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const pool = require('./connection');
const migrate = require('./migrate');
const crypto = require('crypto');

async function seed() {
  await migrate();

  // Clear existing data
  await pool.query('DELETE FROM clicks');
  await pool.query('DELETE FROM bookings');
  await pool.query('DELETE FROM links');
  await pool.query('DELETE FROM videos');

  const videos = [
    { slug: 'tax-tips-2025', title: 'Top 10 Tax Tips for 2025', youtube_url: 'https://youtube.com/watch?v=abc123', youtube_video_id: 'abc123' },
    { slug: 'llc-vs-s-corp', title: 'LLC vs S-Corp: Which is Right for You?', youtube_url: 'https://youtube.com/watch?v=def456', youtube_video_id: 'def456' },
    { slug: 'passive-income', title: '5 Passive Income Strategies That Actually Work', youtube_url: 'https://youtube.com/watch?v=ghi789', youtube_video_id: 'ghi789' },
    { slug: 'bookkeeping-basics', title: 'Bookkeeping Basics for Small Business Owners', youtube_url: 'https://youtube.com/watch?v=jkl012', youtube_video_id: 'jkl012' },
    { slug: 'retirement-guide', title: 'Complete Retirement Planning Guide', youtube_url: 'https://youtube.com/watch?v=mno345', youtube_video_id: 'mno345' },
  ];

  for (const v of videos) {
    await pool.query(
      'INSERT INTO videos (slug, title, youtube_url, youtube_video_id) VALUES ($1, $2, $3, $4)',
      [v.slug, v.title, v.youtube_url, v.youtube_video_id]
    );
  }

  const { rows: videoRows } = await pool.query('SELECT * FROM videos');
  const videoMap = {};
  for (const v of videoRows) videoMap[v.slug] = v.id;

  const linkTemplates = [
    { label: 'book-a-call', destination_url: 'https://calendly.com/example/30min', is_booking_link: true },
    { label: 'free-guide', destination_url: 'https://example.com/free-guide', is_booking_link: false },
    { label: 'course', destination_url: 'https://example.com/course', is_booking_link: false },
    { label: 'newsletter', destination_url: 'https://example.com/newsletter', is_booking_link: false },
  ];

  for (const v of videoRows) {
    const numLinks = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numLinks && i < linkTemplates.length; i++) {
      const t = linkTemplates[i];
      await pool.query(
        'INSERT INTO links (video_id, label, destination_url, is_booking_link) VALUES ($1, $2, $3, $4)',
        [v.id, t.label, t.destination_url, t.is_booking_link]
      );
    }
  }

  const { rows: linkRows } = await pool.query('SELECT * FROM links');

  // Generate clicks spread over the last 30 days
  const countries = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IN', 'BR', 'JP', 'MX'];
  const cities = ['New York', 'London', 'Toronto', 'Sydney', 'Berlin', 'Paris', 'Mumbai', 'Sao Paulo', 'Tokyo', 'Mexico City'];
  const devices = ['desktop', 'mobile', 'mobile', 'mobile', 'tablet'];
  const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Samsung Internet'];
  const oses = ['Windows', 'macOS', 'iOS', 'Android', 'Linux'];

  const now = Date.now();

  for (let i = 0; i < 200; i++) {
    const link = linkRows[Math.floor(Math.random() * linkRows.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const clickTime = new Date(now - daysAgo * 86400000 - hoursAgo * 3600000);
    const geoIdx = Math.floor(Math.random() * countries.length);

    await pool.query(
      `INSERT INTO clicks (link_id, clicked_at, ip_hash, country, city, device_type, browser, os, referrer, session_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        link.id,
        clickTime.toISOString(),
        crypto.randomBytes(16).toString('hex'),
        countries[geoIdx],
        cities[geoIdx],
        devices[Math.floor(Math.random() * devices.length)],
        browsers[Math.floor(Math.random() * browsers.length)],
        oses[Math.floor(Math.random() * oses.length)],
        'https://www.youtube.com',
        crypto.randomUUID(),
      ]
    );
  }

  console.log(`Seeded: ${videoRows.length} videos, ${linkRows.length} links, 200 clicks`);
  await pool.end();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
