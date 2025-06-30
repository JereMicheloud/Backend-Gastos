const express = require('express');
const UserController = require('../controllers/userController');
const { authenticateUser } = require('../middleware/auth-supabase');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateUser);

// Rutas de usuario
router.get('/me', UserController.getCurrentUser);
router.put('/me', UserController.updateUser);
router.get('/me/stats', UserController.getUserStats);

module.exports = router;
