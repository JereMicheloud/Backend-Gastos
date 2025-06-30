const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Endpoint temporal para diagnosticar la tabla users
router.get('/debug/users-table', async (req, res) => {
  try {
    console.log('🔍 Diagnosticando tabla users...');
    
    // Verificar estructura de la tabla users
    const structureQuery = `
      SELECT column_name, data_type, column_default, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    const structureResult = await db.query(structureQuery);
    console.log('📋 Estructura de la tabla users:', structureResult.rows);
    
    // Verificar si la columna id tiene DEFAULT
    const idColumn = structureResult.rows.find(row => row.column_name === 'id');
    
    const diagnosticInfo = {
      structure: structureResult.rows,
      idColumn: idColumn,
      hasDefaultId: idColumn && idColumn.column_default && idColumn.column_default.includes('gen_random_uuid'),
      hasPasswordHash: structureResult.rows.some(row => row.column_name === 'password_hash')
    };
    
    res.json({
      success: true,
      message: 'Diagnóstico completado',
      data: diagnosticInfo
    });
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    res.status(500).json({
      success: false,
      message: 'Error en diagnóstico',
      error: error.message
    });
  }
});

// Endpoint temporal para corregir la tabla users
router.post('/debug/fix-users-table', async (req, res) => {
  try {
    console.log('🔧 Corrigiendo tabla users...');
    
    const fixes = [];
    
    // Verificar estructura actual
    const structureQuery = `
      SELECT column_name, data_type, column_default, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    const structureResult = await db.query(structureQuery);
    const idColumn = structureResult.rows.find(row => row.column_name === 'id');
    
    // Corregir DEFAULT para id si es necesario
    if (idColumn && (!idColumn.column_default || !idColumn.column_default.includes('gen_random_uuid'))) {
      await db.query('ALTER TABLE public.users ALTER COLUMN id SET DEFAULT gen_random_uuid()');
      fixes.push('DEFAULT gen_random_uuid() agregado para campo id');
    }
    
    // Verificar si existe password_hash
    const passwordColumn = structureResult.rows.find(row => row.column_name === 'password_hash');
    if (!passwordColumn) {
      await db.query('ALTER TABLE public.users ADD COLUMN password_hash VARCHAR(255)');
      fixes.push('Columna password_hash agregada');
    }
    
    // Verificar estructura final
    const finalResult = await db.query(structureQuery);
    
    res.json({
      success: true,
      message: 'Correcciones aplicadas',
      data: {
        fixes: fixes,
        newStructure: finalResult.rows
      }
    });
    
  } catch (error) {
    console.error('❌ Error aplicando correcciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error aplicando correcciones',
      error: error.message
    });
  }
});

module.exports = router;
