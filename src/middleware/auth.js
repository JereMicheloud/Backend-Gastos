const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Middleware para verificar autenticación
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token de acceso requerido',
        message: 'Debes proporcionar un token Bearer válido'
      });
    }

    const token = authHeader.substring(7); // Remover 'Bearer '
    
    // Verificar el token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Obtener información del usuario desde la base de datos
    const getUserQuery = `
      SELECT id, username, email, display_name, created_at, updated_at
      FROM users WHERE id = $1
    `;
    const userResult = await query(getUserQuery, [decoded.userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Usuario no encontrado',
        message: 'El usuario asociado al token no existe'
      });
    }

    // Agregar información del usuario al request
    req.user = userResult.rows[0];

    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token proporcionado no es válido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'El token ha expirado, por favor inicia sesión nuevamente'
      });
    }
    
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al verificar la autenticación'
    });
  }
};

// Middleware opcional de autenticación (no falla si no hay token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Obtener información del usuario
    const getUserQuery = `
      SELECT id, username, email, display_name, created_at, updated_at
      FROM users WHERE id = $1
    `;
    const userResult = await query(getUserQuery, [decoded.userId]);

    req.user = userResult.rows.length > 0 ? userResult.rows[0] : null;
    next();
  } catch (error) {
    console.error('Error en autenticación opcional:', error);
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateUser,
  optionalAuth
};
