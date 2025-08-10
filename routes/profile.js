const express = require('express');
const router = express.Router();
const db = require('../src/config/db');
const authMiddleware = require('../src/middleware/auth');
const { profileUpdateValidation } = require('../src/middleware/validation');
const { validationResult } = require('express-validator');

// Protect all routes in this file
router.use(authMiddleware);

/**
 * @route   PUT /api/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/', profileUpdateValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user.id;
  const { name, age, occupation, status, bio, likes, dislikes } = req.body;

  try {
    const query = `
      UPDATE users
      SET 
        name = $1, 
        age = $2, 
        occupation = $3, 
        status = $4, 
        bio = $5, 
        likes = $6, 
        dislikes = $7,
        updated_at = NOW()
      WHERE id = $8
      RETURNING id, email, name, age, occupation, status, bio, likes, dislikes, rating, past_stays, media_posts, is_premium, followers, following, like_count;
    `;
    
    const values = [name, age, occupation, status, bio, likes, dislikes, userId];
    
    const { rows } = await db.query(query, values);
    
    if (rows.length === 0) {
        return res.status(404).json({ msg: 'User not found' });
    }
    
    // Convert field names to camelCase for the frontend
    const user = {
      id: rows[0].id,
      email: rows[0].email,
      name: rows[0].name,
      age: rows[0].age,
      occupation: rows[0].occupation,
      status: rows[0].status,
      bio: rows[0].bio,
      likes: rows[0].likes,
      dislikes: rows[0].dislikes,
      rating: rows[0].rating,
      pastStays: rows[0].past_stays,
      mediaPosts: rows[0].media_posts,
      isPremium: rows[0].is_premium,
      followers: rows[0].followers,
      following: rows[0].following,
      likeCount: rows[0].like_count
    };


    res.json({ success: true, user });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;