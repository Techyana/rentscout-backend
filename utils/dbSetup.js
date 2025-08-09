// utils/dbSetup.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const seedDatabase = async (client) => {
  console.log('Seeding database with initial data...');

  // 1. Seed User
  const seedUserId = '00000000-0000-0000-0000-000000000001';
  const email = 'scout@rentscout.app';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);
  
  const mediaPosts = JSON.stringify([
    { id: 'post1', type: 'image', content: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop', caption: 'My cozy living room setup!', likes: 15 },
    { id: 'post2', type: 'text', content: "What's everyone's favorite weekend spot in the city?", caption: 'Looking for recommendations!', likes: 5 },
    { id: 'post3', type: 'image', content: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop', caption: 'Weekend brunch vibes.', likes: 22 }
  ]);
  
  const pastStays = JSON.stringify([
      { place: 'V&A Waterfront, Cape Town', year: 2022 },
      { place: 'Maboneng, Johannesburg', year: 2020 }
  ]);

  const userQuery = `
    INSERT INTO users (id, email, password_hash, name, age, occupation, status, bio, likes, dislikes, rating, past_stays, media_posts, is_premium, followers, following, like_count)
    VALUES ($1, $2, $3, 'Alex Scout', 28, 'App Mascot', 'seeking_team_up', 'I am the first user of RentScout! Here to help you find your perfect match. My hobbies include exploring new places and meeting new people.', '{"cleanliness", "good-vibes", "adventure"}', '{"loud-parties"}', 4.9, $4, $5, true, 134, 42, 589)
    ON CONFLICT (id) DO NOTHING;
  `;
  
  await client.query(userQuery, [seedUserId, email, passwordHash, pastStays, mediaPosts]);
  console.log('Seeded initial user (if not already present).');

  // 2. Seed Listing
  const seedListingId = '00000000-0000-0000-0000-100000000001';
  const listingImages = JSON.stringify([
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop'
  ]);

  const listingQuery = `
    INSERT INTO listings (id, user_id, address, city, price, bedrooms, bathrooms, description, vibe_tags, images)
    VALUES ($1, $2, '123 Sunshine Avenue, The Neighbourhood', 'Cape Town', 12500, 2, 1, 'A beautiful, sun-drenched apartment in the heart of Cape Town. Perfect for a young professional or couple. Comes with a spacious balcony and modern finishes.', '{"modern", "pet-friendly", "great-view"}', $3)
    ON CONFLICT (id) DO NOTHING;
  `;
  await client.query(listingQuery, [seedListingId, seedUserId, listingImages]);
  console.log('Seeded initial listing (if not already present).');
};


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

    await seedDatabase(client);

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