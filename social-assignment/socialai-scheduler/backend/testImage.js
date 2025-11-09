import dotenv from 'dotenv'
import imageService from './services/imageService.js'

dotenv.config()

async function testImageGeneration() {
  console.log('🎨 Testing Image Generation...\n')
  
  try {
    // Test service status
    console.log('1. Checking image service status...')
    const status = imageService.getStatus()
    console.log('Status:', JSON.stringify(status, null, 2))
    
    // Test image generation
    console.log('\n2. Testing image generation...')
    const testPrompt = 'A beautiful sunset over mountains'
    
    console.log(`Prompt: "${testPrompt}"`)
    
    const result = await imageService.generateImage(testPrompt, {
      style: 'realistic',
      size: '1024x1024'
    })
    
    if (result.success) {
      console.log('\n✅ Image generation successful!')
      console.log('Image URL:', result.imageUrl.substring(0, 100) + '...')
      console.log('Provider:', result.provider)
      console.log('Metadata:', result.metadata)
    } else {
      console.log('❌ Image generation failed:', result.error)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testImageGeneration()
