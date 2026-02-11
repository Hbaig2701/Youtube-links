const pool = require('../db/connection');

const findAll = async () => {
  const { rows } = await pool.query('SELECT * FROM link_templates ORDER BY created_at ASC');
  return rows;
};

const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM link_templates WHERE id = $1', [id]);
  return rows[0];
};

const create = async ({ label, destinationUrl, isBookingLink }) => {
  const { rows } = await pool.query(
    'INSERT INTO link_templates (label, destination_url, is_booking_link) VALUES ($1, $2, $3) RETURNING id',
    [label, destinationUrl, isBookingLink || false]
  );
  return findById(rows[0].id);
};

const update = async (id, fields) => {
  const allowed = ['label', 'destination_url', 'is_booking_link'];
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
  await pool.query(`UPDATE link_templates SET ${sets.join(', ')} WHERE id = $${paramIndex}`, values);
  return findById(id);
};

const remove = async (id) => {
  await pool.query('DELETE FROM link_templates WHERE id = $1', [id]);
};

module.exports = { findAll, findById, create, update, remove };
