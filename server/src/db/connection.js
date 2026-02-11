const Database = require('better-sqlite3');
const path = require('path');

const serverRoot = path.join(__dirname, '../..');
const dbPath = process.env.DATABASE_PATH
  ? path.resolve(serverRoot, process.env.DATABASE_PATH)
  : path.join(serverRoot, 'data/tracker.db');

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

module.exports = db;
