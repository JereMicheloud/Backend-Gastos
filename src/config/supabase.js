const { createClient } = require('@supabase/supabase-js');

// Asegurar que dotenv esté cargado
if (!process.env.SUPABASE_URL) {
  require('dotenv').config();
}

// Configuración de Supabase SDK
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Inicializando Supabase...');
console.log('URL:', supabaseUrl ? '✅ Configurado' : '❌ Faltante');
console.log('ANON_KEY:', supabaseAnonKey ? '✅ Configurado' : '❌ Faltante');

let supabase = null;
let supabaseAdmin = null;

if (supabaseUrl && supabaseAnonKey) {
  console.log('✅ Configurando Supabase SDK...');
  console.log('📍 URL:', supabaseUrl);
  
  try {
    // Cliente público (para operaciones que requieren autenticación de usuario)
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Cliente administrativo (para operaciones que requieren privilegios elevados)
    if (supabaseServiceKey) {
      supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      console.log('🔑 Admin client: Configurado');
    } else {
      console.log('🔑 Admin client: NO configurado (opcional)');
    }
    
    console.log('✅ Supabase SDK configurado correctamente');
  } catch (error) {
    console.error('❌ Error configurando Supabase SDK:', error.message);
  }
} else {
  console.log('⚠️ Variables de Supabase SDK no configuradas.');
  console.log('Variables encontradas:');
  console.log('- SUPABASE_URL:', supabaseUrl || 'FALTANTE');
  console.log('- SUPABASE_ANON_KEY:', supabaseAnonKey ? 'PRESENTE' : 'FALTANTE');
  
  // Mostrar todas las variables de entorno para debug
  console.log('\n🔍 Debug - Variables de entorno relacionadas:');
  Object.keys(process.env)
    .filter(key => key.includes('SUPABASE'))
    .forEach(key => {
      console.log(`${key}: ${process.env[key] ? 'PRESENTE' : 'FALTANTE'}`);
    });
}

module.exports = {
  supabase,
  supabaseAdmin
};
