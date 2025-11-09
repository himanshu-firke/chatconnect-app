import express from 'express'
import passport from 'passport'
import { protect } from '../middleware/auth.js'
import oauthService from '../services/oauthService.js'
const router = express.Router()

// Initialize OAuth strategies - this will run the constructor and set up passport strategies

// Twitter OAuth Routes
router.get('/twitter', protect, (req, res, next) => {
  // Store user in session for callback
  req.session.userId = req.user._id
  passport.authenticate('twitter')(req, res, next)
})

router.get('/twitter/callback', 
  passport.authenticate('twitter', { 
    failureRedirect: '/settings?error=twitter_auth_failed',
    session: false 
  }),
  (req, res) => {
    // Successful authentication
    res.redirect('/settings?success=twitter_connected')
  }
)

// LinkedIn OAuth Routes
router.get('/linkedin', protect, (req, res, next) => {
  req.session.userId = req.user._id
  passport.authenticate('linkedin', { 
    scope: ['r_liteprofile', 'r_emailaddress', 'w_member_social'] 
  })(req, res, next)
})

router.get('/linkedin/callback',
  passport.authenticate('linkedin', { 
    failureRedirect: '/settings?error=linkedin_auth_failed',
    session: false 
  }),
  (req, res) => {
    res.redirect('/settings?success=linkedin_connected')
  }
)

// Instagram OAuth Routes
router.get('/instagram', protect, (req, res, next) => {
  req.session.userId = req.user._id
  passport.authenticate('instagram')(req, res, next)
})

router.get('/instagram/callback',
  passport.authenticate('instagram', { 
    failureRedirect: '/settings?error=instagram_auth_failed',
    session: false 
  }),
  (req, res) => {
    res.redirect('/settings?success=instagram_connected')
  }
)

// Get connected platforms
router.get('/connections', protect, async (req, res) => {
  try {
    const connections = await oauthService.getConnectedPlatforms(req.user._id)
    
    // Filter sensitive information
    const safeConnections = connections.map(conn => ({
      platform: conn.platform,
      username: conn.username,
      displayName: conn.displayName,
      profileImage: conn.profileImage,
      connectedAt: conn.connectedAt,
      isActive: conn.isActive
    }))

    res.json({
      success: true,
      data: safeConnections
    })
  } catch (error) {
    console.error('Error fetching connections:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch connected platforms'
    })
  }
})

// Disconnect a platform
router.delete('/disconnect/:platform', protect, async (req, res) => {
  try {
    const { platform } = req.params
    const validPlatforms = ['twitter', 'linkedin', 'instagram']
    
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid platform'
      })
    }

    await oauthService.disconnectPlatform(req.user._id, platform)
    
    res.json({
      success: true,
      message: `${platform} disconnected successfully`
    })
  } catch (error) {
    console.error('Error disconnecting platform:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect platform'
    })
  }
})

// Check platform connection status
router.get('/status/:platform', protect, async (req, res) => {
  try {
    const { platform } = req.params
    const isConnected = await oauthService.isPlatformConnected(req.user._id, platform)
    
    res.json({
      success: true,
      data: {
        platform,
        connected: isConnected
      }
    })
  } catch (error) {
    console.error('Error checking platform status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to check platform status'
    })
  }
})

// Get available platforms for OAuth
router.get('/platforms', protect, (req, res) => {
  const platforms = [
    {
      id: 'twitter',
      name: 'Twitter',
      description: 'Connect your Twitter account to schedule tweets',
      icon: '🐦',
      color: '#1DA1F2',
      available: !!(process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET)
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Connect your LinkedIn account to schedule professional posts',
      icon: '💼',
      color: '#0077B5',
      available: !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET)
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Connect your Instagram account to schedule posts',
      icon: '📸',
      color: '#E4405F',
      available: !!(process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET)
    }
  ]

  res.json({
    success: true,
    data: platforms
  })
})

export default router
