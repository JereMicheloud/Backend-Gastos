// Test específico para las rutas de auth
const API_BASE_URL = 'http://localhost:3001';

async function testAuthRoutes() {
  console.log('🧪 Probando rutas de autenticación...\n');
  
  // Test 1: Registro con /api
  console.log('1. POST /api/auth/register');
  try {
    const registerResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `test-${Date.now()}@example.com`,
        password: 'password123456',
        username: `testuser${Date.now()}`,
        display_name: 'Test User'
      }),
    });
    
    console.log(`Status: ${registerResponse.status}`);
    const registerData = await registerResponse.json();
    console.log('Response:', registerData);
    
    if (registerData.success && registerData.data.access_token) {
      console.log('✅ Registro exitoso\n');
      
      // Test 2: Login con /api
      console.log('2. POST /api/auth/login');
      const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registerData.data.user.email,
          password: 'password123456'
        }),
      });
      
      console.log(`Status: ${loginResponse.status}`);
      const loginData = await loginResponse.json();
      console.log('Response:', loginData);
      
      if (loginData.success) {
        console.log('✅ Login exitoso\n');
        
        // Test 3: Endpoint protegido
        console.log('3. GET /api/auth/profile (con token)');
        const profileResponse = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${loginData.data.access_token}`
          }
        });
        
        console.log(`Status: ${profileResponse.status}`);
        const profileData = await profileResponse.json();
        console.log('Response:', profileData);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Test 4: Rutas sin /api (deben dar 404)
  console.log('\n4. POST /auth/login (sin /api - debe dar 404)');
  try {
    const noApiResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      }),
    });
    
    console.log(`Status: ${noApiResponse.status}`);
    if (noApiResponse.status === 404) {
      console.log('✅ Correcto: Sin /api da 404');
    } else {
      console.log('⚠️ Inesperado: Sin /api no da 404');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAuthRoutes();
