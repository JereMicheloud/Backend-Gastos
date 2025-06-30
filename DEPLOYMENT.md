# Guía de Deployment en Render

## Pasos para deployar el backend en Render

### 1. Preparar el repositorio
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/control-gastos-backend.git
git push -u origin main
```

### 2. Configurar Render

1. Ve a [Render.com](https://render.com) e inicia sesión
2. Haz clic en "New +" y selecciona "Web Service"
3. Conecta tu repositorio de GitHub
4. Configura los siguientes settings:

**Build & Deploy:**
- Build Command: `npm install`
- Start Command: `npm start`

**Environment Variables:**
- `NODE_ENV`: `production`
- `SUPABASE_URL`: Tu URL de Supabase
- `SUPABASE_ANON_KEY`: Tu clave anónima de Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Tu clave de servicio de Supabase
- `JWT_SECRET`: Una clave secreta larga y aleatoria
- `CORS_ORIGINS`: Las URLs de tu frontend (ej: `https://tu-app.vercel.app`)
- `RATE_LIMIT_WINDOW_MS`: `900000` (15 minutos)
- `RATE_LIMIT_MAX_REQUESTS`: `100`

### 3. Variables de entorno requeridas

#### Supabase
```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_clave_anonima
SUPABASE_SERVICE_ROLE_KEY=tu_clave_servicio
```

#### CORS
```
CORS_ORIGINS=https://tu-frontend.vercel.app,https://tu-dominio-personalizado.com
```

#### JWT (opcional)
```
JWT_SECRET=tu-super-secreto-jwt-de-al-menos-32-caracteres
```

### 4. Configurar tu frontend

En tu aplicación de frontend (Vercel), actualiza la URL de la API:

```env
NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com
```

### 5. Configurar CORS en el frontend

Asegúrate de que tu frontend esté configurado para usar la URL correcta del backend:

```javascript
// En tu servicio de API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
```

### 6. Verificar el deployment

Una vez deployado, puedes verificar que todo funcione:

1. Visita `https://tu-backend.onrender.com/health`
2. Deberías ver una respuesta JSON con el status "OK"

### 7. Troubleshooting

**Problemas comunes:**

- **Error 503**: El servicio está iniciando, espera unos minutos
- **Error CORS**: Verifica que las URLs en `CORS_ORIGINS` sean correctas
- **Error de conexión a Supabase**: Verifica las credenciales de Supabase
- **Build failed**: Revisa los logs de build en Render

### 8. Configuración adicional

**Para dominios personalizados:**
1. Ve a Settings en tu servicio de Render
2. Agrega tu dominio personalizado
3. Configura los registros DNS según las instrucciones

**Para mejorar el rendimiento:**
- Considera actualizar a un plan pagado para mejor rendimiento
- Configura health checks si es necesario
- Monitorea los logs para optimizar

## Comandos útiles

```bash
# Verificar variables de entorno localmente
npm run dev

# Ejecutar tests
npm test

# Verificar el linting
npm run lint

# Verificar la aplicación localmente
curl http://localhost:3001/health
```

## Notas importantes

- Render puede tomar hasta 15 minutos para el primer deploy
- Los servicios gratuitos se duermen después de 15 minutos de inactividad
- Considera usar un plan pagado para aplicaciones en producción
- Mantén las credenciales de Supabase seguras y no las subas al repositorio
