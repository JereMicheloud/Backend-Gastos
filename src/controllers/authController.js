const AuthService = require('../services/authService-supabase');
const { asyncHandler } = require('../middleware/errorHandler');

class AuthController {
  // Registrar nuevo usuario
  static register = asyncHandler(async (req, res) => {
    const { email, password, username, display_name } = req.body;
    
    const result = await AuthService.registerUser({
      email,
      password,
      username,
      display_name
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: result.user,
        access_token: result.session?.access_token,
        refresh_token: result.session?.refresh_token
      }
    });
  });

  // Iniciar sesión
  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    const result = await AuthService.loginUser({ email, password });

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: result.user,
        access_token: result.session?.access_token,
        refresh_token: result.session?.refresh_token
      }
    });
  });

  // Cerrar sesión
  static logout = asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.substring(7); // Remover 'Bearer '
    
    if (token) {
      await AuthService.logoutUser(token);
    }

    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  });

  // Obtener perfil del usuario
  static getProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const profile = await AuthService.getUserProfile(userId);

    res.json({
      success: true,
      data: profile
    });
  });

  // Actualizar perfil del usuario
  static updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const updates = req.body;
    
    const updatedProfile = await AuthService.updateUserProfile(userId, updates);

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: updatedProfile
    });
  });

  // Verificar token (para middleware de autenticación)
  static verifyToken = asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: 'Token válido',
      data: req.user
    });
  });
}

module.exports = AuthController;
