# 🚨 SOLUCIÓN AL ERROR 500 - Configurar Variables en Render

## El Problema
En los logs de Render se ve claramente que **las variables de Supabase NO están configuradas**:
```
URL: ❌ Faltante
ANON_KEY: ❌ Faltante
```

Esto causa el error: `TypeError: Cannot read properties of null (reading 'auth')`

## 🔧 Solución: Configurar Variables de Entorno en Render

### Paso 1: Ir al Dashboard de Render
1. Ve a [render.com](https://render.com)
2. Busca tu servicio: **backend-gastos-v68j**
3. Haz clic en el servicio

### Paso 2: Configurar Environment Variables
1. En el dashboard del servicio, ve a **Environment**
2. Haz clic en **Add Environment Variable**
3. Agrega TODAS estas variables:

```bash
# Variables OBLIGATORIAS para que funcione
NODE_ENV=production
PORT=10000

# Supabase (CRÍTICAS - sin estas no funciona)
SUPABASE_URL=https://hgipbefbrxfzlezmewtg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnaXBiZWZicnhmemxlem1ld3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzc3MjAsImV4cCI6MjA2NjgxMzcyMH0.koBXmo96DEBkHK6fYKIIj_4e6ZLMzE246fDcS0jZUA4

# JWT
JWT_SECRET=un_secreto_muy_seguro_para_produccion
JWT_EXPIRES_IN=7d

# CORS (agrega tu dominio de frontend aquí)
CORS_ORIGINS=http://localhost:3000,https://tu-frontend.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12

# Database (PostgreSQL directo - opcional pero recomendado)
DB_HOST=aws-0-sa-east-1.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.hgipbefbrxfzlezmewtg
DB_PASS=Jere060904_12
DATABASE_URL=postgresql://postgres.hgipbefbrxfzlezmewtg:Jere060904_12@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

### Paso 3: Hacer el Deploy
1. Después de agregar todas las variables, haz clic en **Deploy Latest Commit**
2. O simplemente espera unos minutos - Render se redesplegará automáticamente

### Paso 4: Verificar que Funciona
Una vez que termine el deploy, verifica:

1. **Health Check:**
   ```
   https://backend-gastos-v68j.onrender.com/health
   ```

2. **Debug de configuración:**
   ```
   https://backend-gastos-v68j.onrender.com/api/debug/config
   ```

3. **Test de Supabase:**
   ```
   https://backend-gastos-v68j.onrender.com/api/debug/supabase-test
   ```

## 🎯 Resultado Esperado

Después de configurar las variables, deberías ver en los logs:
```
✅ Configurando Supabase SDK...
📍 URL: https://hgipbefbrxfzlezmewtg.supabase.co
✅ Supabase SDK configurado correctamente
```

Y los endpoints de autenticación funcionarán sin errores 500.

## ⚠️ Importante

**Las variables del archivo `.env` local NO se sincronizan con Render.** Tienes que configurarlas manualmente en el dashboard de Render.

## 🚀 Una vez configurado

Tu backend estará 100% funcional y podrás:
- ✅ Registrar usuarios
- ✅ Hacer login  
- ✅ Usar todos los endpoints protegidos
- ✅ Conectar tu frontend sin problemas
