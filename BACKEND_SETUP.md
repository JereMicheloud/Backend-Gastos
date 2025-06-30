# Backend Setup - Control de Gastos

## 🚀 Configuración del Backend

Este backend está diseñado para funcionar de forma independiente y es compatible con cualquier frontend que implemente los endpoints correctos.

### Tecnologías Utilizadas
- **Node.js** + **Express.js**
- **Supabase** (PostgreSQL)
- **JWT** para autenticación
- **bcryptjs** para hash de contraseñas

### Variables de Entorno Requeridas

Copia `.env.example` a `.env` y configura las siguientes variables:

```bash
# Database Configuration (PostgreSQL/Supabase)
DB_HOST=tu_host_de_supabase
DB_PORT=5432
DB_NAME=postgres
DB_USER=tu_usuario_de_supabase
DB_PASS=tu_contraseña_de_supabase
DATABASE_URL=postgresql://tu_usuario:tu_contraseña@tu_host:5432/postgres

# Supabase Configuration
SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
SUPABASE_URL=https://tu-proyecto.supabase.co

# Server Configuration
PORT=3001
JWT_SECRET=tu_secreto_jwt_muy_seguro
```

### Instalación y Ejecución

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar base de datos:**
- Ejecuta el script `database-setup.sql` en tu proyecto de Supabase
- Este script crea todas las tablas, triggers, vistas y políticas RLS necesarias

3. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Edita .env con tus credenciales
```

4. **Ejecutar en desarrollo:**
```bash
npm run dev
```

5. **Ejecutar en producción:**
```bash
npm start
```

El servidor estará disponible en `http://localhost:3001`

### Endpoints Principales

#### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login de usuario
- `POST /api/auth/logout` - Logout de usuario
- `GET /api/auth/profile` - Obtener perfil del usuario

#### Transacciones
- `GET /api/transactions` - Obtener transacciones del usuario
- `POST /api/transactions` - Crear nueva transacción
- `GET /api/transactions/:id` - Obtener transacción específica
- `PUT /api/transactions/:id` - Actualizar transacción
- `DELETE /api/transactions/:id` - Eliminar transacción

#### Categorías
- `GET /api/categories` - Obtener categorías del usuario
- `POST /api/categories` - Crear nueva categoría
- `PUT /api/categories/:id` - Actualizar categoría
- `DELETE /api/categories/:id` - Eliminar categoría

#### Presupuestos
- `GET /api/budgets` - Obtener presupuestos del usuario
- `POST /api/budgets` - Crear nuevo presupuesto
- `PUT /api/budgets/:id` - Actualizar presupuesto
- `DELETE /api/budgets/:id` - Eliminar presupuesto

#### Usuarios
- `GET /api/users/profile` - Obtener perfil del usuario
- `PUT /api/users/profile` - Actualizar perfil del usuario

### Estructura de Datos

#### Usuario
```javascript
{
  id: "uuid",
  email: "string",
  name: "string",
  created_at: "timestamp",
  updated_at: "timestamp"
}
```

#### Transacción
```javascript
{
  id: "uuid",
  user_id: "uuid",
  amount: "number",
  description: "string",
  type: "income" | "expense",
  category_id: "uuid",
  transaction_date: "date",
  created_at: "timestamp",
  updated_at: "timestamp"
}
```

#### Categoría
```javascript
{
  id: "uuid",
  user_id: "uuid",
  name: "string",
  color: "string",
  type: "income" | "expense" | "both",
  created_at: "timestamp",
  updated_at: "timestamp"
}
```

#### Presupuesto
```javascript
{
  id: "uuid",
  user_id: "uuid",
  category_id: "uuid",
  amount: "number",
  period: "monthly" | "weekly" | "yearly",
  start_date: "date",
  end_date: "date",
  created_at: "timestamp",
  updated_at: "timestamp"
}
```

### Características de Seguridad

- **CORS** configurado para múltiples orígenes
- **Rate Limiting** (100 requests por 15 minutos)
- **Helmet** para headers de seguridad
- **JWT** para autenticación
- **bcryptjs** para hash de contraseñas
- **Row Level Security (RLS)** en Supabase

### Health Check

El servidor incluye un endpoint de health check en `GET /health` que retorna:

```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 123456,
  "environment": "development"
}
```

### Deployment

Ver `DEPLOYMENT.md` para instrucciones de despliegue en Render y otras plataformas.

### Compatibilidad con Frontend

Este backend es compatible con cualquier frontend que:
- Envíe tokens JWT en el header `Authorization: Bearer <token>`
- Respete la estructura de datos definida arriba
- Implemente los endpoints correctamente

El backend fue diseñado originalmente para un frontend en Next.js, pero es completamente independiente y puede usarse con React, Vue, Angular, o cualquier otro framework.
