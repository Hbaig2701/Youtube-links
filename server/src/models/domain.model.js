const db = require('../db/connection');

const findAll = () => {
  return db.prepare('SELECT * FROM domains ORDER BY is_default DESC, created_at ASC').all();
};

const findById = (id) => {
  return db.prepare('SELECT * FROM domains WHERE id = ?').get(id);
};

const findDefault = () => {
  return db.prepare('SELECT * FROM domains WHERE is_default = 1').get();
};

const create = ({ domain, label, isDefault }) => {
  // If setting as default, unset other defaults
  if (isDefault) {
    db.prepare('UPDATE domains SET is_default = 0').run();
  }

  const result = db.prepare(
    'INSERT INTO domains (domain, label, is_default) VALUES (?, ?, ?)'
  ).run(domain, label, isDefault ? 1 : 0);

  // If this is the first domain, make it default
  const count = db.prepare('SELECT COUNT(*) AS c FROM domains').get().c;
  if (count === 1) {
    db.prepare('UPDATE domains SET is_default = 1 WHERE id = ?').run(result.lastInsertRowid);
  }

  return findById(result.lastInsertRowid);
};

const update = (id, fields) => {
  if (fields.is_default) {
    db.prepare('UPDATE domains SET is_default = 0').run();
  }

  const sets = [];
  const values = [];

  for (const key of ['domain', 'label', 'is_default']) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = ?`);
      values.push(key === 'is_default' ? (fields[key] ? 1 : 0) : fields[key]);
    }
  }

  if (sets.length === 0) return findById(id);

  values.push(id);
  db.prepare(`UPDATE domains SET ${sets.join(', ')} WHERE id = ?`).run(...values);
  return findById(id);
};

const remove = (id) => {
  // Unlink videos using this domain
  db.prepare('UPDATE videos SET domain_id = NULL WHERE domain_id = ?').run(id);
  db.prepare('DELETE FROM domains WHERE id = ?').run(id);
};

module.exports = { findAll, findById, findDefault, create, update, remove };
