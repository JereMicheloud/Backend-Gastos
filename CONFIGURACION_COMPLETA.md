# 🚀 Backend Completo para Control de Gastos

## 📋 Resumen

He creado un backend completo con Node.js, Express y Supabase que incluye:

### ✅ **Características Implementadas**

1. **API REST Completa** con todos los endpoints necesarios
2. **Autenticación JWT** integrada con Supabase Auth
3. **Validación robusta** con Joi
4. **Manejo de errores** centralizado
5. **Seguridad** con CORS, Helmet, Rate Limiting
6. **Base de datos** optimizada con PostgreSQL/Supabase
7. **Deployment** listo para Render

### 🗂️ **Estructura del Backend**

```
Backend-gastos/
├── src/
│   ├── controllers/      # Controladores de la API
│   │   ├── authController.js
│   │   ├── transactionController.js
│   │   ├── categoryController.js
│   │   ├── budgetController.js
│   │   └── userController.js
│   ├── services/         # Lógica de negocio
│   │   ├── authService.js
│   │   ├── transactionService.js
│   │   ├── categoryService.js
│   │   └── budgetService.js
│   ├── routes/           # Rutas de la API
│   │   ├── auth.js
│   │   ├── transactions.js
│   │   ├── categories.js
│   │   ├── budgets.js
│   │   └── users.js
│   ├── middleware/       # Middlewares
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── config/           # Configuraciones
│   │   ├── supabase.js
│   │   └── index.js
│   ├── utils/            # Utilidades
│   │   └── helpers.js
│   └── server.js         # Punto de entrada
├── tests/                # Tests
├── database-setup.sql    # SQL para crear las tablas
├── .env.example         # Variables de entorno ejemplo
└── package.json         # Dependencias
```

## 🔗 **Endpoints de la API**

### 🔐 **Autenticación** (`/api/auth`)
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/profile` - Obtener perfil
- `PUT /api/auth/profile` - Actualizar perfil

### 💰 **Transacciones** (`/api/transactions`)
- `GET /api/transactions` - Listar transacciones (con filtros)
- `POST /api/transactions` - Crear transacción
- `GET /api/transactions/:id` - Obtener transacción
- `PUT /api/transactions/:id` - Actualizar transacción
- `DELETE /api/transactions/:id` - Eliminar transacción
- `GET /api/transactions/stats` - Estadísticas
- `GET /api/transactions/trends` - Tendencias mensuales

### 📂 **Categorías** (`/api/categories`)
- `GET /api/categories` - Listar categorías
- `POST /api/categories` - Crear categoría
- `GET /api/categories/:id` - Obtener categoría
- `PUT /api/categories/:id` - Actualizar categoría
- `DELETE /api/categories/:id` - Eliminar categoría
- `GET /api/categories/stats` - Estadísticas por categoría

### 💼 **Presupuestos** (`/api/budgets`)
- `GET /api/budgets` - Listar presupuestos
- `POST /api/budgets` - Crear presupuesto
- `GET /api/budgets/:id` - Obtener presupuesto
- `PUT /api/budgets/:id` - Actualizar presupuesto
- `DELETE /api/budgets/:id` - Eliminar presupuesto
- `GET /api/budgets/summary` - Resumen de presupuestos
- `POST /api/budgets/automatic` - Crear presupuesto automático

### 👤 **Usuarios** (`/api/users`)
- `GET /api/users/me` - Perfil actual
- `PUT /api/users/me` - Actualizar perfil
- `GET /api/users/me/stats` - Estadísticas del usuario

## 🗄️ **Base de Datos**

### **Tablas Principales:**
- `users` - Información de usuarios
- `categories` - Categorías de transacciones
- `transactions` - Transacciones financieras
- `budgets` - Presupuestos por categoría

### **Características:**
- **Row Level Security (RLS)** habilitado
- **Triggers** para timestamps automáticos
- **Índices** optimizados para consultas frecuentes
- **Vistas** para joins comunes
- **Funciones** para estadísticas
- **Categorías por defecto** se crean automáticamente

## ⚙️ **Configuración y Deployment**

### **1. Configurar Variables de Entorno**

```env
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_clave_anonima
SUPABASE_SERVICE_ROLE_KEY=tu_clave_servicio

# CORS para tu frontend
CORS_ORIGINS=https://tu-frontend.vercel.app

# JWT (opcional)
JWT_SECRET=una-clave-secreta-muy-larga-y-aleatoria
```

### **2. Crear Base de Datos**

1. Ve a tu proyecto en Supabase
2. Abre el **SQL Editor**
3. Ejecuta el contenido completo de `database-setup.sql`
4. Verifica que todas las tablas se crearon correctamente

### **3. Deployment en Render**

1. **Conectar repositorio** a Render
2. **Configurar variables de entorno** en Render dashboard
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`

### **4. Configurar CORS en Frontend**

En tu frontend Next.js, actualiza la URL de la API:

```javascript
// .env.local del frontend
NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com
```

## 🔧 **Uso Local**

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar .env con tus credenciales de Supabase
cp .env.example .env

# 3. Ejecutar en desarrollo
npm run dev

# 4. Probar la API
curl http://localhost:3001/health
```

## 📊 **Funcionalidades Avanzadas**

### **Validación Completa**
- Esquemas Joi para todos los endpoints
- Validación de tipos de datos
- Mensajes de error personalizados

### **Seguridad**
- Rate limiting configurado
- Headers de seguridad con Helmet
- CORS configurado para dominios específicos
- Autenticación JWT con Supabase

### **Estadísticas**
- Resumen mensual de ingresos/gastos
- Tendencias por categorías
- Estadísticas de presupuestos
- Gráficos de gastos por período

### **Optimización**
- Índices de base de datos optimizados
- Consultas eficientes con joins
- Vistas pre-calculadas
- Paginación implementada

## 🤝 **Integración con Frontend**

El backend está diseñado para funcionar perfectamente con tu frontend Next.js:

1. **Autenticación**: Compatible con Supabase Auth
2. **Tipos**: Interfaces TypeScript compatibles
3. **Endpoints**: Estructura REST estándar
4. **CORS**: Configurado para Vercel
5. **Formato**: Respuestas JSON consistentes

## ✅ **Checklist de Deployment**

- [ ] Ejecutar SQL en Supabase
- [ ] Configurar variables de entorno en Render
- [ ] Conectar repositorio a Render
- [ ] Actualizar URL de API en frontend
- [ ] Probar endpoints principales
- [ ] Verificar autenticación
- [ ] Confirmar que CORS funciona

## 🆘 **Solución de Problemas**

**Error de conexión a Supabase:**
- Verifica las credenciales en las variables de entorno
- Asegúrate de que la URL de Supabase sea correcta

**Error CORS:**
- Verifica que la URL del frontend esté en `CORS_ORIGINS`
- Asegúrate de incluir `https://` en las URLs

**Error 503 en Render:**
- Los servicios gratuitos tardan en iniciar
- Espera 1-2 minutos después del deploy

---

## 🎉 **¡Backend Completo y Listo!**

Tu backend está **100% funcional** y listo para:
- ✅ Manejar todas las operaciones de tu app de gastos
- ✅ Autenticación segura con Supabase
- ✅ Deployment en Render
- ✅ Integración con tu frontend en Vercel
- ✅ Escalabilidad para el futuro

**Próximos pasos:**
1. Configurar las credenciales de Supabase
2. Ejecutar el SQL para crear las tablas
3. Hacer deploy en Render
4. Conectar con tu frontend

¡Tu aplicación de control de gastos tendrá un backend robusto y profesional!
