import { GoogleGenerativeAI } from '@google/generative-ai'
import mockAiService from './mockAiService.js'
import openaiService from './openaiService.js'
import llamaService from './llamaService.js'

class AIService {
  constructor() {
    // Support multiple API keys for rotation
    this.apiKeys = [
      process.env.GOOGLE_GEMINI_API_KEY,
      process.env.GEMINI_API_KEY,
      process.env.GOOGLE_GEMINI_API_KEY_2,
      process.env.GOOGLE_GEMINI_API_KEY_3
    ].filter(key => key && key !== 'your-google-gemini-api-key-here' && key !== 'demo-key')
    
    this.currentApiKeyIndex = 0
    this.apiKey = this.apiKeys[0]
    
    console.log('🔍 Debug - API Key check:', {
      GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY ? 'Found' : 'Not found',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'Found' : 'Not found',
      totalApiKeys: this.apiKeys.length,
      finalApiKey: this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'None'
    })
    
    this.useMock = !this.apiKey || this.apiKey === 'your-google-gemini-api-key-here' || this.apiKey === 'demo-key'
    
    if (!this.useMock) {
      try {
        // Initialize with the correct API configuration
        this.genAI = new GoogleGenerativeAI(this.apiKey)
        
        // Try different model names that are currently available (latest API format)
        const availableModels = [
          'gemini-1.5-flash',
          'gemini-1.5-pro',
          'gemini-pro',
          'gemini-1.0-pro-latest',
          'gemini-1.5-flash-latest',
          'gemini-1.5-pro-latest'
        ]
        
        let modelInitialized = false
        for (const modelName of availableModels) {
          try {
            this.model = this.genAI.getGenerativeModel({ model: modelName })
            this.modelName = modelName
            console.log(`✅ Google Gemini AI initialized with model: ${this.modelName}`)
            modelInitialized = true
            break
          } catch (error) {
            console.log(`❌ Model ${modelName} failed to initialize: ${error.message}`)
          }
        }
        
        if (!modelInitialized) {
          console.warn('❌ No Gemini models could be initialized, falling back to mock service')
          this.useMock = true
        }
        
      } catch (error) {
        console.warn('Failed to initialize Google Gemini AI, falling back to mock service:', error.message)
        this.useMock = true
      }
    }
    
    if (this.useMock) {
      console.log('🤖 Using Mock AI Service for content generation (Google Gemini API key not configured)')
    }
  }

  // Platform character limits
  static PLATFORM_LIMITS = {
    twitter: 280,
    linkedin: 3000,
    instagram: 2200
  }

  // Tone configurations
  static TONES = {
    professional: {
      description: 'Formal, business-appropriate language',
      prompt: 'Write in a professional, formal tone suitable for business communication.'
    },
    friendly: {
      description: 'Warm, approachable, and conversational',
      prompt: 'Write in a friendly, warm, and conversational tone that feels approachable.'
    },
    funny: {
      description: 'Humorous and entertaining',
      prompt: 'Write in a funny, humorous tone that entertains while staying appropriate.'
    },
    formal: {
      description: 'Official and authoritative',
      prompt: 'Write in a formal, authoritative tone suitable for official communications.'
    },
    casual: {
      description: 'Relaxed and informal',
      prompt: 'Write in a casual, relaxed tone like talking to a friend.'
    }
  }

  /**
   * Rotate to next available API key
   */
  rotateApiKey() {
    if (this.apiKeys.length > 1) {
      this.currentApiKeyIndex = (this.currentApiKeyIndex + 1) % this.apiKeys.length
      this.apiKey = this.apiKeys[this.currentApiKeyIndex]
      this.genAI = new GoogleGenerativeAI(this.apiKey)
      
      // Reinitialize model with new API key
      const availableModels = [
        'models/gemini-1.5-flash',
        'models/gemini-1.5-pro',
        'models/gemini-pro',
        'models/gemini-1.0-pro',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro'
      ]
      
      for (const modelName of availableModels) {
        try {
          this.model = this.genAI.getGenerativeModel({ model: modelName })
          this.modelName = modelName
          break
        } catch (error) {
          continue
        }
      }
    }
  }

  /**
   * Test if a model is working
   */
  async testModel(modelName) {
    try {
      const testModel = this.genAI.getGenerativeModel({ model: modelName })
      const result = await testModel.generateContent("Test")
      const response = await result.response
      response.text() // This will throw if the model doesn't work
      return true
    } catch (error) {
      throw new Error(`Model ${modelName} test failed: ${error.message}`)
    }
  }

