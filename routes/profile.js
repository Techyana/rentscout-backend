const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { profileUpdateValidation } = require('../middleware/validation');
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
    
    res.json({ success: true, user: rows[0] });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;