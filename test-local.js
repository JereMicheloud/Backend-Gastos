// Test local del API
const API_BASE_URL = 'http://localhost:3003';

async function testLocalAPI() {
  console.log('🧪 Probando API local...\n');
  
  // Test registro
  const testUser = {
    email: 'jeremy.test@gmail.com',
    password: 'password123456',
    username: 'jeremytest',
    display_name: 'Jeremy Test'
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const data = await response.json();
    console.log('Registro:', response.status, data);
    
    if (data.success && data.data.access_token) {
      console.log('✅ Registro exitoso!');
      
      // Test con token
      const tokenResponse = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${data.data.access_token}`
        }
      });
      
      const profileData = await tokenResponse.json();
      console.log('Perfil:', tokenResponse.status, profileData);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testLocalAPI();
