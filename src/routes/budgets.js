const express = require('express');
const BudgetController = require('../controllers/budgetController');
const { authenticateUser } = require('../middleware/auth');
const { validate, budgetSchemas } = require('../middleware/validation');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateUser);

// Rutas especiales (deben ir antes de las rutas con parámetros)
router.get('/summary', BudgetController.getSummary);
router.post('/automatic', BudgetController.createAutomaticBudget);

// CRUD de presupuestos
router.get('/', BudgetController.getBudgets);
router.post('/', validate(budgetSchemas.create), BudgetController.createBudget);
router.get('/:id', BudgetController.getBudget);
router.put('/:id', validate(budgetSchemas.update), BudgetController.updateBudget);
router.delete('/:id', BudgetController.deleteBudget);

// Rutas adicionales
router.get('/:id/spending', BudgetController.getBudgetSpending);

module.exports = router;
