require('dotenv').config();
const app = require('./app');
const migrate = require('./db/migrate');

migrate();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
