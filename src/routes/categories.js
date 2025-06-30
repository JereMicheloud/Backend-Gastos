const express = require('express');
const CategoryController = require('../controllers/categoryController');
const { authenticateUser } = require('../middleware/auth');
const { validate, categorySchemas } = require('../middleware/validation');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateUser);

// Rutas para estadísticas (deben ir antes de las rutas con parámetros)
router.get('/stats', CategoryController.getStats);

// CRUD de categorías
router.get('/', CategoryController.getCategories);
router.post('/', validate(categorySchemas.create), CategoryController.createCategory);
router.get('/:id', CategoryController.getCategory);
router.put('/:id', validate(categorySchemas.update), CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);

module.exports = router;
