const express = require('express');
const TransactionController = require('../controllers/transactionController');
const { authenticateUser } = require('../middleware/auth-supabase');
const { validate, transactionSchemas } = require('../middleware/validation');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateUser);

// Rutas para estadísticas (deben ir antes de las rutas con parámetros)
router.get('/stats', TransactionController.getStats);
router.get('/trends', TransactionController.getMonthlyTrends);

// CRUD de transacciones
router.get('/', TransactionController.getTransactions);
router.post('/', validate(transactionSchemas.create), TransactionController.createTransaction);
router.get('/:id', TransactionController.getTransaction);
router.put('/:id', validate(transactionSchemas.update), TransactionController.updateTransaction);
router.delete('/:id', TransactionController.deleteTransaction);

module.exports = router;
