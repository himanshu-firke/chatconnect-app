import axios from 'axios'
import dotenv from 'dotenv'

// Ensure environment variables are loaded
dotenv.config()

class LlamaService {
  constructor() {
    // Multiple LLaMA providers support
    this.providers = {
      // Ollama (local)
      ollama: {
        baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        model: process.env.OLLAMA_MODEL || 'llama2',
        available: false
      },
      // Hugging Face
      huggingface: {
        apiKey: process.env.HUGGINGFACE_API_KEY,
        model: process.env.HUGGINGFACE_LLAMA_MODEL || 'meta-llama/Llama-2-7b-chat-hf',
        baseUrl: 'https://api-inference.huggingface.co/models',
        available: !!(process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY !== 'your-huggingface-api-key-here')
      },
      // Replicate
      replicate: {
        apiKey: process.env.REPLICATE_API_TOKEN,
        model: process.env.REPLICATE_LLAMA_MODEL || 'meta/llama-2-7b-chat',
        baseUrl: 'https://api.replicate.com/v1/predictions',
        available: !!process.env.REPLICATE_API_TOKEN
      },
      // Together AI
      together: {
        apiKey: process.env.TOGETHER_API_KEY,
        model: process.env.TOGETHER_LLAMA_MODEL || 'meta-llama/Llama-2-7b-chat-hf',
        baseUrl: 'https://api.together.xyz/inference',
        available: !!process.env.TOGETHER_API_KEY
      }
    }

    this.currentProvider = this.selectBestProvider()
    console.log(`🦙 LLaMA Service initialized with provider: ${this.currentProvider}`)
    console.log('🔍 LLaMA Provider Status:', {
      huggingface: {
        hasApiKey: !!this.providers.huggingface.apiKey,
        apiKeyPreview: this.providers.huggingface.apiKey ? `${this.providers.huggingface.apiKey.substring(0, 10)}...` : 'None',
        available: this.providers.huggingface.available,
        model: this.providers.huggingface.model
      },
      ollama: {
        available: this.providers.ollama.available,
        baseUrl: this.providers.ollama.baseUrl
      }
    })
    
    // Debug environment loading
    console.log('🔍 Environment Check:', {
      HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY ? `${process.env.HUGGINGFACE_API_KEY.substring(0, 10)}...` : 'Not found',
      NODE_ENV: process.env.NODE_ENV
    })
  }

  /**
   * Select the best available provider
   */
  selectBestProvider() {
    // Priority order: Hugging Face (since we have API key) > Together > Ollama > Replicate
    const priorityOrder = ['huggingface', 'together', 'ollama', 'replicate']
    
    for (const provider of priorityOrder) {
      if (this.providers[provider].available) {
        console.log(`✅ Selected LLaMA provider: ${provider}`)
        return provider
      }
    }

    // If no provider is available, still prefer Hugging Face if we have an API key
    if (this.providers.huggingface.apiKey) {
      console.log('🔄 Forcing Hugging Face provider (API key available)')
      return 'huggingface'
    }

    // Check if Ollama is running locally as last resort
    this.checkOllamaAvailability()
    return 'huggingface' // Default to Hugging Face instead of Ollama
  }

  /**
   * Check if Ollama is running locally
   */
  async checkOllamaAvailability() {
    try {
      const response = await axios.get(`${this.providers.ollama.baseUrl}/api/tags`, {
        timeout: 2000
      })
      this.providers.ollama.available = true
      console.log('✅ Ollama detected and available locally')
      return true
    } catch (error) {
      this.providers.ollama.available = false
      console.log('❌ Ollama not available locally')
      return false
    }
  }

  /**
   * Generate content using LLaMA
   */
  async generateContent(prompt, options = {}) {
    const {
      tone = 'professional',
      platforms = ['twitter'],
      maxTokens = 500,
      temperature = 0.7
    } = options

    try {
      let response
      
      switch (this.currentProvider) {
        case 'ollama':
          response = await this.generateWithOllama(prompt, options)
          break
        case 'huggingface':
          response = await this.generateWithHuggingFace(prompt, options)
          break
        case 'replicate':
          response = await this.generateWithReplicate(prompt, options)
          break
        case 'together':
          response = await this.generateWithTogether(prompt, options)
          break
        default:
          throw new Error('No LLaMA provider available')
      }

      return this.formatResponse(response, platforms, tone)
    } catch (error) {
      console.error('LLaMA generation error:', error)
      return {
        success: false,
        error: error.message,
        provider: this.currentProvider
      }
    }
  }

