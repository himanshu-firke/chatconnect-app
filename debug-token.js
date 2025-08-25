const AsyncStorage = require('@react-native-async-storage/async-storage');

async function debugToken() {
  try {
    console.log('🔍 Debugging token storage...\n');
    
    const accessToken = await AsyncStorage.getItem('accessToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    const user = await AsyncStorage.getItem('user');
    
    console.log('Access Token:', accessToken ? 'EXISTS' : 'NOT FOUND');
    console.log('Refresh Token:', refreshToken ? 'EXISTS' : 'NOT FOUND');
    console.log('User Data:', user ? 'EXISTS' : 'NOT FOUND');
    
    if (accessToken) {
      console.log('\nToken Preview:', accessToken.substring(0, 50) + '...');
    }
    
    if (user) {
      console.log('\nUser Data:', JSON.parse(user));
    }
    
  } catch (error) {
    console.error('❌ Error debugging token:', error);
  }
}

debugToken();
