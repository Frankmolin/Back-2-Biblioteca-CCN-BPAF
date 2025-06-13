# Sistema de Biblioteca - Backend API con PostgreSQL

Backend completo para sistema de gestión de biblioteca desarrollado con Node.js, Express, PostgreSQL y JWT.

## 🚀 Características

- **Autenticación JWT** con roles de usuario (admin/usuario)
- **Base de datos PostgreSQL** con queries SQL directos
- **Almacenamiento local de imágenes** con Multer
- **Documentación automática** con Swagger
- **Validación de datos** con Joi
- **Pool de conexiones** para mejor rendimiento
- **Transacciones SQL** para operaciones críticas
- **Arquitectura modular** y escalable

## 📋 Requisitos

- Node.js >= 14.x
- PostgreSQL >= 12.x
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
\`\`\`bash
git clone <tu-repositorio>
cd biblioteca-backend-postgresql
\`\`\`

2. **Instalar dependencias**
\`\`\`bash
npm install
\`\`\`

3. **Configurar PostgreSQL**
\`\`\`bash
# Crear base de datos
createdb biblioteca_db

# O usando psql
psql -U postgres
CREATE DATABASE biblioteca_db;
\`\`\`

4. **Configurar variables de entorno**
\`\`\`bash
cp .env.example .env
\`\`\`

Edita el archivo `.env`:
\`\`\`env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=biblioteca_db
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_SSL=false
JWT_SECRET=tu_secreto_jwt_super_seguro
JWT_EXPIRES_IN=7d
NODE_ENV=development
UPLOAD_DIR=uploads
\`\`\`

5. **Ejecutar migraciones**
\`\`\`bash
npm run migrate
\`\`\`

## 🚀 Uso

### Desarrollo
\`\`\`bash
# Generar documentación Swagger y iniciar servidor
npm run swagger-dev

# Solo iniciar servidor
npm run dev

# Solo generar Swagger
npm run swagger

# Ejecutar migraciones
npm run migrate
\`\`\`

### Producción
\`\`\`bash
npm start
\`\`\`

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/registro` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Usuarios
- `GET /api/usuarios/perfil` - Obtener perfil (requiere auth)
- `GET /api/usuarios` - Listar usuarios (solo admin)
- `PATCH /api/usuarios/:id/rol` - Cambiar rol (solo admin)

### Eventos
- `GET /api/eventos` - Listar eventos
- `GET /api/eventos/:id` - Obtener evento
- `POST /api/eventos` - Crear evento (solo admin, con imagen)
- `PUT /api/eventos/:id` - Actualizar evento (solo admin)
- `DELETE /api/eventos/:id` - Eliminar evento (solo admin)

### Funciones
- `GET /api/funciones` - Listar funciones
- `GET /api/funciones/:id` - Obtener función
- `POST /api/funciones` - Crear función (solo admin, con imagen)
- `PUT /api/funciones/:id` - Actualizar función (solo admin)
- `DELETE /api/funciones/:id` - Eliminar función (solo admin)

### Votaciones
- `GET /api/votaciones` - Listar votaciones
- `GET /api/votaciones/:id` - Obtener votación con resultados
- `POST /api/votaciones` - Crear votación (solo admin)
- `POST /api/votaciones/:id/votar` - Votar (requiere auth)
- `PUT /api/votaciones/:id` - Actualizar votación (solo admin)
- `DELETE /api/votaciones/:id` - Eliminar votación (solo admin)

## 📖 Documentación

