const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { listingValidation } = require('../middleware/validation');
const { validationResult } = require('express-validator');

/**
 * @route   GET /api/listings
 * @desc    Get all listings, optionally filter by city
 * @access  Public
 */
router.get('/', async (req, res) => {
    const { city } = req.query;
    try {
        let query = `
            SELECT 
                id, user_id AS "userId", address, city, price, bedrooms, bathrooms, description, 
                vibe_tags AS "vibeTags", images, is_active AS "isActive", created_at AS "createdAt"
            FROM listings WHERE is_active = true
        `;
        const values = [];
        if (city) {
            query += ' AND city ILIKE $1';
            values.push(`%${city}%`);
        }
        query += ' ORDER BY created_at DESC';

        const { rows } = await db.query(query, values);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

/**
 * @route   POST /api/listings
 * @desc    Create a new listing
 * @access  Private
 */
router.post('/', [authMiddleware, listingValidation], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { address, city, price, bedrooms, bathrooms, description, vibeTags, images } = req.body;

    try {
        const query = `
            INSERT INTO listings (user_id, address, city, price, bedrooms, bathrooms, description, vibe_tags, images)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, user_id AS "userId", address, city, price, bedrooms, bathrooms, description, vibe_tags AS "vibeTags", images;
        `;
        const values = [userId, address, city, price, bedrooms, bathrooms, description, vibeTags, images];
        const { rows } = await db.query(query, values);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

/**
 * @route   PUT /api/listings/:id
 * @desc    Update a listing
 * @access  Private (Owner only)
 */
router.put('/:id', [authMiddleware, listingValidation], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id: listingId } = req.params;
    const userId = req.user.id;
    const { address, city, price, bedrooms, bathrooms, description, vibeTags, images } = req.body;

    try {
        // First, verify the user owns the listing
        const ownerCheck = await db.query('SELECT user_id FROM listings WHERE id = $1', [listingId]);
        if (ownerCheck.rows.length === 0) {
            return res.status(404).json({ msg: 'Listing not found' });
        }
        if (ownerCheck.rows[0].user_id !== userId) {
            return res.status(403).json({ msg: 'User not authorized to edit this listing' });
        }

        const query = `
            UPDATE listings
            SET address = $1, city = $2, price = $3, bedrooms = $4, bathrooms = $5, description = $6, vibe_tags = $7, images = $8, updated_at = NOW()
            WHERE id = $9
            RETURNING id, user_id AS "userId", address, city, price, bedrooms, bathrooms, description, vibe_tags AS "vibeTags", images;
        `;
        const values = [address, city, price, bedrooms, bathrooms, description, vibeTags, images, listingId];
        const { rows } = await db.query(query, values);
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

/**
 * @route   DELETE /api/listings/:id
 * @desc    Delete a listing
 * @access  Private (Owner only)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id: listingId } = req.params;
    const userId = req.user.id;

    try {
        const ownerCheck = await db.query('SELECT user_id FROM listings WHERE id = $1', [listingId]);
        if (ownerCheck.rows.length === 0) {
            return res.status(404).json({ msg: 'Listing not found' });
        }
        if (ownerCheck.rows[0].user_id !== userId) {
            return res.status(403).json({ msg: 'User not authorized to delete this listing' });
        }

        await db.query('DELETE FROM listings WHERE id = $1', [listingId]);
        res.json({ success: true, msg: 'Listing deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;