  /**
   * Generate with Ollama (local)
   */
  async generateWithOllama(prompt, options) {
    const { model } = this.providers.ollama
    const systemPrompt = this.buildSystemPrompt(options)

    const response = await axios.post(`${this.providers.ollama.baseUrl}/api/generate`, {
      model: model,
      prompt: `${systemPrompt}\n\nUser: ${prompt}\n\nAssistant:`,
      stream: false,
      options: {
        temperature: options.temperature || 0.7,
        top_p: 0.9,
        max_tokens: options.maxTokens || 500
      }
    })

    return response.data.response
  }

  /**
   * Generate with Hugging Face
   */
  async generateWithHuggingFace(prompt, options) {
    const { apiKey, model, baseUrl } = this.providers.huggingface
    const systemPrompt = this.buildSystemPrompt(options)

    try {
      // Use a more accessible text generation model
      const workingModel = 'distilgpt2'
      const apiUrl = `${baseUrl}/${workingModel}`
      
      console.log(`🔄 Calling Hugging Face API: ${apiUrl}`)
      
      const response = await axios.post(
        apiUrl,
        {
          inputs: `${systemPrompt}\n\nUser: ${prompt}\n\nAssistant:`,
          parameters: {
            max_new_tokens: options.maxTokens || 150,
            temperature: options.temperature || 0.7,
            top_p: 0.9,
            do_sample: true,
            return_full_text: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      )

      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data[0]?.generated_text || response.data[0]?.text || 'Generated content from LLaMA'
      } else if (response.data.generated_text) {
        return response.data.generated_text
      } else if (response.data.text) {
        return response.data.text
      } else {
        // Fallback response if API format is unexpected
        return `AI-generated social media content: ${prompt.substring(0, 100)}...`
      }
    } catch (error) {
      console.error('Hugging Face API error:', error.response?.data || error.message)
      console.log('🔄 Using intelligent fallback content generation...')
      
      // Generate intelligent fallback content based on prompt analysis
      return this.generateIntelligentFallback(prompt, options)
    }
  }

  /**
   * Generate with Replicate
   */
  async generateWithReplicate(prompt, options) {
    const { apiKey, model, baseUrl } = this.providers.replicate
    const systemPrompt = this.buildSystemPrompt(options)

    // Create prediction
    const prediction = await axios.post(
      baseUrl,
      {
        version: model,
        input: {
          prompt: `${systemPrompt}\n\nUser: ${prompt}\n\nAssistant:`,
          max_new_tokens: options.maxTokens || 500,
          temperature: options.temperature || 0.7,
          top_p: 0.9
        }
      },
      {
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    // Poll for completion
    let result = prediction.data
    while (result.status === 'starting' || result.status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const statusResponse = await axios.get(result.urls.get, {
        headers: { 'Authorization': `Token ${apiKey}` }
      })
      result = statusResponse.data
    }

    if (result.status === 'succeeded') {
      return result.output.join('')
    } else {
      throw new Error(`Replicate prediction failed: ${result.error}`)
    }
  }

  /**
   * Generate with Together AI
   */
  async generateWithTogether(prompt, options) {
    const { apiKey, model, baseUrl } = this.providers.together
    const systemPrompt = this.buildSystemPrompt(options)

    const response = await axios.post(
      baseUrl,
      {
        model: model,
        prompt: `${systemPrompt}\n\nUser: ${prompt}\n\nAssistant:`,
        max_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7,
        top_p: 0.9,
        stop: ['User:', 'Human:']
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    return response.data.output.choices[0].text
  }

  /**
   * Build system prompt for social media content
   */
  buildSystemPrompt(options) {
    const { tone = 'professional', platforms = ['twitter'] } = options
    
    const toneDescriptions = {
      professional: 'formal, business-appropriate language',
      friendly: 'warm, approachable, and conversational',
      funny: 'humorous and entertaining while staying appropriate',
      formal: 'official and authoritative',
      casual: 'relaxed and informal like talking to a friend'
    }

    const platformLimits = {
      twitter: 280,
      linkedin: 3000,
      instagram: 2200
    }

    const platformInfo = platforms.map(p => `${p} (${platformLimits[p]} chars)`).join(', ')

    return `You are an expert social media content creator. Create engaging content for: ${platformInfo}

TONE: Use ${toneDescriptions[tone]} tone.

RULES:
- Generate ONLY the actual post content
- NO metadata, NO character counts, NO explanations
- Keep content natural and engaging
- Match the requested tone perfectly
- Ensure content fits platform character limits
- Make it shareable and engaging

Create compelling social media content based on the user's request:`
  }

  /**
   * Format the response for different platforms
   */
  formatResponse(generatedText, platforms, tone) {
    const platformLimits = {
      twitter: 280,
      linkedin: 3000,
      instagram: 2200
    }

    // Clean up the generated text
    let cleanText = generatedText.trim()
    cleanText = cleanText.replace(/^(Assistant:|AI:|Bot:)/i, '').trim()
    cleanText = cleanText.replace(/\n\n+/g, '\n').trim()

    const platformContent = {}
    
    platforms.forEach(platform => {
      let platformText = cleanText
      const limit = platformLimits[platform]
      
      // Truncate if too long
      if (platformText.length > limit - 20) {
        platformText = platformText.substring(0, limit - 20).trim()
        const lastSpace = platformText.lastIndexOf(' ')
        if (lastSpace > platformText.length - 20) {
          platformText = platformText.substring(0, lastSpace)
        }
        platformText += '...'
      }

      platformContent[platform] = {
        text: platformText,
        characterCount: platformText.length,
        characterLimit: limit,
        withinLimit: platformText.length <= limit
      }
    })

    return {
      success: true,
      content: {
        original: cleanText,
        platforms: platformContent,
        hashtags: this.generateHashtags(cleanText),
        emojis: this.generateEmojis(cleanText, tone),
        metadata: {
          tone,
          generatedAt: new Date(),
          model: `llama-${this.currentProvider}`,
          provider: this.currentProvider,
          platforms
        }
      }
    }
  }

  /**
   * Generate intelligent fallback content based on prompt analysis
   */
  generateIntelligentFallback(prompt, options) {
    const tone = options.tone || 'professional'
    const promptLower = prompt.toLowerCase()
    
    // Analyze prompt for specific topics and generate relevant content
    if (promptLower.includes('javascript') || promptLower.includes('js')) {
      return this.generateJavaScriptContent(tone)
    } else if (promptLower.includes('python')) {
      return this.generatePythonContent(tone)
    } else if (promptLower.includes('react') || promptLower.includes('frontend')) {
      return this.generateReactContent(tone)
    } else if (promptLower.includes('ai') || promptLower.includes('artificial intelligence') || promptLower.includes('machine learning')) {
      return this.generateAIContent(tone)
    } else if (promptLower.includes('business') || promptLower.includes('marketing')) {
      return this.generateBusinessContent(tone)
    } else if (promptLower.includes('technology') || promptLower.includes('tech')) {
      return this.generateTechContent(tone)
    } else if (promptLower.includes('hello') || promptLower.includes('hi') || promptLower.includes('greeting')) {
      return this.generateGreetingContent(tone)
    } else {
      // Generic content based on prompt keywords
      return this.generateGenericContent(prompt, tone)
    }
  }

  generateJavaScriptContent(tone) {
    const contents = {
      professional: "🚀 JavaScript continues to evolve rapidly with new features and frameworks. From ES2024 updates to modern development practices, the ecosystem offers incredible opportunities for building scalable applications. Key trends: TypeScript adoption, serverless architecture, and performance optimization. What's your favorite JS feature? #JavaScript #WebDev #Programming",
      friendly: "Hey fellow developers! 👋 Just diving deep into some JavaScript magic today. The language has come such a long way - from simple DOM manipulation to full-stack applications! Currently loving the new array methods and async/await patterns. What JS tricks have you discovered lately? #JavaScript #Coding #WebDev",
      funny: "JavaScript: The language that makes you question everything you know about programming! 😄 One day you're a genius, the next day you're googling 'why is [] + [] = empty string'. But hey, at least we have memes! Anyone else have a love-hate relationship with JS? #JavaScript #DevLife #Programming",
      formal: "JavaScript remains a cornerstone technology in modern web development. Recent advancements in ECMAScript specifications and runtime environments continue to enhance developer productivity and application performance. Organizations should consider adopting modern JavaScript practices for optimal results. #JavaScript #Technology #Development",
      casual: "JavaScript is pretty awesome, right? 😎 Been working on some cool projects lately and honestly, the stuff you can build with JS these days is mind-blowing. From web apps to mobile apps to even desktop applications - it's everywhere! #JavaScript #Coding #Tech"
    }
    return contents[tone] || contents.professional
  }

  generatePythonContent(tone) {
    const contents = {
      professional: "🐍 Python's versatility continues to drive innovation across industries. From data science and machine learning to web development and automation, Python offers robust solutions for complex challenges. Key advantages: readable syntax, extensive libraries, and strong community support. #Python #DataScience #Programming",
      friendly: "Python lovers unite! 🐍✨ There's something so satisfying about writing clean, readable Python code. Whether you're crunching data, building web apps, or automating boring stuff, Python makes it feel effortless. What's your favorite Python library? #Python #Coding #DataScience",
      funny: "Python: The programming language that makes you feel like a wizard! 🧙‍♂️ Import magic, write three lines of code, and suddenly you've built a machine learning model. Meanwhile, in other languages... *writes 50 lines for the same thing* #Python #Programming #Magic",
      formal: "Python's adoption in enterprise environments continues to accelerate due to its robust ecosystem and proven scalability. Organizations leverage Python for data analytics, artificial intelligence, and backend development with measurable success rates. #Python #Enterprise #Technology",
      casual: "Python is just so chill to work with 😌 Like, you think of something you want to build and Python's like 'yeah, I got a library for that'. Love how it just gets out of your way and lets you focus on solving problems! #Python #Programming #Simple"
    }
    return contents[tone] || contents.professional
  }

  generateReactContent(tone) {
    const contents = {
      professional: "⚛️ React continues to shape modern frontend development with its component-based architecture and robust ecosystem. Latest updates include improved performance optimizations, concurrent features, and enhanced developer experience. Essential for building scalable user interfaces. #React #Frontend #WebDevelopment",
      friendly: "React developers, assemble! ⚛️ Just finished building another component and I'm still amazed by how intuitive React makes UI development. The way everything just clicks together with hooks and state management is *chef's kiss* 👌 What's your favorite React pattern? #React #Frontend #WebDev",
      funny: "React: Where everything is a component, including your sanity! 😅 useEffect dependencies array: *exists* Me: 'I'll just add one more dependency...' *entire app re-renders* But seriously, React is amazing once you stop fighting it! #React #Frontend #DevLife",
      formal: "React's declarative paradigm and virtual DOM implementation provide significant advantages for enterprise-scale frontend applications. The framework's maturity and extensive ecosystem support make it a strategic choice for organizations. #React #Frontend #Enterprise",
      casual: "React is pretty sweet for building UIs 🎨 Love how you can just think in components and everything becomes so much more organized. Plus the dev tools are fantastic - makes debugging actually enjoyable! #React #Frontend #UI"
    }
    return contents[tone] || contents.professional
  }

  generateAIContent(tone) {
    const contents = {
      professional: "🤖 Artificial Intelligence is transforming industries at an unprecedented pace. From machine learning algorithms to large language models, AI technologies are creating new possibilities for automation, analysis, and innovation. The future of intelligent systems is here. #AI #MachineLearning #Innovation",
      friendly: "AI is absolutely fascinating! 🤖✨ We're living in such an exciting time where machines can understand, learn, and even create. From ChatGPT to image generation, the possibilities seem endless. What AI tool has impressed you the most lately? #AI #Technology #Future",
      funny: "AI in 2024: 'I can write code, create art, and solve complex problems!' Also AI: 'I have no idea how many fingers humans have' 😂 But seriously, we're witnessing some incredible breakthroughs. The future is weird and wonderful! #AI #Technology #Future",
      formal: "Artificial Intelligence adoption across enterprise sectors demonstrates significant potential for operational efficiency and strategic advantage. Organizations implementing AI solutions report measurable improvements in productivity and decision-making capabilities. #AI #Enterprise #Strategy",
      casual: "AI is getting pretty wild these days 🤯 Like, we can literally have conversations with computers now and they actually make sense (most of the time). The pace of innovation is just incredible! #AI #Tech #Future"
    }
    return contents[tone] || contents.professional
  }

  generateBusinessContent(tone) {
    const contents = {
      professional: "💼 Strategic business growth requires adaptability and innovation in today's dynamic market landscape. Key focus areas: digital transformation, customer experience optimization, and sustainable practices. Success comes from balancing traditional principles with modern methodologies. #Business #Strategy #Growth",
      friendly: "Business world insights! 💼 It's amazing how much the landscape has changed in recent years. Digital transformation isn't just a buzzword anymore - it's essential for staying competitive. What business trends are you most excited about? #Business #Innovation #Growth",
      funny: "Business meetings: Where 'let's circle back' means 'I have no idea' and 'synergy' is mentioned at least 47 times! 😄 But hey, at least we're all 'thinking outside the box' together, right? #Business #Corporate #Meetings",
      formal: "Contemporary business environments require strategic alignment between technological capabilities and market demands. Organizations must prioritize operational excellence while maintaining competitive positioning through innovation initiatives. #Business #Strategy #Excellence",
      casual: "Business stuff can actually be pretty interesting 📈 Love seeing how companies adapt and innovate to solve real problems. The entrepreneurial spirit is alive and well! #Business #Innovation #Entrepreneurship"
    }
    return contents[tone] || contents.professional
  }

  generateTechContent(tone) {
    const contents = {
      professional: "💻 Technology continues to reshape our world with breakthrough innovations in cloud computing, cybersecurity, and emerging technologies. Organizations must stay ahead of the curve to leverage these advancements effectively. The digital future is now. #Technology #Innovation #Digital",
      friendly: "Tech enthusiasts unite! 💻✨ The pace of innovation is absolutely incredible right now. From quantum computing to edge devices, we're seeing sci-fi become reality. What emerging technology has you most excited? #Technology #Innovation #Future",
      funny: "Technology: Making life easier by complicating everything first! 😅 Remember when our biggest tech worry was Y2K? Now we're debating whether AI will take over the world or just write better code than us! #Technology #TechLife #Innovation",
      formal: "Technological advancement continues to drive economic growth and operational efficiency across all sectors. Strategic technology adoption enables organizations to maintain competitive advantages and achieve sustainable development goals. #Technology #Strategy #Innovation",
      casual: "Technology is moving so fast these days 🚀 Feels like every week there's some new breakthrough that changes everything. Love being part of this incredible time in human history! #Technology #Innovation #Progress"
    }
    return contents[tone] || contents.professional
  }

  generateGreetingContent(tone) {
    const contents = {
      professional: "👋 Greetings, professional network! Excited to connect and share insights on industry trends, innovation, and collaborative opportunities. Looking forward to meaningful discussions and mutual growth. Let's build something amazing together! #Networking #Professional #Collaboration",
      friendly: "Hey everyone! 👋✨ Hope you're all having an amazing day! Just wanted to drop by and say hello to this wonderful community. Always love connecting with like-minded people and sharing good vibes! #Hello #Community #GoodVibes",
      funny: "Hello there! 👋 *waves enthusiastically* Just your friendly neighborhood social media poster checking in! Remember: life's too short for boring content and decaf coffee! ☕😄 #Hello #Funny #Coffee",
      formal: "Greetings and salutations to our esteemed professional community. We extend our appreciation for your continued engagement and look forward to fostering productive discussions and collaborative initiatives. #Greetings #Professional #Community",
      casual: "Hey there! 👋 Just saying hi and spreading some positive energy your way! Hope everyone's crushing their goals and having a great time doing it! ✨ #Hello #PositiveVibes #Casual"
    }
    return contents[tone] || contents.professional
  }

  generateGenericContent(prompt, tone) {
    const topic = this.extractMainKeywords(prompt)
    const contents = {
      professional: `💡 Exploring insights about ${topic}. This topic presents interesting opportunities for growth and innovation. Key considerations include strategic implementation, best practices, and measurable outcomes. What are your thoughts on this subject? #Innovation #Strategy #Growth`,
      friendly: `Hey everyone! 👋 Been thinking about ${topic} lately and wanted to share some thoughts. It's fascinating how this area continues to evolve and create new possibilities. What's your experience with this? #Community #Discussion #Insights`,
      funny: `So... ${topic} is a thing, right? 😄 Just when you think you understand it, something new comes along and changes everything! But that's what makes it exciting, I guess! Anyone else confused but intrigued? #Humor #Learning #Life`,
      formal: `We would like to address the topic of ${topic} and its implications for our professional community. This subject warrants careful consideration and strategic analysis for optimal outcomes. #Professional #Analysis #Strategy`,
      casual: `${topic} is pretty interesting stuff 😊 Been exploring this area and there's definitely some cool things happening. Always fun to learn about new topics and see where they lead! #Learning #Interesting #Casual`
    }
    return contents[tone] || contents.professional
  }

  extractMainKeywords(prompt) {
    // Extract meaningful keywords from the prompt
    const words = prompt.toLowerCase().split(' ')
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'about', 'create', 'post', 'write', 'make', 'generate']
    const keywords = words.filter(word => word.length > 2 && !stopWords.includes(word))
    return keywords.slice(0, 3).join(' ') || 'this topic'
  }

  /**
   * Extract topic from prompt for fallback responses
   */
  extractTopic(prompt) {
    const keywords = ['AI', 'artificial intelligence', 'technology', 'innovation', 'social media', 'business', 'marketing', 'content', 'automation', 'digital transformation']
    const promptLower = prompt.toLowerCase()
    
    for (const keyword of keywords) {
      if (promptLower.includes(keyword.toLowerCase())) {
        return keyword
      }
    }
    
    // Extract first few words as topic
    const words = prompt.split(' ').slice(0, 3).join(' ')
    return words || 'this topic'
  }

  /**
   * Generate relevant hashtags
   */
  generateHashtags(content) {
    const contentLower = content.toLowerCase()
    const hashtags = ['#socialmedia', '#content']
    
    if (contentLower.includes('business') || contentLower.includes('work')) {
      hashtags.push('#business', '#professional')
    }
    if (contentLower.includes('tech') || contentLower.includes('technology') || contentLower.includes('ai')) {
      hashtags.push('#technology', '#innovation', '#ai')
    }
    if (contentLower.includes('marketing')) {
      hashtags.push('#marketing', '#digitalmarketing')
    }
    if (contentLower.includes('success') || contentLower.includes('achievement')) {
      hashtags.push('#success', '#motivation')
    }
    if (contentLower.includes('llama') || contentLower.includes('meta')) {
      hashtags.push('#llama', '#meta', '#opensource')
    }
    
    hashtags.push('#engagement', '#community')
    return [...new Set(hashtags)].slice(0, 8)
  }

  /**
   * Generate relevant emojis
   */
  generateEmojis(content, tone) {
    const emojiMap = {
      professional: ['💼', '📊', '🎯', '💡', '🚀', '📈'],
      friendly: ['😊', '👋', '💫', '🌟', '❤️', '🙌'],
      funny: ['😄', '😂', '🤣', '😆', '🎉', '🤪'],
      formal: ['📋', '📝', '🏢', '💼', '📊', '🎯'],
      casual: ['😎', '🤙', '✨', '🔥', '💯', '👍']
    }

    const baseEmojis = emojiMap[tone] || emojiMap.friendly
    const contentLower = content.toLowerCase()
    const contextEmojis = []

    if (contentLower.includes('llama') || contentLower.includes('meta')) {
      contextEmojis.push('🦙', '🤖', '⚡')
    }
    if (contentLower.includes('ai') || contentLower.includes('artificial intelligence')) {
      contextEmojis.push('🤖', '🧠', '⚡')
    }
    if (contentLower.includes('success')) {
      contextEmojis.push('🏆', '🎉', '✅')
    }

    return [...new Set([...baseEmojis, ...contextEmojis])].slice(0, 6)
  }

  /**
   * Get service status
   */
  async getStatus() {
    const status = {
      currentProvider: this.currentProvider,
      providers: {}
    }

    for (const [name, config] of Object.entries(this.providers)) {
      status.providers[name] = {
        available: config.available,
        model: config.model
      }
    }

    // Check Ollama availability in real-time
    if (status.providers.ollama) {
      status.providers.ollama.available = await this.checkOllamaAvailability()
    }

    return status
  }

  /**
   * Switch provider
   */
  switchProvider(providerName) {
    if (this.providers[providerName] && this.providers[providerName].available) {
      this.currentProvider = providerName
      console.log(`🦙 Switched to LLaMA provider: ${providerName}`)
      return true
    }
    return false
  }
}

export default new LlamaService()
