import dotenv from 'dotenv'
import llamaService from './services/llamaService.js'

dotenv.config()

async function debugLlama() {
  console.log('🦙 Debugging LLaMA Service...\n')
  
  try {
    console.log('1. Testing simple content generation...')
    const result = await llamaService.generateContent('Hello world', {
      tone: 'friendly',
      platforms: ['twitter']
    })
    
    console.log('Result:', JSON.stringify(result, null, 2))
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
    console.error('Stack:', error.stack)
  }
}

debugLlama()
