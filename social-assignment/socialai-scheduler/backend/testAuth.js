// Simple test to create demo user and test authentication
const testAuth = async () => {
  try {
    // Test registration
    const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Demo User',
        email: 'demo@socialai.com',
        password: 'demo123'
      })
    });

    const registerData = await registerResponse.json();
    console.log('Registration:', registerData);

    // Test login
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'demo@socialai.com',
        password: 'demo123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login:', loginData);

  } catch (error) {
    console.error('Auth test failed:', error);
  }
};

testAuth();
