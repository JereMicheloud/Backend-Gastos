const express = require('express');
const router = express.Router();

// Endpoint de debug para ver la configuración
router.get('/config', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
    supabaseUrl: process.env.SUPABASE_URL ? 'CONFIGURADO' : 'FALTANTE',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY ? 'CONFIGURADO' : 'FALTANTE',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'CONFIGURADO' : 'FALTANTE',
    allSupabaseVars: Object.keys(process.env)
      .filter(key => key.includes('SUPABASE'))
      .reduce((acc, key) => {
        acc[key] = process.env[key] ? 'PRESENTE' : 'FALTANTE';
        return acc;
      }, {}),
    timestamp: new Date().toISOString()
  });
});

// Test simple de Supabase
router.get('/supabase-test', async (req, res) => {
  try {
    const { supabase } = require('../config/supabase');
    
    if (!supabase) {
      return res.status(500).json({
        error: 'Cliente de Supabase no inicializado',
        config: {
          url: process.env.SUPABASE_URL ? 'OK' : 'FALTANTE',
          key: process.env.SUPABASE_ANON_KEY ? 'OK' : 'FALTANTE'
        }
      });
    }

    // Test básico
    const { data, error } = await supabase.auth.getUser();
    
    res.json({
      success: true,
      supabaseClient: 'INICIALIZADO',
      authTest: error ? error.message : 'OK',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