La documentación completa está disponible en:
\`\`\`
http://localhost:3000/api-docs
\`\`\`

## 🗄️ Base de Datos

### Estructura de tablas:
- **usuarios** - Información de usuarios y roles
- **eventos** - Eventos de la biblioteca
- **funciones** - Funciones teatrales/culturales
- **votaciones** - Votaciones activas
- **votos** - Registro de votos individuales

### Características de la BD:
- **UUIDs** como claves primarias
- **Índices** optimizados para consultas frecuentes
- **Triggers** para actualización automática de timestamps
- **Constraints** para integridad de datos
- **Transacciones** para operaciones críticas

## 🖼️ Gestión de Imágenes

- **Almacenamiento local** en directorio `uploads/`
- **Organización por carpetas**: `eventos/`, `funciones/`
- **Nombres únicos** con UUID
- **Validación de tipos** de archivo
- **Límite de tamaño**: 5MB
- **URLs públicas** servidas por Express

## 🔐 Autenticación

### Credenciales por defecto:
\`\`\`bash
# Administrador
Email: admin@biblioteca.com
Password: admin123

# Usuario normal
Email: usuario@biblioteca.com  
Password: usuario123
\`\`\`

### Ejemplo de uso:
\`\`\`bash
# Registro
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo@ejemplo.com",
    "password": "contraseña123",
    "nombre": "Nuevo Usuario"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@biblioteca.com",
    "password": "admin123"
  }'

# Usar token
curl -X GET http://localhost:3000/api/usuarios/perfil \
  -H "Authorization: Bearer TU_TOKEN_JWT"
\`\`\`

## 📁 Estructura del Proyecto

\`\`\`
biblioteca-backend-postgresql/
├── app.js                    # Servidor principal
├── swagger.js               # Configuración Swagger
├── package.json             # Dependencias
├── .env.example            # Variables de entorno ejemplo
├── config/
│   └── database.js         # Configuración PostgreSQL
├── middlewares/
│   └── auth.js             # Middlewares de autenticación
├── routes/
│   ├── auth.js             # Rutas de autenticación
│   ├── usuarios.js         # Rutas de usuarios
│   ├── eventos.js          # Rutas de eventos
│   ├── funciones.js        # Rutas de funciones
│   └── votaciones.js       # Rutas de votaciones
├── utils/
│   ├── validation.js       # Esquemas de validación
│   └── fileUpload.js       # Utilidades de archivos
├── scripts/
│   ├── migrate.js          # Script de migraciones
│   ├── create-tables.sql   # Script creación tablas
│   └── seed-data.sql       # Datos de ejemplo
└── uploads/                # Directorio de archivos subidos
    ├── eventos/
    └── funciones/
\`\`\`

## 🔧 Configuración Avanzada

### Pool de Conexiones PostgreSQL:
\`\`\`javascript
{
  max: 20,                    // Máximo conexiones
  idleTimeoutMillis: 30000,   // Timeout inactividad
  connectionTimeoutMillis: 2000 // Timeout conexión
}
\`\`\`

### Variables de entorno disponibles:
\`\`\`env
PORT=3000                     # Puerto del servidor
DB_HOST=localhost            # Host de PostgreSQL
DB_PORT=5432                 # Puerto de PostgreSQL
DB_NAME=biblioteca_db        # Nombre de la base de datos
DB_USER=usuario              # Usuario de PostgreSQL
DB_PASSWORD=password         # Contraseña de PostgreSQL
DB_SSL=false                 # Usar SSL (true/false)
JWT_SECRET=secreto           # Secreto para JWT
JWT_EXPIRES_IN=7d            # Expiración del token
NODE_ENV=development         # Entorno
UPLOAD_DIR=uploads           # Directorio de uploads
\`\`\`

## 🛡️ Seguridad

- **Contraseñas encriptadas** con bcrypt (12 rounds)
- **Tokens JWT** con expiración configurable
- **Validación de datos** con Joi
- **Middleware de seguridad** con Helmet
- **CORS** configurado
- **SQL injection** prevenido con queries parametrizadas
- **Verificación de roles** y permisos
- **Validación de tipos de archivo**

## 📊 Ejemplos de Queries SQL

### Crear evento:
\`\`\`sql
INSERT INTO eventos (id, titulo, descripcion, fecha, imagen_url, created_by) 
VALUES ($1, $2, $3, $4, $5, $6) 
RETURNING *
\`\`\`

### Obtener votación con resultados:
\`\`\`sql
SELECT v.*, u.nombre as creador_nombre
FROM votaciones v
LEFT JOIN usuarios u ON v.created_by = u.id
WHERE v.id = $1
\`\`\`

### Registrar voto (con transacción):
\`\`\`sql
BEGIN;
-- Verificar votación activa
-- Verificar si usuario ya votó
-- Insertar voto
INSERT INTO votos (id, votacion_id, usuario_id, opcion) 
VALUES ($1, $2, $3, $4);
COMMIT;
\`\`\`

## 🚨 Manejo de Errores

### Códigos de estado HTTP:
- `200` - Éxito
- `201` - Creado exitosamente
- `400` - Datos inválidos
- `401` - No autenticado
- `403` - Sin permisos
- `404` - No encontrado
- `500` - Error interno del servidor

### Formato de respuesta de error:
\`\`\`json
{
  "error": "Tipo de error",
  "message": "Descripción detallada del error"
}
\`\`\`

## 📦 Dependencias Principales

- **express** - Framework web
- **pg** - Cliente PostgreSQL
- **jsonwebtoken** - Manejo de JWT
- **bcryptjs** - Encriptación de contraseñas
- **multer** - Subida de archivos
- **joi** - Validación de datos
- **swagger-autogen** - Generación automática de documentación
- **helmet** - Seguridad HTTP
- **cors** - Configuración CORS
- **uuid** - Generación de UUIDs

## 🔄 Migraciones

### Ejecutar migraciones:
\`\`\`bash
npm run migrate
\`\`\`

### Crear nueva migración:
1. Crear archivo SQL en `scripts/`
2. Actualizar `migrate.js` si es necesario
3. Ejecutar migración

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request



Si tienes problemas:
1. Verifica que PostgreSQL esté corriendo
2. Revisa las variables de entorno en `.env`
3. Ejecuta las migraciones con `npm run migrate`
4. Revisa los logs del servidor para errores específicos
5. Consulta la documentación en `/api-docs`

