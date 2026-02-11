let app, migrate;

try {
  app = require('../server/src/app');
  migrate = require('../server/src/db/migrate');
} catch (err) {
  // If modules fail to load, return the error
  module.exports = (req, res) => {
    res.status(500).json({ error: 'Module load failed', message: err.message, stack: err.stack });
  };
  // Prevent the rest of the file from running
  app = null;
}

if (app) {
  let migrated = false;

  module.exports = async (req, res) => {
    try {
      if (!migrated) {
        await migrate();
        migrated = true;
      }
      return app(req, res);
    } catch (err) {
      res.status(500).json({ error: 'Runtime error', message: err.message, stack: err.stack });
    }
  };
}
