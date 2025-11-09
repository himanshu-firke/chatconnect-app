// Load environment variables FIRST
import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import passport from 'passport'
import session from 'express-session'

// Import routes (after dotenv is loaded)
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import postRoutes from './routes/posts.js'
import aiRoutes from './routes/ai.js'
import socialRoutes from './routes/social.js'
import analyticsRoutes from './routes/analytics.js'
import oauthRoutes from './routes/oauth.js'
import schedulerRoutes from './routes/scheduler.js'
import templateRoutes from './routes/templates.js'

// Debug environment loading
console.log('🔍 Environment Debug:', {
  NODE_ENV: process.env.NODE_ENV,
  GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY ? 'Loaded' : 'Missing',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'Loaded' : 'Missing',
  HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY ? `Loaded (${process.env.HUGGINGFACE_API_KEY.substring(0, 10)}...)` : 'Missing'
})

const app = express()

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

// Session middleware (required for OAuth)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

// Initialize Passport
app.use(passport.initialize())
app.use(passport.session())

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/socialai-scheduler')
  .then(async () => {
    console.log('✅ Connected to MongoDB')
    // Start the post scheduler after DB connection
    try {
      const { default: schedulerService } = await import('./services/schedulerService.js')
      schedulerService.start()
      console.log('✅ Scheduler service started')
    } catch (error) {
      console.error('❌ Scheduler service error:', error)
    }
  })
  .catch((error) => console.error('❌ MongoDB connection error:', error))

// Remove Socket.io for now to simplify installation

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/social', socialRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/oauth', oauthRoutes)
app.use('/api/scheduler', schedulerRoutes)
app.use('/api/templates', templateRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack)
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
})
