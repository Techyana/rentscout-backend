// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const usersRoutes = require('./routes/users');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware Setup ---

// Set security-related HTTP response headers
app.use(helmet());

// Compress all responses
app.use(compression());

// Enable CORS (Cross-Origin Resource Sharing)
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3001', 
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Parse incoming JSON requests
app.use(express.json());

// Rate limiter for authentication routes to prevent brute-force attacks
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 20, // Limit each IP to 20 requests per windowMs
	standardHeaders: true, 
	legacyHeaders: false, 
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// --- API Routes ---
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', usersRoutes);

// Simple health check endpoint
app.get('/', (req, res) => {
  res.send(`RentScout API is running... Healthy at ${new Date().toISOString()}`);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Accepting requests from: ${corsOptions.origin}`);
});