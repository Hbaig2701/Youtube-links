const db = require('../db/connection');

const get = (key) => {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : null;
};

const set = (key, value) => {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
};

const getAll = () => {
  const rows = db.prepare('SELECT * FROM settings').all();
  const result = {};
  for (const row of rows) result[row.key] = row.value;
  return result;
};

module.exports = { get, set, getAll };
