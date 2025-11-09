import dotenv from 'dotenv'
import llamaService from './services/llamaService.js'

dotenv.config()

async function testLlama() {
  console.log('🦙 Testing LLaMA Integration...\n')
  
  try {
    // Test service status
    console.log('1. Checking LLaMA service status...')
    const status = await llamaService.getStatus()
    console.log('Status:', JSON.stringify(status, null, 2))
    
    // Test content generation
    console.log('\n2. Testing content generation...')
    const testPrompt = 'Create a social media post about the benefits of AI in business'
    const options = {
      tone: 'professional',
      platforms: ['twitter', 'linkedin'],
      temperature: 0.7
    }
    
    console.log(`Prompt: "${testPrompt}"`)
    console.log('Options:', options)
    
    const result = await llamaService.generateContent(testPrompt, options)
    
    if (result.success) {
      console.log('\n✅ LLaMA generation successful!')
      console.log('Generated content:')
      console.log('- Original:', result.content.original)
      console.log('- Platforms:')
      Object.entries(result.content.platforms).forEach(([platform, content]) => {
        console.log(`  ${platform}: "${content.text}" (${content.characterCount}/${content.characterLimit} chars)`)
      })
      console.log('- Hashtags:', result.content.hashtags.join(' '))
      console.log('- Emojis:', result.content.emojis.join(' '))
      console.log('- Provider:', result.content.metadata.provider)
    } else {
      console.log('❌ LLaMA generation failed:', result.error)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testLlama()
