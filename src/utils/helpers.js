// Utilidades generales
const crypto = require('crypto');

// Generar ID único
const generateId = () => {
  return crypto.randomUUID();
};

// Formatear fecha para base de datos
const formatDateForDB = (date) => {
  if (!date) return null;
  return new Date(date).toISOString().split('T')[0];
};

// Validar UUID
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Formatear respuesta de éxito
const successResponse = (data, message = 'Operación exitosa', statusCode = 200) => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

// Formatear respuesta de error
const errorResponse = (message = 'Ha ocurrido un error', statusCode = 500, code = null) => {
  return {
    success: false,
    error: message,
    code,
    timestamp: new Date().toISOString()
  };
};

// Sanitizar entrada de usuario
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remover caracteres potencialmente peligrosos
    .substring(0, 1000); // Limitar longitud
};

// Validar email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generar nombre de archivo único
const generateUniqueFilename = (originalFilename) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const extension = originalFilename.split('.').pop();
  return `${timestamp}_${random}.${extension}`;
};

// Calcular diferencia en días entre fechas
const daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
};

// Formatear moneda
const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Paginar resultados
const paginate = (data, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const paginatedData = data.slice(offset, offset + limit);
  
  return {
    data: paginatedData,
    pagination: {
      current_page: page,
      per_page: limit,
      total: data.length,
      total_pages: Math.ceil(data.length / limit),
      has_next: offset + limit < data.length,
      has_prev: page > 1
    }
  };
};

// Limpiar objeto removiendo propiedades nulas/undefined
const cleanObject = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => 
      value !== null && value !== undefined && value !== ''
    )
  );
};

// Agrupar array por propiedad
const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

// Esperar un tiempo determinado (para testing)
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Capitalizar primera letra
const capitalize = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Generar color aleatorio
const generateRandomColor = () => {
  return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
};

module.exports = {
  generateId,
  formatDateForDB,
  isValidUUID,
  successResponse,
  errorResponse,
  sanitizeInput,
  isValidEmail,
  generateUniqueFilename,
  daysBetween,
  formatCurrency,
  paginate,
  cleanObject,
  groupBy,
  sleep,
  capitalize,
  generateRandomColor
};
