// Mock AI Service for demo purposes when Google Gemini API key is not available

class MockAIService {
  constructor() {
    this.mockResponses = {
      professional: [
        "Excited to share insights on the latest industry trends and innovations. What challenges are you facing in your field? #Innovation #ProfessionalGrowth",
        "Thrilled to announce our latest project milestone! Collaboration and dedication make all the difference. #Teamwork #Success #Achievement",
        "Key takeaways from today's industry conference: Innovation drives growth, and adaptability is crucial for success. #Leadership #Strategy"
      ],
      friendly: [
        "Hey everyone! 👋 Just wanted to share something cool I discovered today. What's been the highlight of your week? #Community #Sharing",
        "Having an amazing day working on exciting projects! ✨ Love connecting with like-minded people. What's inspiring you lately? #Inspiration #Connection",
        "Coffee break thoughts: Sometimes the best ideas come when you least expect them! ☕ What's your creative process like? #Creativity #Ideas"
      ],
      casual: [
        "Just finished an awesome project and feeling great about it! 🎉 Anyone else having a productive day? #GoodVibes #Productivity",
        "Weekend vibes starting early! 😎 What are your plans? Always looking for new adventures and experiences. #Weekend #Adventure",
        "Random thought: Why do the best conversations happen in the most unexpected places? 🤔 #RandomThoughts #Life"
      ],
      funny: [
        "Me: I'll just check social media for 5 minutes. Also me: *3 hours later* How did I end up watching videos of cats playing piano? 😹 #Relatable #SocialMedia",
        "My relationship with deadlines: It's complicated. We see each other coming, but somehow we always meet at the last minute! ⏰ #DeadlineStruggles #Humor",
        "Breaking news: Local person discovers they've been pronouncing 'gif' wrong their entire life. More at 11. 📰 #TechHumor #LifeUpdates"
      ],
      formal: [
        "We are pleased to announce significant developments in our ongoing initiatives. These advancements represent our commitment to excellence and innovation. #Announcement #Excellence",
        "It is with great satisfaction that we report substantial progress in our strategic objectives. We remain dedicated to delivering exceptional results. #Progress #Strategy",
        "We would like to express our appreciation for the continued support and collaboration from our valued partners and stakeholders. #Gratitude #Partnership"
      ]
    }

    this.hashtagSuggestions = {
      general: ['#Innovation', '#Success', '#Growth', '#Leadership', '#Teamwork', '#Strategy', '#Excellence'],
      tech: ['#Technology', '#AI', '#DigitalTransformation', '#Innovation', '#TechTrends', '#Automation'],
      business: ['#Business', '#Entrepreneurship', '#Leadership', '#Strategy', '#Growth', '#Success'],
      social: ['#Community', '#Networking', '#Connection', '#Collaboration', '#Inspiration', '#Motivation']
    }
  }

  generatePersonalizedContent(prompt, tone) {
    const promptLower = prompt.toLowerCase()
    
    // Extract the actual topic from the prompt
    const topic = this.extractTopic(prompt)
    
    // Generate content based on prompt keywords and tone
    let content = ''
    
    if (tone === 'professional') {
      if (promptLower.includes('hello') || promptLower.includes('hi')) {
        content = `Greetings! Excited to connect and share insights about ${topic}. Looking forward to meaningful discussions and collaboration. #Networking #Professional`
      } else if (promptLower.includes('thank')) {
        content = `We appreciate your continued support and engagement regarding ${topic}. Your partnership drives our success and innovation. #Gratitude #Partnership`
      } else {
        content = this.generateTopicContent(topic, 'professional')
      }
    } else if (tone === 'friendly') {
      if (promptLower.includes('hello') || promptLower.includes('hi')) {
        content = `Hey there! 👋 Hope you're having an amazing day! What's been keeping you busy lately? #Friendly #Community`
      } else if (promptLower.includes('thank')) {
        content = `Thank you all! 🙏 You are amazing and make this community so special! Grateful for each and every one of you! #Grateful #Community`
      } else {
        content = this.generateTopicContent(topic, 'friendly')
      }
    } else if (tone === 'casual') {
      if (promptLower.includes('hello') || promptLower.includes('hi')) {
        content = `What's up everyone! 😎 Anyone else feeling good vibes today? #CasualVibes #GoodDay`
      } else {
        content = this.generateTopicContent(topic, 'casual')
      }
    } else if (tone === 'funny') {
      content = this.generateTopicContent(topic, 'funny')
    } else { // formal
      content = this.generateTopicContent(topic, 'formal')
    }
    
    return content
  }

