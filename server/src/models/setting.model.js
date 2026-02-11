const pool = require('../db/connection');

const get = async (key) => {
  const { rows } = await pool.query('SELECT value FROM settings WHERE key = $1', [key]);
  return rows[0] ? rows[0].value : null;
};

const set = async (key, value) => {
  await pool.query(
    'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
    [key, value]
  );
};

const getAll = async () => {
  const { rows } = await pool.query('SELECT * FROM settings');
  const result = {};
  for (const row of rows) result[row.key] = row.value;
  return result;
};

module.exports = { get, set, getAll };
