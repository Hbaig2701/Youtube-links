require('dotenv').config();
const app = require('./app');
const migrate = require('./db/migrate');

async function start() {
  await migrate();

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
