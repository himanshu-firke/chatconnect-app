const express = require('express');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateTokens, authenticateToken } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');

const router = express.Router();

// Rate limiting for auth routes (relaxed for development)
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 attempts per window (generous for development)
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' // Skip rate limiting in development
});

// @route   POST /auth/register
// @desc    Register new user
// @access  Public
router.post('/register', authLimiter, validateRegister, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`,
        field
      });
    }

    // Create new user
    const user = new User({ username, email, password });
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isOnline: user.isOnline,
          createdAt: user.createdAt
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /auth/login
// @desc    Login user
// @access  Public
router.post('/login', authLimiter, validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        field: 'email'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        field: 'password'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Update last seen
    await user.updateLastSeen();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isOnline: user.isOnline,
          lastSeen: user.lastSeen
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// @route   GET /auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

// @route   POST /auth/logout
// @desc    Logout user (set offline status)
// @access  Private
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    await req.user.setOnlineStatus(false);
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

// @route   POST /auth/seed-demo-users
// @desc    Seed demo users (REMOVE IN PRODUCTION)
// @access  Public
router.post('/seed-demo-users', async (req, res) => {
  try {
    // Only allow in development or if specific key is provided
    if (process.env.NODE_ENV === 'production' && req.body.seedKey !== 'demo-seed-2025') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const sampleUsers = [
      {
        username: 'alice_demo',
        email: 'alice@chatconnect.demo',
        password: 'password123'
      },
      {
        username: 'bob_demo',
        email: 'bob@chatconnect.demo',
        password: 'password123'
      },
      {
        username: 'charlie_demo',
        email: 'charlie@chatconnect.demo',
        password: 'password123'
      },
      {
        username: 'diana_demo',
        email: 'diana@chatconnect.demo',
        password: 'password123'
      },
      {
        username: 'evan_demo',
        email: 'evan@chatconnect.demo',
        password: 'password123'
      }
    ];

    // Clear existing demo users
    await User.deleteMany({ email: { $regex: '@chatconnect.demo$' } });

    // Create sample users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push({
        id: user._id,
        username: user.username,
        email: user.email
      });
    }

    res.json({
      success: true,
      message: 'Demo users seeded successfully',
      users: createdUsers
    });

  } catch (error) {
    console.error('Seed users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding demo users'
    });
  }
});

module.exports = router;
