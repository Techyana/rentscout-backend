// utils/dbSetup.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const setup = async () => {
  console.log('Starting database setup...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const client = await pool.connect();
  console.log('Connected to PostgreSQL database!');

  try {
    const sql = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8');
    console.log('Executing schema.sql...');
    await client.query(sql);
    console.log('Database schema applied successfully!');
  } catch (err) {
    console.error('Error during database setup:', err);
    throw err;
  } finally {
    await client.release();
    await pool.end();
    console.log('Database connection closed.');
  }
};

// This allows the script to be run from the command line
if (require.main === module) {
  setup().catch(e => {
    console.error('Failed to setup database:', e);
    process.exit(1);
  });
}

module.exports = setup;
