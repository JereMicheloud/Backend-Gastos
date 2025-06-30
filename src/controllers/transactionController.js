const TransactionService = require('../services/transactionService');
const { asyncHandler } = require('../middleware/errorHandler');

class TransactionController {
  // Obtener todas las transacciones del usuario
  static getTransactions = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const filters = {
      type: req.query.type,
      category_id: req.query.category_id,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      limit: req.query.limit
    };

    // Remover filtros vacíos
    Object.keys(filters).forEach(key => {
      if (!filters[key]) delete filters[key];
    });

    const transactions = await TransactionService.getUserTransactions(userId, filters);

    res.json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  });

  // Obtener transacción específica
  static getTransaction = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const transaction = await TransactionService.getTransactionById(id, userId);

    res.json({
      success: true,
      data: transaction
    });
  });

  // Crear nueva transacción
  static createTransaction = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const transactionData = req.body;

    const transaction = await TransactionService.createTransaction(userId, transactionData);

    res.status(201).json({
      success: true,
      message: 'Transacción creada exitosamente',
      data: transaction
    });
  });

  // Actualizar transacción
  static updateTransaction = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const transaction = await TransactionService.updateTransaction(id, userId, updates);

    res.json({
      success: true,
      message: 'Transacción actualizada exitosamente',
      data: transaction
    });
  });

  // Eliminar transacción
  static deleteTransaction = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    await TransactionService.deleteTransaction(id, userId);

    res.json({
      success: true,
      message: 'Transacción eliminada exitosamente'
    });
  });

  // Obtener estadísticas de transacciones
  static getStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const period = req.query.period || 'month';

    const stats = await TransactionService.getTransactionStats(userId, period);

    res.json({
      success: true,
      data: stats
    });
  });

  // Obtener tendencias mensuales
  static getMonthlyTrends = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const months = parseInt(req.query.months) || 6;

    const trends = await TransactionService.getMonthlyTrends(userId, months);

    res.json({
      success: true,
      data: trends
    });
  });
}

module.exports = TransactionController;
