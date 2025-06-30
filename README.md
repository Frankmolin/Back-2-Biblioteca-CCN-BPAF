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
`
git clone https://github.com/Frankmolin/Back-2-Biblioteca-CCN-BPAF
cd Back-2-Biblioteca-CCN-BPAF
`

2. **Instalar dependencias**
`
npm install
`

 **Configurar variables de entorno**
`
 .env
`

Edita el archivo `.env`:
`

PORT=3001


DB_HOST=ep-spring-dust-acd6ue9r-pooler.sa-east-1.aws.neon.tech
DB_PORT=5432
DB_NAME=bibliotecaDB
DB_USER=bibliotecaDB_owner
DB_PASSWORD=npg_tpRXBLT84Fgy
DB_SSL=true


JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d


NODE_ENV=development


UPLOAD_DIR=uploads
`




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

La documentación completa está disponible en: http://localhost:3001/api-docs

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


## 📁 Estructura del Proyecto

`
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
`


## 🛡️ Seguridad

- **Contraseñas encriptadas** con bcrypt (12 rounds)
- **Tokens JWT** con expiración configurable
- **Validación de datos** con Joi
- **Middleware de seguridad** con Helmet
- **CORS** configurado
- **SQL injection** prevenido con queries parametrizadas
- **Verificación de roles** y permisos
- **Validación de tipos de archivo**

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

