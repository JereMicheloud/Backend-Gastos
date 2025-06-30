const CategoryService = require('../services/categoryService');
const { asyncHandler } = require('../middleware/errorHandler');

class CategoryController {
  // Obtener todas las categorías del usuario
  static getCategories = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const categories = await CategoryService.getUserCategories(userId);

    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  });

  // Obtener categoría específica
  static getCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const category = await CategoryService.getCategoryById(id, userId);

    res.json({
      success: true,
      data: category
    });
  });

  // Crear nueva categoría
  static createCategory = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const categoryData = req.body;

    const category = await CategoryService.createCategory(userId, categoryData);

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: category
    });
  });

  // Actualizar categoría
  static updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const category = await CategoryService.updateCategory(id, userId, updates);

    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: category
    });
  });

  // Eliminar categoría
  static deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    await CategoryService.deleteCategory(id, userId);

    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
  });

  // Obtener estadísticas de categorías
  static getStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const period = req.query.period || 'month';

    const stats = await CategoryService.getCategoryStats(userId, period);

    res.json({
      success: true,
      data: stats
    });
  });
}

module.exports = CategoryController;
