const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Endpoint para revisar restricciones de la tabla users
router.get('/debug/users-constraints', async (req, res) => {
  try {
    console.log('🔍 Revisando restricciones de la tabla users...');
    
    // Obtener todas las restricciones de la tabla users
    const constraintsQuery = `
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.table_name = 'users'
        AND tc.table_schema = 'public'
      ORDER BY tc.constraint_type, tc.constraint_name;
    `;
    
    const constraintsResult = await db.query(constraintsQuery);
    console.log('📋 Restricciones de la tabla users:', constraintsResult.rows);
    
    res.json({
      success: true,
      message: 'Restricciones obtenidas',
      data: {
        constraints: constraintsResult.rows
      }
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo restricciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo restricciones',
      error: error.message
    });
  }
});

// Endpoint para eliminar restricción problemática
router.post('/debug/fix-constraints', async (req, res) => {
  try {
    console.log('🔧 Corrigiendo restricciones problemáticas...');
    
    const fixes = [];
    
    // Primero, identificar la restricción problemática
    const problemConstraintQuery = `
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'users' 
        AND constraint_name = 'users_id_fkey'
        AND table_schema = 'public';
    `;
    
    const problemResult = await db.query(problemConstraintQuery);
    
    if (problemResult.rows.length > 0) {
      // Eliminar la restricción problemática
      await db.query('ALTER TABLE public.users DROP CONSTRAINT users_id_fkey');
      fixes.push('Restricción users_id_fkey eliminada');
    }
    
    // Verificar restricciones finales
    const finalConstraintsQuery = `
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints 
      WHERE table_name = 'users' 
        AND table_schema = 'public'
      ORDER BY constraint_type, constraint_name;
    `;
    
    const finalResult = await db.query(finalConstraintsQuery);
    
    res.json({
      success: true,
      message: 'Restricciones corregidas',
      data: {
        fixes: fixes,
        remainingConstraints: finalResult.rows
      }
    });
    
  } catch (error) {
    console.error('❌ Error corrigiendo restricciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error corrigiendo restricciones',
      error: error.message
    });
  }
});

module.exports = router;
