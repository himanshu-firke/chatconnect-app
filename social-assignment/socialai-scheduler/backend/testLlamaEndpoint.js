import axios from 'axios'

async function testLlamaEndpoint() {
  console.log('🦙 Testing LLaMA API endpoint...\n')
  
  try {
    // Test the debug LLaMA endpoint (no auth required)
    const response = await axios.post('http://localhost:5000/api/ai/test-llama', {
      prompt: 'Create a social media post about AI innovation',
      tone: 'professional',
      platforms: ['twitter', 'linkedin'],
      llamaProvider: 'huggingface'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log('✅ LLaMA endpoint response:')
    console.log('Success:', response.data.success)
    console.log('Provider:', response.data.provider)
    
    if (response.data.success && response.data.data) {
      console.log('\n📝 Generated Content:')
      Object.entries(response.data.data.platforms).forEach(([platform, content]) => {
        console.log(`${platform}: "${content.text}"`)
      })
      console.log('\nHashtags:', response.data.data.hashtags?.join(' '))
      console.log('Model:', response.data.data.metadata?.model)
    }
    
  } catch (error) {
    console.error('❌ LLaMA endpoint test failed:')
    console.error('Status:', error.response?.status)
    console.error('Message:', error.response?.data?.message || error.message)
  }
}

testLlamaEndpoint()
