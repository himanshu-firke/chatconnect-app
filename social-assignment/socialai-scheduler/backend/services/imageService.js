import axios from 'axios'
import dotenv from 'dotenv'

// Ensure environment variables are loaded
dotenv.config()

class ImageService {
  constructor() {
    // Multiple image generation providers
    this.providers = {
      // OpenAI DALL-E
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        baseUrl: 'https://api.openai.com/v1/images/generations',
        available: !!process.env.OPENAI_API_KEY
      },
      // Hugging Face Stable Diffusion
      huggingface: {
        apiKey: process.env.HUGGINGFACE_API_KEY,
        model: 'runwayml/stable-diffusion-v1-5',
        baseUrl: 'https://api-inference.huggingface.co/models',
        available: !!process.env.HUGGINGFACE_API_KEY
      },
      // Replicate
      replicate: {
        apiKey: process.env.REPLICATE_API_TOKEN,
        model: 'stability-ai/stable-diffusion',
        baseUrl: 'https://api.replicate.com/v1/predictions',
        available: !!process.env.REPLICATE_API_TOKEN
      }
    }

    this.currentProvider = this.selectBestProvider()
    console.log(`🎨 Image Service initialized with provider: ${this.currentProvider}`)
  }

  /**
   * Select the best available provider
   */
  selectBestProvider() {
    const priorityOrder = ['huggingface', 'openai', 'replicate']
    
    console.log('🔍 Checking image providers:')
    for (const [name, config] of Object.entries(this.providers)) {
      console.log(`  ${name}: ${config.available ? '✅ Available' : '❌ Not available'} (API Key: ${config.apiKey ? 'Found' : 'Missing'})`)
    }
    
    for (const provider of priorityOrder) {
      if (this.providers[provider].available) {
        console.log(`✅ Selected image provider: ${provider}`)
        return provider
      }
    }

    console.log('⚠️ No image providers available, using mock generation')
    return 'mock'
  }

  /**
   * Generate image based on prompt
   */
  async generateImage(prompt, options = {}) {
    const {
      style = 'realistic',
      size = '1024x1024',
      quality = 'standard',
      provider = this.currentProvider
    } = options

    console.log(`🎨 Generating image with ${provider}:`, { prompt, style, size })

    try {
      switch (provider) {
        case 'openai':
          return await this.generateWithOpenAI(prompt, { style, size, quality })
        case 'huggingface':
          return await this.generateWithHuggingFace(prompt, { style, size })
        case 'replicate':
          return await this.generateWithReplicate(prompt, { style, size })
        default:
          return this.generateMockImage(prompt, { style, size })
      }
    } catch (error) {
      console.error(`❌ Image generation failed with ${provider}:`, error.message)
      
      // Try fallback providers
      const fallbackProviders = ['openai', 'huggingface', 'replicate'].filter(p => p !== provider && this.providers[p].available)
      
      for (const fallbackProvider of fallbackProviders) {
        try {
          console.log(`🔄 Trying fallback provider: ${fallbackProvider}`)
          return await this.generateImage(prompt, { ...options, provider: fallbackProvider })
        } catch (fallbackError) {
          console.warn(`❌ Fallback ${fallbackProvider} also failed:`, fallbackError.message)
        }
      }
      
      // Final fallback to mock
      console.log('🎭 Using mock image generation as final fallback')
      return this.generateMockImage(prompt, { style, size })
    }
  }

  /**
   * Generate with OpenAI DALL-E
   */
  async generateWithOpenAI(prompt, options) {
    const { apiKey, baseUrl } = this.providers.openai
    const { style, size, quality } = options

    const enhancedPrompt = this.enhancePromptForStyle(prompt, style)

    const response = await axios.post(
      baseUrl,
      {
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: size,
        quality: quality,
        response_format: 'url'
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    )

    return {
      success: true,
      imageUrl: response.data.data[0].url,
      prompt: enhancedPrompt,
      provider: 'openai',
      metadata: {
        model: 'dall-e-3',
        size,
        quality,
        generatedAt: new Date()
      }
    }
  }

  /**
   * Generate with Hugging Face
   */
  async generateWithHuggingFace(prompt, options) {
    const { apiKey, model, baseUrl } = this.providers.huggingface
    const { style } = options

    const enhancedPrompt = this.enhancePromptForStyle(prompt, style)

    console.log(`🔄 Calling Hugging Face API: ${baseUrl}/${model}`)
    console.log(`📝 Enhanced prompt: ${enhancedPrompt}`)

    const response = await axios.post(
      `${baseUrl}/${model}`,
      {
        inputs: enhancedPrompt,
        parameters: {
          num_inference_steps: 20,
          guidance_scale: 7.5
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer',
        timeout: 30000
      }
    )

    // Check if response is valid
    if (!response.data || response.data.byteLength === 0) {
      throw new Error('Empty response from Hugging Face API')
    }

    // Convert buffer to base64
    const base64Image = Buffer.from(response.data).toString('base64')
    const imageUrl = `data:image/png;base64,${base64Image}`

    console.log('✅ Hugging Face image generated successfully')

    return {
      success: true,
      imageUrl,
      prompt: enhancedPrompt,
      provider: 'huggingface',
      metadata: {
        model,
        generatedAt: new Date()
      }
    }
  }

  /**
   * Generate with Replicate
   */
  async generateWithReplicate(prompt, options) {
    const { apiKey, model, baseUrl } = this.providers.replicate
    const { style } = options

    const enhancedPrompt = this.enhancePromptForStyle(prompt, style)

    // Create prediction
    const response = await axios.post(
      baseUrl,
      {
        version: 'db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
        input: {
          prompt: enhancedPrompt,
          width: 1024,
          height: 1024,
          num_inference_steps: 50,
          guidance_scale: 7.5
        }
      },
      {
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    )

    const predictionId = response.data.id

    // Poll for completion
    let result
    let attempts = 0
    const maxAttempts = 30

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const statusResponse = await axios.get(
        `${baseUrl}/${predictionId}`,
        {
          headers: {
            'Authorization': `Token ${apiKey}`
          }
        }
      )

      result = statusResponse.data

      if (result.status === 'succeeded') {
        break
      } else if (result.status === 'failed') {
        throw new Error('Image generation failed on Replicate')
      }

      attempts++
    }

    if (attempts >= maxAttempts) {
      throw new Error('Image generation timed out')
    }

    return {
      success: true,
      imageUrl: result.output[0],
      prompt: enhancedPrompt,
      provider: 'replicate',
      metadata: {
        model,
        predictionId,
        generatedAt: new Date()
      }
    }
  }

  /**
   * Generate mock image (fallback)
   */
  generateMockImage(prompt, options) {
    const { style, size } = options
    
    // Generate a placeholder image URL with better styling
    const [width, height] = size.split('x')
    
    // Use different placeholder services based on style
    let imageUrl
    const randomSeed = Date.now()
    
    switch (style) {
      case 'artistic':
        imageUrl = `https://picsum.photos/${width}/${height}?random=${randomSeed}&blur=1`
        break
      case 'cartoon':
        imageUrl = `https://via.placeholder.com/${width}x${height}/FF6B6B/FFFFFF?text=🎨+Generated+Image`
        break
      case 'minimalist':
        imageUrl = `https://via.placeholder.com/${width}x${height}/E8E8E8/666666?text=Minimalist+Design`
        break
      case 'vintage':
        imageUrl = `https://picsum.photos/${width}/${height}?random=${randomSeed}&grayscale`
        break
      case 'futuristic':
        imageUrl = `https://via.placeholder.com/${width}x${height}/1A1A2E/16213E?text=🚀+Future+Tech`
        break
      default:
        imageUrl = `https://picsum.photos/${width}/${height}?random=${randomSeed}`
    }
    
    console.log(`🎭 Generated mock image (${style} style): ${imageUrl}`)
    
    return {
      success: true,
      imageUrl,
      prompt,
      provider: 'mock',
      metadata: {
        style,
        size,
        generatedAt: new Date(),
        note: 'This is a placeholder image. Configure AI image providers for real generation.'
      }
    }
  }

  /**
   * Enhance prompt based on style
   */
  enhancePromptForStyle(prompt, style) {
    const styleEnhancements = {
      realistic: 'photorealistic, high quality, detailed, professional photography',
      artistic: 'artistic, creative, stylized, beautiful art style',
      cartoon: 'cartoon style, animated, colorful, fun illustration',
      minimalist: 'minimalist, clean, simple, modern design',
      vintage: 'vintage style, retro, classic, nostalgic',
      futuristic: 'futuristic, sci-fi, modern, high-tech, digital art'
    }

    const enhancement = styleEnhancements[style] || styleEnhancements.realistic
    return `${prompt}, ${enhancement}`
  }

  /**
   * Get available styles
   */
  getAvailableStyles() {
    return [
      { id: 'realistic', name: 'Realistic', description: 'Photorealistic images' },
      { id: 'artistic', name: 'Artistic', description: 'Creative and stylized' },
      { id: 'cartoon', name: 'Cartoon', description: 'Fun illustrations' },
      { id: 'minimalist', name: 'Minimalist', description: 'Clean and simple' },
      { id: 'vintage', name: 'Vintage', description: 'Retro and classic' },
      { id: 'futuristic', name: 'Futuristic', description: 'Sci-fi and modern' }
    ]
  }

  /**
   * Get available sizes
   */
  getAvailableSizes() {
    return [
      { id: '1024x1024', name: 'Square (1024x1024)', description: 'Perfect for Instagram' },
      { id: '1792x1024', name: 'Landscape (1792x1024)', description: 'Great for Twitter/LinkedIn' },
      { id: '1024x1792', name: 'Portrait (1024x1792)', description: 'Ideal for stories' }
    ]
  }

  /**
   * Get service status
   */
  getStatus() {
    const status = {
      currentProvider: this.currentProvider,
      providers: {}
    }

    for (const [name, config] of Object.entries(this.providers)) {
      status.providers[name] = {
        available: config.available,
        model: config.model || 'N/A'
      }
    }

    return status
  }
}

export default new ImageService()
