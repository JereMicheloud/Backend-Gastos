const BudgetService = require('../services/budgetService');
const { asyncHandler } = require('../middleware/errorHandler');

class BudgetController {
  // Obtener todos los presupuestos del usuario
  static getBudgets = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const budgets = await BudgetService.getUserBudgets(userId);

    res.json({
      success: true,
      data: budgets,
      count: budgets.length
    });
  });

  // Obtener presupuesto específico
  static getBudget = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const budget = await BudgetService.getBudgetById(id, userId);

    res.json({
      success: true,
      data: budget
    });
  });

  // Crear nuevo presupuesto
  static createBudget = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const budgetData = req.body;

    const budget = await BudgetService.createBudget(userId, budgetData);

    res.status(201).json({
      success: true,
      message: 'Presupuesto creado exitosamente',
      data: budget
    });
  });

  // Actualizar presupuesto
  static updateBudget = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const budget = await BudgetService.updateBudget(id, userId, updates);

    res.json({
      success: true,
      message: 'Presupuesto actualizado exitosamente',
      data: budget
    });
  });

  // Eliminar presupuesto
  static deleteBudget = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    await BudgetService.deleteBudget(id, userId);

    res.json({
      success: true,
      message: 'Presupuesto eliminado exitosamente'
    });
  });

  // Obtener resumen de presupuestos
  static getSummary = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const summary = await BudgetService.getBudgetSummary(userId);

    res.json({
      success: true,
      data: summary
    });
  });

  // Crear presupuesto automático
  static createAutomaticBudget = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { category_id, period = 'monthly', multiplier = 1.1 } = req.body;

    const budget = await BudgetService.createAutomaticBudget(userId, category_id, period, multiplier);

    res.status(201).json({
      success: true,
      message: 'Presupuesto automático creado exitosamente',
      data: budget
    });
  });

  // Obtener gasto de un presupuesto
  static getBudgetSpending = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const spending = await BudgetService.getBudgetSpending(id, userId);

    res.json({
      success: true,
      data: spending
    });
  });
}

module.exports = BudgetController;
