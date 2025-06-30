# Control de Gastos - Backend API

Backend REST API para la aplicación de control de gastos personal, construido con Node.js, Express y Supabase.

## 🚀 Características

- **API REST completa** con endpoints para transacciones, categorías, presupuestos y usuarios
- **Autenticación JWT** integrada con Supabase Auth
- **Seguridad robusta** con helmet, CORS y rate limiting
- **Validación de datos** con Joi y express-validator
- **Preparado para deployment** en Render
- **Compatible con PostgreSQL** a través de Supabase

## 📁 Estructura del Proyecto

```
src/
├── controllers/       # Controladores de la API
├── middleware/        # Middlewares personalizados
├── routes/           # Definición de rutas
├── services/         # Lógica de negocio
├── utils/            # Utilidades y helpers
├── config/           # Configuraciones
└── server.js         # Punto de entrada
```

## 🛠️ Instalación y Configuración

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de Supabase:

```env
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
CORS_ORIGINS=https://tu-frontend.vercel.app
```

3. **Ejecutar en desarrollo:**
```bash
npm run dev
```

4. **Ejecutar en producción:**
```bash
npm start
```

## 🌐 Endpoints de la API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/profile` - Obtener perfil del usuario

### Transacciones
- `GET /api/transactions` - Obtener todas las transacciones del usuario
- `POST /api/transactions` - Crear nueva transacción
- `GET /api/transactions/:id` - Obtener transacción específica
- `PUT /api/transactions/:id` - Actualizar transacción
- `DELETE /api/transactions/:id` - Eliminar transacción
- `GET /api/transactions/stats` - Obtener estadísticas

### Categorías
- `GET /api/categories` - Obtener todas las categorías del usuario
- `POST /api/categories` - Crear nueva categoría
- `PUT /api/categories/:id` - Actualizar categoría
- `DELETE /api/categories/:id` - Eliminar categoría

### Presupuestos
- `GET /api/budgets` - Obtener todos los presupuestos
- `POST /api/budgets` - Crear nuevo presupuesto
- `PUT /api/budgets/:id` - Actualizar presupuesto
- `DELETE /api/budgets/:id` - Eliminar presupuesto

## 🚀 Deployment en Render

1. Conecta tu repositorio a Render
2. Configura las variables de entorno en el dashboard de Render
3. El servicio se desplegará automáticamente

### Variables de entorno requeridas en Render:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CORS_ORIGINS`
- `JWT_SECRET`

## 🔒 Seguridad

- Autenticación basada en JWT con Supabase
- Rate limiting para prevenir ataques
- Validación de entrada en todos los endpoints
- CORS configurado para dominios específicos
- Headers de seguridad con Helmet

## 📊 Base de Datos

La aplicación utiliza Supabase (PostgreSQL) con las siguientes tablas:
- `users` - Información de usuarios
- `categories` - Categorías de transacciones
- `transactions` - Transacciones financieras
- `budgets` - Presupuestos por categoría

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request
