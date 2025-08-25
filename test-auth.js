const axios = require('axios');

const API_BASE_URL = 'http://10.28.125.29:3001/api';

async function testAuth() {
  try {
    console.log('🧪 Testing Authentication Endpoints...\n');
    
    // Test login with demo user
    console.log('1. Testing login with demo user alice...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'alice@chatconnect.demo',
      password: 'password123'
    });
    
    console.log('✅ Login successful!');
    console.log('User:', loginResponse.data.data.user.username);
    console.log('Token received:', loginResponse.data.data.accessToken ? 'Yes' : 'No');
    
    // Test registration
    console.log('\n2. Testing registration with new user...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      username: 'testuser123',
      email: 'testuser@example.com',
      password: 'password123'
    });
    
    console.log('✅ Registration successful!');
    console.log('User:', registerResponse.data.data.user.username);
    console.log('Token received:', registerResponse.data.data.accessToken ? 'Yes' : 'No');
    
    console.log('\n🎉 All authentication tests passed!');
    
  } catch (error) {
    console.error('❌ Authentication test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAuth();
