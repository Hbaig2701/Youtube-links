const app = require('../server/src/app');
const migrate = require('../server/src/db/migrate');

let migrated = false;

module.exports = async (req, res) => {
  if (!migrated) {
    await migrate();
    migrated = true;
  }
  return app(req, res);
};
