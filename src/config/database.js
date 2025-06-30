const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

// Configuración de PostgreSQL directo
const pgConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Pool de conexiones PostgreSQL
const pool = new Pool(pgConfig);

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Clientes de Supabase
let supabase = null;
let supabaseAdmin = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  if (supabaseServiceKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
}

// Función para ejecutar queries SQL directas
const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Error en query SQL:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Función para transacciones
const transaction = async (queries) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const results = [];
    
    for (const { text, params } of queries) {
      const result = await client.query(text, params);
      results.push(result);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en transacción:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Test de conexión
const testConnection = async () => {
  try {
    // Test PostgreSQL
    const pgResult = await query('SELECT NOW() as current_time');
    console.log('✅ PostgreSQL conectado:', pgResult.rows[0].current_time);
    
    // Test Supabase
    if (supabase) {
      const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
      if (!error) {
        console.log('✅ Supabase conectado correctamente');
      } else {
        console.log('⚠️ Supabase conexión con advertencia:', error.message);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return false;
  }
};

// Cerrar conexiones
const closeConnections = async () => {
  await pool.end();
  console.log('🔐 Conexiones cerradas');
};

module.exports = {
  // PostgreSQL directo
  pool,
  query,
  transaction,
  
  // Supabase
  supabase,
  supabaseAdmin,
  
  // Utilidades
  testConnection,
  closeConnections
};
