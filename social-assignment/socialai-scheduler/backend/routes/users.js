import express from 'express'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user.getPublicProfile()
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error getting profile'
    })
  }
})

export default router
