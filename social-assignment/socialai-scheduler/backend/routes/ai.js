import express from 'express'
import aiService from '../services/aiService.js'
import llamaService from '../services/llamaService.js'
import imageService from '../services/imageService.js'
import { protect } from '../middleware/auth.js'
import { body, validationResult } from 'express-validator'

const router = express.Router()

// @route   GET /api/ai/tones
// @desc    Get available content tones
// @access  Private
router.get('/tones', protect, async (req, res) => {
  try {
    const tones = [
      { id: 'professional', name: 'Professional', description: 'Formal, business-appropriate language' },
      { id: 'friendly', name: 'Friendly', description: 'Warm, approachable, and conversational' },
      { id: 'funny', name: 'Funny', description: 'Humorous and entertaining' },
      { id: 'formal', name: 'Formal', description: 'Very formal and structured' },
      { id: 'casual', name: 'Casual', description: 'Relaxed and informal' }
    ]
    
    res.json({
      success: true,
      data: tones
    })
  } catch (error) {
    console.error('Error fetching tones:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tones'
    })
  }
})

// @route   GET /api/ai/platforms
// @desc    Get available social media platforms
// @access  Private
router.get('/platforms', protect, async (req, res) => {
  try {
    const platforms = [
      { id: 'twitter', name: 'Twitter', icon: '🐦', characterLimit: 280 },
      { id: 'linkedin', name: 'LinkedIn', icon: '💼', characterLimit: 3000 },
      { id: 'instagram', name: 'Instagram', icon: '📸', characterLimit: 2200 }
    ]
    
    res.json({
      success: true,
      data: platforms
    })
  } catch (error) {
    console.error('Error fetching platforms:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platforms'
    })
  }
})

// @route   POST /api/ai/generate
// @desc    Generate AI content with Gemini
// @access  Private
router.post('/generate', protect, [
  body('prompt')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Prompt must be between 5 and 500 characters'),
  body('tone')
    .optional()
    .isIn(['professional', 'friendly', 'funny', 'formal', 'casual'])
    .withMessage('Invalid tone selected'),
  body('platforms')
    .optional()
    .isArray()
    .withMessage('Platforms must be an array'),
  body('contentType')
    .optional()
    .isIn(['text', 'image+text', 'video+text'])
    .withMessage('Invalid content type')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const {
      prompt,
      tone = 'friendly',
      platforms = ['twitter', 'linkedin'],
      contentType = 'text',
      context = {}
    } = req.body

    // Import AI service after environment variables are loaded
    const { default: aiService } = await import('../services/aiService.js')
    
    // Generate content using AI service
    const result = await aiService.generateContent(prompt, {
      tone,
      platforms,
      contentType,
      context: {
        ...context,
        userId: req.user._id
      }
    })

    if (result.success) {
      res.json({
        success: true,
        data: result.content,
        message: 'Content generated successfully'
      })
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
        fallback: result.fallback
      })
    }
  } catch (error) {
    console.error('AI generation error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error generating AI content'
    })
  }
})

// @route   POST /api/ai/analyze
// @desc    Analyze content performance potential
// @access  Private
router.post('/analyze', protect, [
  body('content')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Content must be between 10 and 2000 characters'),
  body('platforms')
    .optional()
    .isArray()
    .withMessage('Platforms must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { content, platforms = ['twitter', 'linkedin'] } = req.body

    const analysis = await aiService.analyzeContentPotential(content, platforms)

    res.json({
      success: true,
      data: analysis,
      message: 'Content analyzed successfully'
    })
  } catch (error) {
    console.error('Content analysis error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error analyzing content'
    })
  }
})

// @route   GET /api/ai/tones
// @desc    Get available content tones
// @access  Private
router.get('/tones', protect, (req, res) => {
  try {
    const tones = Object.entries(aiService.constructor.TONES).map(([key, value]) => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      description: value.description
    }))

    res.json({
      success: true,
      data: tones,
      message: 'Available tones retrieved successfully'
    })
  } catch (error) {
    console.error('Get tones error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error retrieving tones'
    })
  }
})

// @route   GET /api/ai/platforms
// @desc    Get supported platforms and their limits
// @access  Private
router.get('/platforms', protect, (req, res) => {
  try {
    const platforms = Object.entries(aiService.constructor.PLATFORM_LIMITS).map(([key, limit]) => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      characterLimit: limit,
      features: getPlatformFeatures(key)
    }))

    res.json({
      success: true,
      data: platforms,
      message: 'Supported platforms retrieved successfully'
    })
  } catch (error) {
    console.error('Get platforms error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error retrieving platforms'
    })
  }
})

// Helper function to get platform-specific features
function getPlatformFeatures(platform) {
  const features = {
    twitter: ['hashtags', 'mentions', 'threads', 'polls'],
    linkedin: ['hashtags', 'mentions', 'articles', 'polls'],
    instagram: ['hashtags', 'mentions', 'stories', 'reels']
  }
  return features[platform] || []
}

