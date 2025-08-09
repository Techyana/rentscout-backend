// config/mailer.js
const nodemailer = require('nodemailer');

// Create a transporter object using Gmail SMTP
// In your .env file, you will need to provide GMAIL_USER and GMAIL_APP_PASS
// GMAIL_APP_PASS is an "App Password" you generate in your Google Account settings, not your regular password.
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.error('Nodemailer configuration error:', error);
  } else {
    console.log('Nodemailer is configured and ready to send emails.');
  }
});

module.exports = transporter;
