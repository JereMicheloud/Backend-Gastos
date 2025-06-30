const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticateUser, optionalAuth } = require('../middleware/auth-supabase');
const { validate, authSchemas } = require('../middleware/validation');

const router = express.Router();

// Rutas públicas (no requieren autenticación)
router.post('/register', validate(authSchemas.register), AuthController.register);
router.post('/login', validate(authSchemas.login), AuthController.login);

// Rutas protegidas (requieren autenticación)
router.use(authenticateUser);

router.post('/logout', AuthController.logout);
router.get('/profile', AuthController.getProfile);
router.put('/profile', AuthController.updateProfile);
router.get('/verify', AuthController.verifyToken);

module.exports = router;
