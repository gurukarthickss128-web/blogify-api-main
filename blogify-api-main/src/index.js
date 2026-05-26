// src/index.js

const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/db.js');

// Import routers
const postRouter = require('./routes/posts.routes.js');
const userRouter = require('./routes/users.routes.js');
const authRouter = require('./routes/auth.routes.js');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * =========================
 * Middleware
 * =========================
 */

// Parse JSON request bodies
app.use(express.json());

// Parse cookies
app.use(cookieParser());

/**
 * =========================
 * Database Connection
 * =========================
 */

let dbStatus = 'Disconnected';

connectDB()
  .then(() => {
    dbStatus = 'Connected';
    console.log('✅ MongoDB Connected Successfully');
  })
  .catch((error) => {
    dbStatus = 'Connection Failed';

    console.error('❌ MongoDB Connection Failed');
    console.error(error.message);
  });

/**
 * =========================
 * Root Route
 * =========================
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Blogify API!',
    version: '1.0.0',

    database: {
      status: dbStatus
    },

    endpoints: {
      auth: '/api/v1/auth',
      posts: '/api/v1/posts',
      users: '/api/v1/users'
    }
  });
});

/**
 * =========================
 * Database Health Check
 * =========================
 */
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    databaseStatus: dbStatus,
    timestamp: new Date().toISOString()
  });
});

/**
 * =========================
 * API Routes
 * =========================
 */
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/users', userRouter);

/**
 * =========================
 * 404 Route Handler
 * =========================
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

/**
 * =========================
 * Global Error Handler
 * =========================
 */
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error:
      process.env.NODE_ENV === 'development'
        ? err.stack
        : undefined
  });
});

/**
 * =========================
 * Start Server
 * =========================
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});