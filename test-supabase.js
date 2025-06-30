// Test de conexión a Supabase
const { supabase } = require('./src/config/supabase');

async function testSupabaseConnection() {
  console.log('🔍 Probando conexión a Supabase...\n');
  
  try {
    // Test 1: Verificar configuración
    console.log('1. Configuración:');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Configurado' : '❌ Faltante');
    console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ Faltante');
    
    if (!supabase) {
      console.log('❌ Cliente de Supabase no inicializado');
      return;
    }
    
    // Test 2: Verificar autenticación
    console.log('\n2. Test de autenticación:');
    const { data: authData, error: authError } = await supabase.auth.getUser();
    console.log('Auth status:', authError ? `❌ ${authError.message}` : '✅ OK');
    
    // Test 3: Verificar acceso a la base de datos
    console.log('\n3. Test de base de datos:');
    const { data: dbData, error: dbError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    console.log('DB access:', dbError ? `❌ ${dbError.message}` : '✅ OK');
    
    // Test 4: Probar registro de usuario
    console.log('\n4. Test de registro:');
    const testEmail = `test-${Date.now()}@example.com`;
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123',
      options: {
        data: {
          username: 'testuser',
          display_name: 'Test User'
        }
      }
    });
    
    if (signUpError) {
      console.log('Registro:', `❌ ${signUpError.message}`);
    } else {
      console.log('Registro:', '✅ OK');
      console.log('User ID:', signUpData.user?.id);
      console.log('Email confirmed:', signUpData.user?.email_confirmed_at ? 'Yes' : 'No');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Cargar variables de entorno
require('dotenv').config();

testSupabaseConnection();