  extractTopic(prompt) {
    const promptLower = prompt.toLowerCase()
    
    // Remove common instruction words to get the actual topic
    let topic = prompt
      .replace(/write a post (about|on)/gi, '')
      .replace(/create a post (about|on)/gi, '')
      .replace(/post about/gi, '')
      .replace(/how exciting/gi, '')
      .replace(/how amazing/gi, '')
      .replace(/how great/gi, '')
      .trim()
    
    // If topic is still too generic, extract key words
    if (topic.length < 3) {
      if (promptLower.includes('javascript')) topic = 'JavaScript programming'
      else if (promptLower.includes('java') && !promptLower.includes('javascript')) topic = 'Java programming'
      else if (promptLower.includes('python')) topic = 'Python development'
      else if (promptLower.includes('react')) topic = 'React development'
      else if (promptLower.includes('ai')) topic = 'artificial intelligence'
      else topic = 'technology'
    }
    
    return topic
  }

  generateTopicContent(topic, tone) {
    const topicLower = topic.toLowerCase()
    
    // Programming/Tech specific content
    if (topicLower.includes('javascript')) {
      if (tone === 'professional') {
        return `JavaScript continues to dominate web development with its versatility and ecosystem. From frontend frameworks to Node.js backend solutions, it's the language that powers modern web experiences. What's your favorite JavaScript framework? #JavaScript #WebDevelopment #Programming`
      } else if (tone === 'friendly') {
        return `Just love how JavaScript makes the web come alive! 🌟 From interactive UIs to server-side magic with Node.js, it never stops amazing me. What's your favorite JS feature? #JavaScript #WebDev #Coding`
      } else if (tone === 'casual') {
        return `JavaScript is everywhere these days! 🚀 Frontend, backend, mobile apps - this language just keeps evolving. Anyone else excited about the latest ES features? #JavaScript #WebDev #TechTalk`
      } else if (tone === 'funny') {
        return `Me: "I'll just write a simple JavaScript function" *6 hours later* "Why do I have 47 npm packages and a webpack config?" 😅 But honestly, JS is amazing once you embrace the chaos! #JavaScript #WebDev #ProgrammerLife`
      } else { // formal
        return `We would like to highlight JavaScript's continued evolution and its critical role in modern web development. Its extensive ecosystem and cross-platform capabilities make it essential for contemporary software solutions. #JavaScript #WebDevelopment #Technology`
      }
    }
    else if (topicLower.includes('java') && !topicLower.includes('javascript')) {
      if (tone === 'professional') {
        return `Java continues to be a cornerstone of enterprise development. Its robust ecosystem, platform independence, and strong community make it an excellent choice for scalable applications. What's your experience with Java in production? #Java #Programming #SoftwareDevelopment`
      } else if (tone === 'friendly') {
        return `Just spent the day coding in Java and I'm reminded why I love this language! ☕ The way it handles object-oriented programming is just *chef's kiss* 👌 What's your favorite Java feature? #Java #Coding #Programming`
      } else if (tone === 'casual') {
        return `Java is seriously underrated! 🔥 Sure, it might be verbose, but that verbosity makes code so readable and maintainable. Plus, "write once, run anywhere" is still pretty cool! #Java #Programming #TechTalk`
      } else if (tone === 'funny') {
        return `Me: "I'll just write a simple Java program" *3 hours later* "Why do I need 47 imports for a Hello World?" 😅 But honestly, once you get past the boilerplate, Java is pretty amazing! #Java #ProgrammerHumor #Coding`
      } else { // formal
        return `We would like to highlight the continued relevance of Java in modern software development. Its enterprise-grade features and extensive ecosystem provide substantial value for large-scale applications. #Java #Enterprise #SoftwareDevelopment`
      }
    }
    
    // Python content
    else if (topicLower.includes('python')) {
      if (tone === 'friendly') {
        return `Python never fails to amaze me! 🐍 The simplicity and elegance of the syntax makes complex problems feel manageable. What's your favorite Python library? #Python #Programming #DataScience`
      } else {
        return `Python's versatility in data science, web development, and automation continues to drive innovation across industries. Its readable syntax and extensive libraries make it accessible to developers at all levels. #Python #Programming #Innovation`
      }
    }
    
    // AI/Tech content
    else if (topicLower.includes('ai') || topicLower.includes('artificial intelligence')) {
      if (tone === 'friendly') {
        return `The pace of AI development is absolutely mind-blowing! 🤖 Every day brings new possibilities and innovations. What AI tool has changed your workflow the most? #AI #Technology #Innovation`
      } else {
        return `Artificial Intelligence continues to reshape industries and create new opportunities for innovation. The integration of AI into everyday applications is transforming how we work and interact with technology. #AI #Innovation #Technology`
      }
    }
    
    // Generic tech content based on tone
    else {
      if (tone === 'professional') {
        return `Exploring the latest developments in ${topic}. This field continues to evolve rapidly, offering new opportunities for innovation and growth. What trends are you seeing in this space? #Technology #Innovation #Industry`
      } else if (tone === 'friendly') {
        return `Really excited to dive deeper into ${topic}! 🚀 There's so much to learn and explore. What resources would you recommend for someone getting started? #Learning #Technology #Community`
      } else if (tone === 'casual') {
        return `Been exploring ${topic} lately and it's pretty cool stuff! 😎 Anyone else working on similar things? Would love to connect and share experiences! #Technology #Networking`
      } else if (tone === 'funny') {
        return `Me trying to understand ${topic}: *confused developer noises* 😅 But seriously, once it clicks, it's actually pretty awesome! Anyone else have those "aha!" moments? #TechLife #Learning`
      } else { // formal
        return `We are pleased to share insights regarding ${topic}. This represents a significant area of development with substantial implications for our industry. We welcome professional discourse on this matter. #Technology #Industry #Development`
      }
    }
  }

