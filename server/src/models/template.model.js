const db = require('../db/connection');

const findAll = () => {
  return db.prepare('SELECT * FROM link_templates ORDER BY created_at ASC').all();
};

const findById = (id) => {
  return db.prepare('SELECT * FROM link_templates WHERE id = ?').get(id);
};

const create = ({ label, destinationUrl, isBookingLink }) => {
  const result = db.prepare(
    'INSERT INTO link_templates (label, destination_url, is_booking_link) VALUES (?, ?, ?)'
  ).run(label, destinationUrl, isBookingLink ? 1 : 0);
  return findById(result.lastInsertRowid);
};

const update = (id, fields) => {
  const allowed = ['label', 'destination_url', 'is_booking_link'];
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
  db.prepare(`UPDATE link_templates SET ${sets.join(', ')} WHERE id = ?`).run(...values);
  return findById(id);
};

const remove = (id) => {
  db.prepare('DELETE FROM link_templates WHERE id = ?').run(id);
};

module.exports = { findAll, findById, create, update, remove };
