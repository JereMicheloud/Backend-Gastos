// Script de prueba para verificar endpoints del backend
// Ejecutar con: node test-api.js

const API_BASE_URL = 'https://backend-gastos-v68j.onrender.com';

// Función helper para hacer requests
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    
    console.log(`\n${options.method || 'GET'} ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return { response, data };
  } catch (error) {
    console.error(`Error en ${endpoint}:`, error.message);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Probando endpoints del backend...\n');
  
  // 1. Health Check
  await apiRequest('/health');
  
  // 2. API Root
  await apiRequest('/');
  
  // 3. Test registro (con datos de prueba)
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    username: 'testuser',
    display_name: 'Test User'
  };
  
  await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(testUser),
  });
  
  // 4. Test login
  await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password,
    }),
  });
  
  // 5. Test endpoints protegidos sin token (deberían fallar)
  await apiRequest('/api/transactions');
  await apiRequest('/api/categories');
  
  console.log('\n✅ Pruebas completadas');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { apiRequest, runTests };
