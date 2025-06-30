// Middleware global de manejo de errores
const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Error de validación de Joi
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Error de validación',
      message: 'Los datos proporcionados no son válidos',
      details: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  // Error de Supabase
  if (err.code && err.message) {
    const statusCode = getSupabaseErrorStatus(err.code);
    return res.status(statusCode).json({
      error: 'Error de base de datos',
      message: getSupabaseErrorMessage(err.code, err.message),
      code: err.code
    });
  }

  // Error de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'JSON inválido',
      message: 'El formato del JSON enviado no es válido'
    });
  }

  // Error personalizado con código de estado
  if (err.statusCode || err.status) {
    return res.status(err.statusCode || err.status).json({
      error: err.name || 'Error',
      message: err.message || 'Ha ocurrido un error'
    });
  }

  // Error genérico del servidor
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'production' 
      ? 'Ha ocurrido un error inesperado'
      : err.message
  });
};

// Mapear códigos de error de Supabase a códigos HTTP
const getSupabaseErrorStatus = (code) => {
  const errorMap = {
    '23505': 409, // unique_violation
    '23503': 400, // foreign_key_violation
    '23502': 400, // not_null_violation
    '23514': 400, // check_violation
    '42P01': 500, // undefined_table
    '42703': 500, // undefined_column
    'PGRST116': 404, // no rows returned
    'PGRST204': 400, // invalid range
  };
  
  return errorMap[code] || 500;
};

// Obtener mensaje de error más amigable
const getSupabaseErrorMessage = (code, originalMessage) => {
  const messageMap = {
    '23505': 'El registro ya existe',
    '23503': 'Referencia inválida a otro registro',
    '23502': 'Campo requerido faltante',
    '23514': 'Valor no permitido',
    'PGRST116': 'Registro no encontrado',
    'PGRST204': 'Rango de datos inválido',
  };
  
  return messageMap[code] || originalMessage;
};

// Crear error personalizado
const createError = (status, message, code = null) => {
  const error = new Error(message);
  error.statusCode = status;
  if (code) error.code = code;
  return error;
};

// Wrapper para async functions que captura errores automáticamente
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  createError,
  asyncHandler
};
