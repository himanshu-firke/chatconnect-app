import axios from 'axios'

async function testImageAPI() {
  try {
    console.log('🎨 Testing Image Generation API...')
    
    const response = await axios.post('http://localhost:5001/api/ai/generate-image', {
      prompt: 'A beautiful sunset over mountains',
      style: 'realistic',
      size: '1024x1024'
    }, {
      headers: {
        'Authorization': 'Bearer test-token', // This will fail auth but show us the error
        'Content-Type': 'application/json'
      }
    })
    
    console.log('✅ Success:', response.data)
  } catch (error) {
    if (error.response) {
      console.log('Response status:', error.response.status)
      console.log('Response data:', error.response.data)
      
      if (error.response.status === 401) {
        console.log('🔐 Authentication required - this is expected for the API endpoint')
      }
    } else {
      console.error('❌ Error:', error.message)
    }
  }
}

testImageAPI()
