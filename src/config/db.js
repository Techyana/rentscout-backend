// config/db.js
const { Pool } = require('pg');

// The Pool will use the environment variables for connection details.
// Make sure you have PGUSER, PGHOST, PGDATABASE, PGPASSWORD, and PGPORT set in your .env file.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Recommended settings for production environment
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database!');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
