import express from 'express'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/posts
// @desc    Get user posts
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      posts: [],
      message: 'Posts endpoint ready'
    })
  } catch (error) {
    console.error('Get posts error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error getting posts'
    })
  }
})

export default router
