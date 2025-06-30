const Joi = require('joi');

// Esquemas de validación para autenticación
const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Debe ser un email válido',
        'any.required': 'El email es requerido'
      }),
    password: Joi.string().min(6).required()
      .messages({
        'string.min': 'La contraseña debe tener al menos 6 caracteres',
        'any.required': 'La contraseña es requerida'
      }),
    username: Joi.string().alphanum().min(3).max(50).required()
      .messages({
        'string.alphanum': 'El nombre de usuario solo puede contener letras y números',
        'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
        'string.max': 'El nombre de usuario no puede tener más de 50 caracteres',
        'any.required': 'El nombre de usuario es requerido'
      }),
    display_name: Joi.string().min(1).max(100).required()
      .messages({
        'string.min': 'El nombre para mostrar es requerido',
        'string.max': 'El nombre para mostrar no puede tener más de 100 caracteres',
        'any.required': 'El nombre para mostrar es requerido'
      })
  }),

  login: Joi.object({
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Debe ser un email válido',
        'any.required': 'El email es requerido'
      }),
    password: Joi.string().required()
      .messages({
        'any.required': 'La contraseña es requerida'
      })
  })
};

// Esquemas de validación para transacciones
const transactionSchemas = {
  create: Joi.object({
    amount: Joi.number().positive().precision(2).required()
      .messages({
        'number.positive': 'El monto debe ser un número positivo',
        'any.required': 'El monto es requerido'
      }),
    description: Joi.string().min(1).max(500).required()
      .messages({
        'string.min': 'La descripción es requerida',
        'string.max': 'La descripción no puede tener más de 500 caracteres',
        'any.required': 'La descripción es requerida'
      }),
    category_id: Joi.string().uuid().required()
      .messages({
        'string.uuid': 'ID de categoría inválido',
        'any.required': 'La categoría es requerida'
      }),
    type: Joi.string().valid('income', 'expense').required()
      .messages({
        'any.only': 'El tipo debe ser "income" o "expense"',
        'any.required': 'El tipo de transacción es requerido'
      }),
    transaction_date: Joi.date().iso().required()
      .messages({
        'date.iso': 'La fecha debe estar en formato ISO',
        'any.required': 'La fecha es requerida'
      }),
    payee: Joi.string().max(255).optional()
      .messages({
        'string.max': 'El beneficiario no puede tener más de 255 caracteres'
      })
  }),

  update: Joi.object({
    amount: Joi.number().positive().precision(2).optional()
      .messages({
        'number.positive': 'El monto debe ser un número positivo'
      }),
    description: Joi.string().min(1).max(500).optional()
      .messages({
        'string.min': 'La descripción no puede estar vacía',
        'string.max': 'La descripción no puede tener más de 500 caracteres'
      }),
    category_id: Joi.string().uuid().optional()
      .messages({
        'string.uuid': 'ID de categoría inválido'
      }),
    type: Joi.string().valid('income', 'expense').optional()
      .messages({
        'any.only': 'El tipo debe ser "income" o "expense"'
      }),
    transaction_date: Joi.date().iso().optional()
      .messages({
        'date.iso': 'La fecha debe estar en formato ISO'
      }),
    payee: Joi.string().max(255).optional()
      .messages({
        'string.max': 'El beneficiario no puede tener más de 255 caracteres'
      })
  }).min(1)
};

// Esquemas de validación para categorías
const categorySchemas = {
  create: Joi.object({
    name: Joi.string().min(1).max(100).required()
      .messages({
        'string.min': 'El nombre de la categoría es requerido',
        'string.max': 'El nombre no puede tener más de 100 caracteres',
        'any.required': 'El nombre de la categoría es requerido'
      }),
    icon: Joi.string().max(50).optional().default('folder')
      .messages({
        'string.max': 'El icono no puede tener más de 50 caracteres'
      }),
    color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional().default('#6B7280')
      .messages({
        'string.pattern.base': 'El color debe ser un código hexadecimal válido (ej: #FF0000)'
      })
  }),

  update: Joi.object({
    name: Joi.string().min(1).max(100).optional()
      .messages({
        'string.min': 'El nombre de la categoría no puede estar vacío',
        'string.max': 'El nombre no puede tener más de 100 caracteres'
      }),
    icon: Joi.string().max(50).optional()
      .messages({
        'string.max': 'El icono no puede tener más de 50 caracteres'
      }),
    color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional()
      .messages({
        'string.pattern.base': 'El color debe ser un código hexadecimal válido (ej: #FF0000)'
      })
  }).min(1)
};

// Esquemas de validación para presupuestos
const budgetSchemas = {
  create: Joi.object({
    category_id: Joi.string().uuid().required()
      .messages({
        'string.uuid': 'ID de categoría inválido',
        'any.required': 'La categoría es requerida'
      }),
    amount: Joi.number().positive().precision(2).required()
      .messages({
        'number.positive': 'El monto debe ser un número positivo',
        'any.required': 'El monto es requerido'
      }),
    period: Joi.string().valid('weekly', 'monthly', 'yearly').required()
      .messages({
        'any.only': 'El período debe ser "weekly", "monthly" o "yearly"',
        'any.required': 'El período es requerido'
      }),
    start_date: Joi.date().iso().required()
      .messages({
        'date.iso': 'La fecha de inicio debe estar en formato ISO',
        'any.required': 'La fecha de inicio es requerida'
      }),
    end_date: Joi.date().iso().min(Joi.ref('start_date')).required()
      .messages({
        'date.iso': 'La fecha de fin debe estar en formato ISO',
        'date.min': 'La fecha de fin debe ser posterior a la fecha de inicio',
        'any.required': 'La fecha de fin es requerida'
      })
  }),

  update: Joi.object({
    category_id: Joi.string().uuid().optional()
      .messages({
        'string.uuid': 'ID de categoría inválido'
      }),
    amount: Joi.number().positive().precision(2).optional()
      .messages({
        'number.positive': 'El monto debe ser un número positivo'
      }),
    period: Joi.string().valid('weekly', 'monthly', 'yearly').optional()
      .messages({
        'any.only': 'El período debe ser "weekly", "monthly" o "yearly"'
      }),
    start_date: Joi.date().iso().optional()
      .messages({
        'date.iso': 'La fecha de inicio debe estar en formato ISO'
      }),
    end_date: Joi.date().iso().optional()
      .messages({
        'date.iso': 'La fecha de fin debe estar en formato ISO'
      })
  }).min(1)
};

// Middleware de validación
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      error.isJoi = true;
      return next(error);
    }
    
    req.body = value;
    next();
  };
};

module.exports = {
  authSchemas,
  transactionSchemas,
  categorySchemas,
  budgetSchemas,
  validate
};
