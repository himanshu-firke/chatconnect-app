import OpenAI from 'openai'

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY
    this.useMock = !this.apiKey || this.apiKey === 'your-openai-api-key-here'
    
    if (!this.useMock) {
      try {
        this.openai = new OpenAI({
          apiKey: this.apiKey
        })
        console.log('✅ OpenAI API initialized successfully')
      } catch (error) {
        console.warn('Failed to initialize OpenAI:', error.message)
        this.useMock = true
      }
    }
    
    if (this.useMock) {
      console.log('❌ OpenAI API key not configured')
    }
  }

  async generateContent(prompt, options = {}) {
    if (this.useMock) {
      throw new Error('OpenAI API key not configured')
    }

    try {
      const {
        tone = 'professional',
        platforms = ['twitter'],
        includeHashtags = true,
        includeEmojis = false
      } = options

      const systemPrompt = `You are an expert social media content creator. Generate engaging content for ${platforms.join(', ')} with a ${tone} tone.`
      
      const userPrompt = `Create social media content: "${prompt}"

Requirements:
- Tone: ${tone}
- Platforms: ${platforms.join(', ')}
- Keep Twitter under 280 characters
- Make it engaging and natural
- Generate only the post content, no explanations`

      console.log('🔄 Calling OpenAI API...')
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 200,
        temperature: 0.7
      })

      const generatedText = completion.choices[0].message.content.trim()
      console.log('✅ OpenAI API call successful!')
      
      return {
        success: true,
        content: {
          platforms: this.adaptForPlatforms(generatedText, platforms),
          hashtags: this.generateHashtags(prompt),
          emojis: this.suggestEmojis(generatedText, tone),
          metadata: {
            tone,
            generatedAt: new Date(),
            model: 'gpt-3.5-turbo',
            platforms
          }
        }
      }
    } catch (error) {
      console.error('OpenAI API Error:', error)
      throw new Error(`OpenAI API failed: ${error.message}`)
    }
  }

  adaptForPlatforms(content, platforms) {
    const platformContent = {}
    
    platforms.forEach(platform => {
      const limits = { twitter: 280, linkedin: 3000, instagram: 2200 }
      const limit = limits[platform] || 280
      
      let adaptedContent = content
      if (adaptedContent.length > limit - 20) {
        adaptedContent = adaptedContent.substring(0, limit - 20).trim()
        const lastSpace = adaptedContent.lastIndexOf(' ')
        if (lastSpace > adaptedContent.length - 20) {
          adaptedContent = adaptedContent.substring(0, lastSpace)
        }
      }

      platformContent[platform] = {
        text: adaptedContent,
        characterCount: adaptedContent.length,
        characterLimit: limit,
        hashtags: [],
        emojis: []
      }
    })

    return platformContent
  }

  generateHashtags(prompt) {
    const contentLower = prompt.toLowerCase()
    const hashtags = []
    
    if (contentLower.includes('javascript')) {
      hashtags.push('#JavaScript', '#WebDev', '#Programming', '#Coding')
    } else if (contentLower.includes('java') && !contentLower.includes('javascript')) {
      hashtags.push('#Java', '#Programming', '#Enterprise', '#SoftwareDevelopment')
    } else if (contentLower.includes('python')) {
      hashtags.push('#Python', '#DataScience', '#Programming', '#AI')
    } else if (contentLower.includes('react')) {
      hashtags.push('#React', '#JavaScript', '#WebDev', '#Frontend')
    } else if (contentLower.includes('ai')) {
      hashtags.push('#AI', '#MachineLearning', '#Technology', '#Innovation')
    } else {
      hashtags.push('#Technology', '#Innovation', '#Programming', '#Development')
    }
    
    return hashtags.slice(0, 5)
  }

  suggestEmojis(content, tone) {
    const emojiMap = {
      professional: ['💼', '📊', '🎯', '💡', '🚀'],
      friendly: ['😊', '👋', '💫', '🌟', '❤️'],
      funny: ['😄', '😂', '🤣', '😆', '🎉'],
      formal: ['📋', '📝', '🏢', '💼', '📊'],
      casual: ['😎', '🤙', '✨', '🔥', '💯']
    }

    return emojiMap[tone] || emojiMap.friendly
  }
}

export default new OpenAIService()
