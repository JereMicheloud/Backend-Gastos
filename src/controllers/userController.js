const AuthService = require('../services/authService');
const { asyncHandler } = require('../middleware/errorHandler');

class UserController {
  // Obtener información del usuario actual
  static getCurrentUser = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const user = await AuthService.getUserProfile(userId);

    res.json({
      success: true,
      data: user
    });
  });

  // Actualizar información del usuario
  static updateUser = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const updates = req.body;
    
    const updatedUser = await AuthService.updateUserProfile(userId, updates);

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: updatedUser
    });
  });

  // Obtener estadísticas generales del usuario
  static getUserStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    // Aquí puedes agregar lógica para obtener estadísticas generales
    // Por ahora retornamos información básica
    const user = await AuthService.getUserProfile(userId);

    res.json({
      success: true,
      data: {
        user: user,
        joined_date: user.created_at,
        // Aquí puedes agregar más estadísticas como:
        // total_transactions, total_categories, etc.
      }
    });
  });
}

module.exports = UserController;