  async generateContent(prompt, options = {}) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))

      const { tone = 'professional', platforms = ['twitter'], includeHashtags = true, includeEmojis = true } = options

      // Generate content based on the user's prompt
      let baseContent = this.generatePersonalizedContent(prompt, tone)

      // Create platform-specific content
      const platformContent = {}
      
      platforms.forEach(platform => {
        let content = baseContent
        
        // Platform-specific optimizations
        if (platform === 'twitter' && content.length > 280) {
          content = content.substring(0, 250) + '... #TwitterOptimized'
        } else if (platform === 'linkedin') {
          content += '\n\nWhat are your thoughts on this? I\'d love to hear your perspective in the comments.'
        } else if (platform === 'instagram') {
          content += '\n\n📸 Share your experiences in the comments below!'
        }

        platformContent[platform] = {
          text: content,
          characterCount: content.length,
          characterLimit: platform === 'twitter' ? 280 : platform === 'linkedin' ? 3000 : 2200,
          hashtags: this.hashtagSuggestions.general.slice(0, 3),
          emojis: ['🚀', '✨', '💡', '🎯', '🔥'].slice(0, 2)
        }
      })

      // Generate hashtags and emojis
      const hashtags = this.hashtagSuggestions.general.slice(0, 5)
      const emojis = includeEmojis ? ['🚀', '✨', '💡', '🎯', '🔥'] : []

      return {
        success: true,
        content: {
          platforms: platformContent,
          hashtags: hashtags,
          emojis: emojis,
          metadata: {
            tone: tone,
            estimatedEngagement: Math.floor(Math.random() * 100) + 50,
            aiGenerated: true,
            model: 'Mock AI Service v1.0'
          }
        }
      }
    } catch (error) {
      console.error('Mock AI Service Error:', error)
      return {
        success: false,
        error: 'Failed to generate content with mock AI service'
      }
    }
  }

  async optimizeForPlatform(content, platform) {
    // Platform-specific content optimization
    const optimizations = {
      twitter: {
        maxLength: 280,
        suggestions: ['Keep it concise', 'Use relevant hashtags', 'Include a call-to-action']
      },
      linkedin: {
        maxLength: 3000,
        suggestions: ['Add professional insights', 'Include industry hashtags', 'Encourage engagement']
      },
      instagram: {
        maxLength: 2200,
        suggestions: ['Use visual language', 'Include lifestyle hashtags', 'Add emojis']
      }
    }

    return {
      optimizedContent: content,
      platform: platform,
      recommendations: optimizations[platform] || optimizations.twitter
    }
  }

  async generateHashtags(content, count = 5) {
    const allHashtags = Object.values(this.hashtagSuggestions).flat()
    const shuffled = allHashtags.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }
}

export default new MockAIService()