  /**
   * Generate content using LLaMA directly
   */
  async generateWithLlama(prompt, options = {}) {
    try {
      console.log('🦙 Using LLaMA for content generation...')
      return await llamaService.generateContent(prompt, options)
    } catch (error) {
      console.error('LLaMA generation error:', error)
      return {
        success: false,
        error: error.message || 'Failed to generate content with LLaMA',
        fallback: this.getFallbackContent(options)
      }
    }
  }

  /**
   * Generate content using Gemini AI (with LLaMA fallback)
   * @param {Object} options - Generation options
   * @param {string} options.tone - Content tone (professional, friendly, etc.)
   * @param {Array} options.platforms - Target platforms
   * @param {string} options.contentType - Type of content (text, image+text, etc.)
   * @param {Object} options.context - Additional context
   */
  async generateContent(prompt, options = {}) {
    try {
      // Use LLaMA service if available, otherwise use mock service
      if (this.useMock) {
        console.log('🔄 Gemini not available, trying LLaMA as primary fallback...')
        try {
          return await llamaService.generateContent(prompt, options)
        } catch (llamaError) {
          console.warn(`❌ LLaMA also failed: ${llamaError.message}`)
          console.log('🤖 Using Mock AI Service as final fallback')
          return await mockAiService.generateContent(prompt, options)
        }
      }

      const {
        tone = 'professional',
        platforms = ['twitter'],
        includeHashtags = true,
        includeEmojis = false,
        contentType = 'text',
        context = {}
      } = options

      // Validate inputs
      if (!prompt || prompt.trim().length === 0) {
        throw new Error('Content prompt is required')
      }

      if (!AIService.TONES[tone]) {
        throw new Error(`Invalid tone: ${tone}`)
      }

      // Build the AI prompt
      const aiPrompt = this.buildPrompt({
        userPrompt: prompt,
        tone,
        platforms,
        contentType,
        context
      })

      // Generate content with Gemini - with retry logic for rate limits
      let result, response, generatedText
      const maxRetries = 3
      let retryCount = 0
      
      while (retryCount < maxRetries) {
        try {
          console.log(`🔄 Attempting Gemini API call (attempt ${retryCount + 1}/${maxRetries})`)
          result = await this.model.generateContent(aiPrompt)
          response = await result.response
          generatedText = response.text()
          console.log('✅ Gemini API call successful!')
          break // Success, exit retry loop
          
        } catch (modelError) {
          retryCount++
          const errorMessage = modelError.message.toLowerCase()
          
          if (errorMessage.includes('rate limit') || errorMessage.includes('resource_exhausted')) {
            // Try rotating to next API key if available
            if (this.apiKeys.length > 1 && retryCount === 1) {
              this.rotateApiKey()
              console.log(`🔄 Switched to backup API key ${this.currentApiKeyIndex + 1}`)
              continue
            }
            
            if (retryCount < maxRetries) {
              const waitTime = Math.pow(2, retryCount) * 1000 // Exponential backoff: 2s, 4s, 8s
              console.warn(`⏳ Rate limit hit. Retrying in ${waitTime/1000}s... (${retryCount}/${maxRetries})`)
              await new Promise(resolve => setTimeout(resolve, waitTime))
              continue
            } else {
              console.warn(`❌ Gemini API rate limit exceeded after ${maxRetries} attempts`)
              throw new Error('Gemini API rate limit exceeded. Please try again in a few minutes or upgrade your API plan.')
            }
          } else {
            console.warn(`❌ Gemini API failed: ${modelError.message}`)
            
            // Try LLaMA as fallback for real AI responses
            try {
              console.log('🔄 Trying LLaMA as fallback for real AI responses...')
              return await llamaService.generateContent(prompt, options)
            } catch (llamaError) {
              console.warn(`❌ LLaMA also failed: ${llamaError.message}`)
              
              // Try OpenAI as final fallback
              try {
                console.log('🔄 Trying OpenAI as final fallback...')
                return await openaiService.generateContent(prompt, options)
              } catch (openaiError) {
                console.warn(`❌ OpenAI also failed: ${openaiError.message}`)
                console.log('🤖 All AI services unavailable. Using Enhanced AI Service for demo purposes.')
                console.log('💡 Note: This provides intelligent responses while AI services are restored.')
                return await mockAiService.generateContent(prompt, options)
              }
            }
          }
        }
      }

      // Parse platform-specific content from AI response
      const platformContent = this.parseAIResponse(generatedText, platforms)

      // Generate hashtags and emojis
      const hashtags = await this.generateHashtags(prompt, platforms)
      const emojis = this.suggestEmojis(generatedText, tone)

      return {
        success: true,
        content: {
          original: generatedText,
          platforms: platformContent,
          hashtags,
          emojis,
          metadata: {
            tone,
            contentType,
            generatedAt: new Date(),
            model: this.modelName || 'gemini-pro',
            platforms
          }
        }
      }
    } catch (error) {
      console.error('AI Content Generation Error:', error)
      return {
        success: false,
        error: error.message || 'Failed to generate content',
        fallback: this.getFallbackContent(options)
      }
    }
  }

