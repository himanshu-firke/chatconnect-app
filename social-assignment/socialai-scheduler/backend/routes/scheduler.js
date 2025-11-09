import express from 'express'
import { protect } from '../middleware/auth.js'
import schedulerService from '../services/schedulerService.js'
import postingService from '../services/postingService.js'
const router = express.Router()

// Get scheduler status
router.get('/status', protect, (req, res) => {
  try {
    const status = schedulerService.getStatus()
    const health = schedulerService.healthCheck()
    
    res.json({
      success: true,
      data: {
        ...status,
        health
      }
    })
  } catch (error) {
    console.error('Error getting scheduler status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get scheduler status'
    })
  }
})

// Manual trigger for post processing
router.post('/trigger', protect, async (req, res) => {
  try {
    const result = await schedulerService.triggerManualCheck()
    
    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error triggering manual check:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to trigger manual check'
    })
  }
})

// Get posts ready for publishing
router.get('/pending', protect, async (req, res) => {
  try {
    const posts = await postingService.getPostsReadyForPublishing()
    
    res.json({
      success: true,
      data: posts
    })
  } catch (error) {
    console.error('Error getting pending posts:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get pending posts'
    })
  }
})

// Publish a specific post immediately
router.post('/publish/:postId', protect, async (req, res) => {
  try {
    const { postId } = req.params
    const result = await postingService.publishPost(postId)
    
    if (result.success) {
      res.json({
        success: true,
        data: result,
        message: 'Post published successfully'
      })
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'Failed to publish post',
        data: result
      })
    }
  } catch (error) {
    console.error('Error publishing post:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to publish post'
    })
  }
})

// Validate platform connections for a user
router.post('/validate-connections', protect, async (req, res) => {
  try {
    const { platforms } = req.body
    
    if (!platforms || !Array.isArray(platforms)) {
      return res.status(400).json({
        success: false,
        message: 'Platforms array is required'
      })
    }
    
    const result = await postingService.validatePlatformConnections(req.user._id, platforms)
    
    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error validating connections:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to validate platform connections'
    })
  }
})

// Get scheduler health check
router.get('/health', (req, res) => {
  try {
    const health = schedulerService.healthCheck()
    
    res.json({
      success: true,
      data: health
    })
  } catch (error) {
    console.error('Error getting scheduler health:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get scheduler health'
    })
  }
})

export default router
