const fs = require('fs');
const path = require('path');
const db = require('./connection');

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      ran_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const ran = new Set(
    db.prepare('SELECT name FROM _migrations').all().map(r => r.name)
  );

  for (const file of files) {
    if (ran.has(file)) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    db.transaction(() => {
      db.exec(sql);
      db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file);
    })();

    console.log(`Migration applied: ${file}`);
  }
}

module.exports = migrate;