  /**
   * Build the AI prompt with context and instructions
   */
  buildPrompt({ userPrompt, tone, platforms, contentType, context }) {
    const toneInstruction = AIService.TONES[tone].prompt
    const platformInfo = platforms.map(p => `${p} (${AIService.PLATFORM_LIMITS[p]} chars)`).join(', ')

    return `
You are an expert social media content creator. Create platform-specific content for: ${platforms.join(', ')}

USER REQUEST: "${userPrompt}"
TONE: ${toneInstruction}

IMPORTANT RULES:
- Generate ONLY the actual post content for each platform
- NO metadata, NO character count mentions, NO explanations
- Match response length to request complexity:
  * Simple requests (hello, thanks) = 1 sentence per platform
  * Medium requests (tips, announcements) = 2-3 sentences per platform  
  * Complex requests = detailed content as needed
- Keep Twitter under 280 characters
- Keep LinkedIn concise for simple requests (under 100 chars)
- Make content natural and engaging

${context.industry ? `Industry: ${context.industry}` : ''}
${context.audience ? `Audience: ${context.audience}` : ''}

Generate clean, platform-specific content only:
`
  }

  /**
   * Parse AI response to extract platform-specific content
   */
  parseAIResponse(content, platforms) {
    const platformContent = {}
    
    platforms.forEach(platform => {
      // Try to extract platform-specific content or use the whole content
      let platformText = content.trim()
      
      // Remove any metadata or formatting artifacts
      platformText = platformText.replace(/\*\*(Twitter|LinkedIn|Instagram).*?\*\*/gi, '')
      platformText = platformText.replace(/\(under \d+ characters?\)/gi, '')
      platformText = platformText.replace(/\*\*/g, '')
      platformText = platformText.trim()
      
      // If content is too long, truncate appropriately
      const limit = AIService.PLATFORM_LIMITS[platform]
      if (platformText.length > limit - 20) {
        platformText = platformText.substring(0, limit - 20).trim()
        // Try to end at a complete word
        const lastSpace = platformText.lastIndexOf(' ')
        if (lastSpace > platformText.length - 20) {
          platformText = platformText.substring(0, lastSpace)
        }
      }

      platformContent[platform] = {
        text: platformText,
        characterCount: platformText.length,
        characterLimit: limit,
        hashtags: [],
        emojis: []
      }
    })

    return platformContent
  }

  /**
   * Adapt content for different platforms
   */
  adaptContentForPlatforms(content, platforms) {
    const adaptedContent = {}

    platforms.forEach(platform => {
      const limit = AIService.PLATFORM_LIMITS[platform]
      let adapted = content

      // Platform-specific adaptations
      switch (platform) {
        case 'twitter':
          // Keep it concise, add thread potential
          if (adapted.length > limit - 50) {
            adapted = adapted.substring(0, limit - 50) + '...'
          }
          break

        case 'linkedin':
          // More professional, can be longer
          if (adapted.length > limit - 100) {
            adapted = adapted.substring(0, limit - 100) + '...'
          }
          break

        case 'instagram':
          // More visual focus, storytelling
          if (adapted.length > limit - 100) {
            adapted = adapted.substring(0, limit - 100) + '...'
          }
          break
      }

      adaptedContent[platform] = {
        text: adapted,
        characterCount: adapted.length,
        characterLimit: limit,
        withinLimit: adapted.length <= limit
      }
    })

    return adaptedContent
  }

  /**
   * Generate relevant hashtags
   */
  async generateHashtags(prompt, platforms) {
    // If using mock service, return default hashtags
    if (this.useMock) {
      return this.getDefaultHashtags(prompt)
    }

    try {
      const hashtagPrompt = `
Generate 5-10 relevant hashtags for this social media content: "${prompt}"

Requirements:
- Mix of popular and niche hashtags
- Relevant to the content topic
- Platform appropriate for: ${platforms.join(', ')}
- Include trending and evergreen tags
- Format as #hashtag

Return only the hashtags, separated by spaces:
`

      let result, response, hashtagText
      try {
        result = await this.model.generateContent(hashtagPrompt)
        response = await result.response
        hashtagText = response.text()
      } catch (error) {
        // If hashtag generation fails, return default hashtags
        console.warn('Hashtag generation failed, using defaults:', error.message)
        return this.getDefaultHashtags(prompt)
      }

      // Extract hashtags
      const hashtags = hashtagText
        .split(/\s+/)
        .filter(tag => tag.startsWith('#'))
        .slice(0, 10)

      return hashtags.length > 0 ? hashtags : this.getDefaultHashtags(prompt)
    } catch (error) {
      console.error('Hashtag generation error:', error)
      return this.getDefaultHashtags(prompt)
    }
  }

