# 🚀 Backend Deployado - Información de Producción

## URL de Producción
**URL Base:** `https://backend-gastos-v68j.onrender.com`

## Estado Actual
✅ **Backend funcionando correctamente**
- Health Check: `https://backend-gastos-v68j.onrender.com/health`
- API Root: `https://backend-gastos-v68j.onrender.com/`
- Entorno: `production`

## Endpoints Disponibles

### 🔗 Endpoints Base
- **Health Check:** `GET /health`
- **API Info:** `GET /`

### 🔐 Autenticación
- **Registro:** `POST /api/auth/register`
- **Login:** `POST /api/auth/login`
- **Logout:** `POST /api/auth/logout`
- **Perfil:** `GET /api/auth/profile`

### 💰 Transacciones
- **Listar:** `GET /api/transactions`
- **Crear:** `POST /api/transactions`
- **Obtener:** `GET /api/transactions/:id`
- **Actualizar:** `PUT /api/transactions/:id`
- **Eliminar:** `DELETE /api/transactions/:id`
- **Estadísticas:** `GET /api/transactions/stats`

### 📂 Categorías
- **Listar:** `GET /api/categories`
- **Crear:** `POST /api/categories`
- **Actualizar:** `PUT /api/categories/:id`
- **Eliminar:** `DELETE /api/categories/:id`

### 💳 Presupuestos
- **Listar:** `GET /api/budgets`
- **Crear:** `POST /api/budgets`
- **Actualizar:** `PUT /api/budgets/:id`
- **Eliminar:** `DELETE /api/budgets/:id`

### 👤 Usuarios
- **Perfil:** `GET /api/users/profile`
- **Actualizar:** `PUT /api/users/profile`

## Configuración de Frontend

Para conectar tu frontend con este backend, usa estas configuraciones:

### Variables de Entorno del Frontend
```bash
# Next.js
NEXT_PUBLIC_API_URL=https://backend-gastos-v68j.onrender.com

# React/Vite
VITE_API_URL=https://backend-gastos-v68j.onrender.com

# Nuxt.js
NUXT_PUBLIC_API_URL=https://backend-gastos-v68j.onrender.com
```

### Ejemplo de Uso en JavaScript
```javascript
// Configuración base
const API_BASE_URL = 'https://backend-gastos-v68j.onrender.com';

// Función para hacer requests autenticados
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token'); // o tu método de almacenamiento
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Ejemplo de uso
// Login
const login = async (email, password) => {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

// Obtener transacciones
const getTransactions = async () => {
  return apiRequest('/api/transactions');
};

// Crear transacción
const createTransaction = async (transactionData) => {
  return apiRequest('/api/transactions', {
    method: 'POST',
    body: JSON.stringify(transactionData),
  });
};
```

## Autenticación

El backend usa JWT para autenticación. Después del login, incluye el token en todas las requests:

```javascript
// Header requerido para endpoints protegidos
{
  "Authorization": "Bearer tu_jwt_token_aqui"
}
```

## Estructura de Datos

### Usuario
```javascript
{
  "id": "uuid",
  "email": "string",
  "name": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Transacción
```javascript
{
  "id": "uuid",
  "user_id": "uuid",
  "amount": "number",
  "description": "string",
  "type": "income" | "expense",
  "category_id": "uuid",
  "transaction_date": "date",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Categoría
```javascript
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "string",
  "color": "string",
  "type": "income" | "expense" | "both",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

## Rate Limiting

- **Límite:** 100 requests por 15 minutos
- **Headers de respuesta:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## CORS

El backend acepta requests desde:
- `http://localhost:3000` (desarrollo)
- `http://localhost:9002` (desarrollo)
- Agrega tu dominio de frontend en las variables de entorno de Render

## Actualizaciones de Deployment

Para actualizar el backend:

1. **Hacer push a tu repositorio de GitHub**
2. **Render se redesplegará automáticamente**
3. **Verificar con el health check:** `https://backend-gastos-v68j.onrender.com/health`

## Variables de Entorno en Render

Asegúrate de que estas variables estén configuradas en tu servicio de Render:

```bash
NODE_ENV=production
PORT=10000
JWT_SECRET=tu_secreto_jwt_seguro
JWT_EXPIRES_IN=7d
CORS_ORIGINS=https://tu-frontend.vercel.app,https://tu-dominio.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_ROUNDS=12
DB_HOST=tu_host_supabase
DB_PORT=5432
DB_NAME=postgres
DB_USER=tu_usuario_supabase
DB_PASS=tu_password_supabase
DATABASE_URL=tu_database_url_completa
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_URL=tu_supabase_url
```

## Monitoreo

- **Logs:** Revisa los logs en el dashboard de Render
- **Health Check:** `https://backend-gastos-v68j.onrender.com/health`
- **Status:** El endpoint `/health` incluye uptime y timestamp

## Próximos Pasos

1. **Conectar tu frontend** usando la URL de producción
2. **Agregar el dominio del frontend** a las variables CORS en Render
3. **Configurar las variables de entorno** del frontend
4. **Probar todos los endpoints** desde tu aplicación frontend

¡Tu backend está listo para usar! 🎉
