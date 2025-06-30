const { createClient } = require('@supabase/supabase-js');

// Configuración opcional de Supabase SDK
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
let supabaseAdmin = null;

if (supabaseUrl && supabaseAnonKey) {
  console.log('✅ Configurando Supabase SDK...');
  console.log('📍 URL:', supabaseUrl);
  
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
} else {
  console.log('⚠️ Variables de Supabase SDK no configuradas. Usando solo conexión directa a PostgreSQL.');
  console.log('� Para usar Supabase SDK, configura SUPABASE_URL y SUPABASE_ANON_KEY en el .env');
}

module.exports = {
  supabase,
  supabaseAdmin
};
