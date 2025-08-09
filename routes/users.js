const express = require('express');
const router = express.Router();
const db = require('../config/db');
const mailer = require('../config/mailer');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

/**
 * @route   POST /api/users/connect
 * @desc    Send a connection request to another user
 * @access  Private
 */
router.post('/connect', async (req, res) => {
  const requester_id = req.user.id;
  const { targetUserId: recipient_id } = req.body;

  if (!recipient_id) {
    return res.status(400).json({ msg: 'Target user ID is required' });
  }

  if (requester_id === recipient_id) {
      return res.status(400).json({ msg: 'You cannot connect with yourself' });
  }

  try {
    // Check for existing connection
    const existingConnection = await db.query(
      'SELECT * FROM connections WHERE (requester_id = $1 AND recipient_id = $2) OR (requester_id = $2 AND recipient_id = $1)',
      [requester_id, recipient_id]
    );

    if (existingConnection.rows.length > 0) {
      return res.status(400).json({ msg: 'A connection or request already exists with this user.' });
    }

    // Fetch sender's name and target user's email
    const senderResult = await db.query('SELECT name FROM users WHERE id = $1', [requester_id]);
    const recipientResult = await db.query('SELECT email FROM users WHERE id = $1', [recipient_id]);

    if (recipientResult.rows.length === 0) {
        return res.status(404).json({ msg: 'Target user not found' });
    }

    const senderName = senderResult.rows[0].name;
    const recipientEmail = recipientResult.rows[0].email;
    
    // Create connection in DB
    await db.query(
        'INSERT INTO connections (requester_id, recipient_id) VALUES ($1, $2)',
        [requester_id, recipient_id]
    );

    // Send email using Nodemailer (fire and forget)
    mailer.sendMail({
        from: `"RentScout" <${process.env.GMAIL_USER}>`,
        to: recipientEmail,
        subject: `You have a new connection request on RentScout!`,
        text: `${senderName} wants to connect with you on RentScout. Log in to view their profile and respond!`,
        html: `<p><b>${senderName}</b> wants to connect with you on RentScout. Log in to view their profile and respond!</p>`
    }).catch(err => console.error('Failed to send connection email:', err));

    res.json({ success: true, message: `Connection request sent` });

  } catch (err) {
    console.error(err.message);
    if(err.code === '23503') { // foreign key violation
        return res.status(404).json({ msg: 'One of the users does not exist.' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;