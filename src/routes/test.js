const express = require('express');
const router = express.Router();

// Test endpoint para verificar la estructura de respuesta del login
router.post('/login-test', async (req, res) => {
  console.log('=== LOGIN TEST ENDPOINT ===');
  console.log('Request body:', req.body);
  
  const testResponse = {
    success: true,
    message: 'Inicio de sesión exitoso',
    data: {
      user: {
        id: 'test-id-123',
        username: 'testuser',
        email: 'test@example.com',
        display_name: 'Test User',
        created_at: new Date().toISOString()
      },
      access_token: 'test-access-token-12345',
      refresh_token: 'test-refresh-token-12345'
    }
  };
  
  console.log('Sending response:', JSON.stringify(testResponse, null, 2));
  
  res.json(testResponse);
});

module.exports = router;
