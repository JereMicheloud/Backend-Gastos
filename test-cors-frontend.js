// Prueba de CORS desde el frontend
// Ejecuta esto en la consola del navegador de tu app de Vercel

const API_URL = 'https://backend-gastos-v68j.onrender.com';

async function testCORS() {
  console.log('🧪 Probando CORS desde frontend...');
  
  try {
    // Test 1: Health check
    console.log('1. Probando health check...');
    const healthResponse = await fetch(`${API_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test 2: CORS preflight
    console.log('2. Probando CORS con POST...');
    const corsResponse = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123',
        username: 'testuser',
        display_name: 'Test User'
      }),
    });
    
    if (corsResponse.ok) {
      console.log('✅ CORS funciona correctamente');
    } else {
      console.log('⚠️ Respuesta del servidor:', corsResponse.status);
      const errorData = await corsResponse.json();
      console.log('Datos:', errorData);
    }
    
  } catch (error) {
    if (error.message.includes('CORS')) {
      console.log('❌ Error de CORS:', error.message);
      console.log('💡 Solución: Configurar CORS_ORIGINS en Render');
    } else {
      console.log('❌ Otro error:', error.message);
    }
  }
}

testCORS();
