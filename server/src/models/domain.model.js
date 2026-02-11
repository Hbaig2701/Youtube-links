const pool = require('../db/connection');

const findAll = async () => {
  const { rows } = await pool.query('SELECT * FROM domains ORDER BY is_default DESC, created_at ASC');
  return rows;
};

const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM domains WHERE id = $1', [id]);
  return rows[0];
};

const findDefault = async () => {
  const { rows } = await pool.query('SELECT * FROM domains WHERE is_default = true');
  return rows[0];
};

const create = async ({ domain, label, isDefault }) => {
  // If setting as default, unset other defaults
  if (isDefault) {
    await pool.query('UPDATE domains SET is_default = false');
  }

  const { rows } = await pool.query(
    'INSERT INTO domains (domain, label, is_default) VALUES ($1, $2, $3) RETURNING id',
    [domain, label, isDefault || false]
  );

  // If this is the first domain, make it default
  const countResult = await pool.query('SELECT COUNT(*) AS c FROM domains');
  if (parseInt(countResult.rows[0].c) === 1) {
    await pool.query('UPDATE domains SET is_default = true WHERE id = $1', [rows[0].id]);
  }

  return findById(rows[0].id);
};

const update = async (id, fields) => {
  if (fields.is_default) {
    await pool.query('UPDATE domains SET is_default = false');
  }

  const sets = [];
  const values = [];
  let paramIndex = 1;

  for (const key of ['domain', 'label', 'is_default']) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = $${paramIndex}`);
      values.push(fields[key]);
      paramIndex++;
    }
  }

  if (sets.length === 0) return findById(id);

  values.push(id);
  await pool.query(`UPDATE domains SET ${sets.join(', ')} WHERE id = $${paramIndex}`, values);
  return findById(id);
};

const remove = async (id) => {
  // Unlink videos using this domain
  await pool.query('UPDATE videos SET domain_id = NULL WHERE domain_id = $1', [id]);
  await pool.query('DELETE FROM domains WHERE id = $1', [id]);
};

module.exports = { findAll, findById, findDefault, create, update, remove };