// @route   POST /api/ai/generate-llama
// @desc    Generate content using LLaMA
// @access  Private
router.post('/generate-llama', protect, [
  body('prompt')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Prompt must be between 1 and 1000 characters'),
  body('tone')
    .optional()
    .isIn(['professional', 'friendly', 'funny', 'formal', 'casual'])
    .withMessage('Invalid tone'),
  body('platforms')
    .optional()
    .isArray()
    .withMessage('Platforms must be an array'),
  body('platforms.*')
    .optional()
    .isIn(['twitter', 'linkedin', 'instagram'])
    .withMessage('Invalid platform')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { prompt, tone = 'professional', platforms = ['twitter'], llamaProvider, ...options } = req.body

    console.log(`🦙 LLaMA content generation request:`, { prompt: prompt.substring(0, 50), tone, platforms, llamaProvider })

    const result = await llamaService.generateContent(prompt, {
      tone,
      platforms,
      llamaProvider,
      ...options
    })

    if (result.success) {
      res.json({
        success: true,
        data: result.content,
        provider: 'llama'
      })
    } else {
      res.status(500).json({
        success: false,
        message: result.error || 'Failed to generate content with LLaMA',
        provider: 'llama'
      })
    }
  } catch (error) {
    console.error('LLaMA generation error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during LLaMA content generation'
    })
  }
})

// @route   GET /api/ai/llama-status
// @desc    Get LLaMA service status
// @access  Private
router.get('/llama-status', protect, async (req, res) => {
  try {
    const status = await llamaService.getStatus()
    res.json({
      success: true,
      data: status
    })
  } catch (error) {
    console.error('Error getting LLaMA status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get LLaMA status'
    })
  }
})

// @route   POST /api/ai/switch-provider
// @desc    Switch AI provider (for LLaMA)
// @access  Private
router.post('/switch-provider', protect, [
  body('provider')
    .isIn(['gemini', 'llama', 'openai'])
    .withMessage('Invalid provider'),
  body('llamaProvider')
    .optional()
    .isIn(['ollama', 'huggingface', 'replicate', 'together'])
    .withMessage('Invalid LLaMA provider')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { provider, llamaProvider } = req.body

    if (provider === 'llama' && llamaProvider) {
      const switched = llamaService.switchProvider(llamaProvider)
      if (switched) {
        res.json({
          success: true,
          message: `Switched to LLaMA provider: ${llamaProvider}`,
          currentProvider: llamaProvider
        })
      } else {
        res.status(400).json({
          success: false,
          message: `LLaMA provider ${llamaProvider} is not available`
        })
      }
    } else {
      res.json({
        success: true,
        message: `AI provider set to: ${provider}`,
        currentProvider: provider
      })
    }
  } catch (error) {
    console.error('Error switching provider:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to switch provider'
    })
  }
})

// @route   POST /api/ai/test-llama
// @desc    Test LLaMA without authentication (for debugging)
// @access  Public
router.post('/test-llama', async (req, res) => {
  try {
    console.log('🧪 Testing LLaMA without auth...')
    
    const result = await llamaService.generateContent('Hello world test', {
      tone: 'friendly',
      platforms: ['twitter']
    })
    
    res.json({
      success: true,
      data: result,
      message: 'LLaMA test successful'
    })
  } catch (error) {
    console.error('LLaMA test error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

// @route   POST /api/ai/generate-image
// @desc    Generate image using AI
// @access  Private
router.post('/generate-image', protect, [
  body('prompt')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Prompt must be between 1 and 500 characters'),
  body('style')
    .optional()
    .isIn(['realistic', 'artistic', 'cartoon', 'minimalist', 'vintage', 'futuristic'])
    .withMessage('Invalid style'),
  body('size')
    .optional()
    .isIn(['1024x1024', '1792x1024', '1024x1792'])
    .withMessage('Invalid size')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { prompt, style = 'realistic', size = '1024x1024', quality = 'standard' } = req.body

    console.log(`🎨 Image generation request:`, { prompt: prompt.substring(0, 50), style, size })

    const result = await imageService.generateImage(prompt, {
      style,
      size,
      quality
    })

    if (result.success) {
      res.json({
        success: true,
        data: result,
        provider: result.provider
      })
    } else {
      res.status(500).json({
        success: false,
        message: result.error || 'Failed to generate image',
        provider: result.provider
      })
    }
  } catch (error) {
    console.error('Image generation error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during image generation'
    })
  }
})

// @route   GET /api/ai/image-styles
// @desc    Get available image styles
// @access  Private
router.get('/image-styles', protect, async (req, res) => {
  try {
    const styles = imageService.getAvailableStyles()
    res.json({
      success: true,
      data: styles
    })
  } catch (error) {
    console.error('Error fetching image styles:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch image styles'
    })
  }
})

// @route   GET /api/ai/image-sizes
// @desc    Get available image sizes
// @access  Private
router.get('/image-sizes', protect, async (req, res) => {
  try {
    const sizes = imageService.getAvailableSizes()
    res.json({
      success: true,
      data: sizes
    })
  } catch (error) {
    console.error('Error fetching image sizes:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch image sizes'
    })
  }
})

// @route   GET /api/ai/image-status
// @desc    Get image service status
// @access  Private
router.get('/image-status', protect, async (req, res) => {
  try {
    const status = imageService.getStatus()
    res.json({
      success: true,
      data: status
    })
  } catch (error) {
    console.error('Error fetching image status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch image status'
    })
  }
})

export default router
