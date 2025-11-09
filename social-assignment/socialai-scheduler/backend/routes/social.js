import express from 'express'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/social/accounts
// @desc    Get connected social accounts
// @access  Private
router.get('/accounts', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      accounts: req.user.socialAccounts,
      message: 'Social media OAuth integration coming soon'
    })
  } catch (error) {
    console.error('Get social accounts error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error getting social accounts'
    })
  }
})

export default router
