import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

async function testLlamaAPI() {
  console.log('🦙 Testing LLaMA API Integration...\n')
  
  try {
    // Test the actual API endpoint that the frontend will use
    console.log('1. Testing LLaMA status endpoint...')
    const statusResponse = await axios.get('http://localhost:5000/api/ai/llama-status', {
      headers: {
        'Authorization': 'Bearer demo-token' // We'll need to handle auth properly
      }
    })
    console.log('Status Response:', JSON.stringify(statusResponse.data, null, 2))
    
  } catch (error) {
    console.log('Status check failed (expected - needs authentication)')
    
    // Test direct Hugging Face API call
    console.log('\n2. Testing direct Hugging Face API call...')
    try {
      const hfResponse = await axios.post(
        'https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf',
        {
          inputs: "Create a professional social media post about AI innovation in business.",
          parameters: {
            max_new_tokens: 100,
            temperature: 0.7,
            top_p: 0.9,
            do_sample: true,
            return_full_text: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      console.log('✅ Direct Hugging Face API call successful!')
      console.log('Response:', hfResponse.data)
      
    } catch (hfError) {
      console.log('❌ Hugging Face API call failed:', hfError.response?.data || hfError.message)
    }
  }
}

testLlamaAPI()
