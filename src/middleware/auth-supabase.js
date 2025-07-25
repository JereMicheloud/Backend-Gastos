const { supabase } = require('../config/supabase');

// Middleware para verificar autenticación con Supabase
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
    
    // Verificar el token con Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token proporcionado no es válido o ha expirado'
      });
    }

    // Obtener información adicional del usuario desde la tabla users
    let userData = null;
    try {
      const { data: userDataResult } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      userData = userDataResult;
    } catch (userError) {
      console.log('Info: No se pudo obtener datos adicionales del usuario (tabla users)');
    }

    // Agregar información del usuario al request
    req.user = {
      id: user.id,
      email: user.email,
      username: userData?.username || user.user_metadata?.username || '',
      display_name: userData?.display_name || user.user_metadata?.display_name || user.user_metadata?.full_name || '',
      email_confirmed: user.email_confirmed_at ? true : false,
      ...userData
    };

    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    res.status(401).json({
      error: 'Token inválido',
      message: 'El token proporcionado no es válido o ha expirado'
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
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      req.user = null;
      return next();
    }

    // Obtener información adicional del usuario
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email,
      username: userData?.username || '',
      display_name: userData?.display_name || '',
      email_confirmed: user.email_confirmed_at ? true : false,
      ...userData
    };

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