  /**
   * Get default hashtags based on content
   */
  getDefaultHashtags(prompt) {
    const contentLower = prompt.toLowerCase()
    const hashtags = ['#socialmedia', '#content']
    
    if (contentLower.includes('business') || contentLower.includes('work')) {
      hashtags.push('#business', '#professional')
    }
    if (contentLower.includes('tech') || contentLower.includes('technology')) {
      hashtags.push('#technology', '#innovation')
    }
    if (contentLower.includes('marketing')) {
      hashtags.push('#marketing', '#digitalmarketing')
    }
    if (contentLower.includes('success') || contentLower.includes('achievement')) {
      hashtags.push('#success', '#motivation')
    }
    
    hashtags.push('#engagement', '#community')
    return hashtags.slice(0, 8)
  }

  /**
   * Suggest relevant emojis based on content and tone
   */
  suggestEmojis(content, tone) {
    const emojiMap = {
      professional: ['💼', '📊', '🎯', '💡', '🚀', '📈'],
      friendly: ['😊', '👋', '💫', '🌟', '❤️', '🙌'],
      funny: ['😄', '😂', '🤣', '😆', '🎉', '🤪'],
      formal: ['📋', '📝', '🏢', '💼', '📊', '🎯'],
      casual: ['😎', '🤙', '✨', '🔥', '💯', '👍']
    }

    const baseEmojis = emojiMap[tone] || emojiMap.friendly

    // Add content-specific emojis based on keywords
    const contentLower = content.toLowerCase()
    const contextEmojis = []

    if (contentLower.includes('success') || contentLower.includes('achievement')) {
      contextEmojis.push('🏆', '🎉', '✅')
    }
    if (contentLower.includes('growth') || contentLower.includes('increase')) {
      contextEmojis.push('📈', '🚀', '📊')
    }
    if (contentLower.includes('team') || contentLower.includes('collaboration')) {
      contextEmojis.push('🤝', '👥', '🙌')
    }
    if (contentLower.includes('innovation') || contentLower.includes('technology')) {
      contextEmojis.push('💡', '🔬', '⚡')
    }

    return [...new Set([...baseEmojis, ...contextEmojis])].slice(0, 8)
  }

  /**
   * Get fallback content when AI generation fails
   */
  getFallbackContent(options) {
    const { prompt, tone = 'friendly', platforms = ['twitter'] } = options

    return {
      original: `Check out this interesting topic: ${prompt}`,
      platforms: platforms.reduce((acc, platform) => {
        acc[platform] = {
          text: `Exploring: ${prompt}`,
          characterCount: `Exploring: ${prompt}`.length,
          characterLimit: AIService.PLATFORM_LIMITS[platform],
          withinLimit: true
        }
        return acc
      }, {}),
      hashtags: ['#content', '#socialmedia'],
      emojis: ['💡', '🚀'],
      metadata: {
        tone,
        contentType: 'text',
        generatedAt: new Date(),
        model: 'fallback',
        platforms
      }
    }
  }

  /**
   * Analyze content performance potential
   */
  async analyzeContentPotential(content, platforms) {
    try {
      const analysisPrompt = `
Analyze this social media content for engagement potential:

"${content}"

Platforms: ${platforms.join(', ')}

Rate the content (1-10) on:
1. Engagement potential
2. Shareability
3. Clarity
4. Call-to-action effectiveness
5. Overall quality

Provide brief suggestions for improvement.

Format as JSON:
{
  "scores": {
    "engagement": 8,
    "shareability": 7,
    "clarity": 9,
    "callToAction": 6,
    "overall": 7.5
  },
  "suggestions": ["suggestion1", "suggestion2"]
}
`

      const result = await this.model.generateContent(analysisPrompt)
      const response = await result.response
      const analysisText = response.text()

      try {
        return JSON.parse(analysisText)
      } catch {
        return {
          scores: { overall: 7 },
          suggestions: ['Content looks good for social media sharing']
        }
      }
    } catch (error) {
      console.error('Content analysis error:', error)
      return {
        scores: { overall: 7 },
        suggestions: ['Unable to analyze content at this time']
      }
    }
  }
}

export default new AIService()
