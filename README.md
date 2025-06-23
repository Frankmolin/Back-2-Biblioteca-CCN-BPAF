# 📚 Sistema de Biblioteca - Backend API con PostgreSQL

Backend completo para un sistema de gestión de biblioteca, desarrollado con **Node.js**, **Express**, **PostgreSQL** y autenticación **JWT**, diseñado para ser seguro, escalable y fácilmente mantenible.

---

## 🗂️ Tabla de Contenidos

- [Características](#-características)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [API Endpoints](#-api-endpoints)
- [Documentación](#-documentación)
- [Base de Datos](#-base-de-datos)
- [Gestión de Imágenes](#-gestión-de-imágenes)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Seguridad](#-seguridad)
- [Dependencias](#-dependencias-principales)
- [Contribución](#-contribución)
- [Solución de Problemas](#-solución-de-problemas)
- [Licencia](#-licencia)

---

## 🚀 Características

- Autenticación **JWT** con verificación de roles (`admin`, `usuario`)
- **PostgreSQL** con queries SQL directos y conexión optimizada
- Subida y almacenamiento local de imágenes con **Multer**
- Documentación automática con **Swagger**
- Validación de datos robusta con **Joi**
- Soporte de transacciones SQL para operaciones críticas
- Arquitectura modular y escalable

---

## 📋 Requisitos

- **Node.js** `>=14.x`
- **PostgreSQL** `>=12.x`
- Gestor de paquetes: `npm` o `yarn`

---

## 🛠️ Instalación

```bash
git clone https://github.com/Frankmolin/Back-2-Biblioteca-CCN-BPAF
cd Back-2-Biblioteca-CCN-BPAF
npm install
```

---

## ⚙️ Configuración

Edita el archivo `.env` con tus credenciales:

```env
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
```

---

## ▶️ Uso

1. Ejecuta el servidor:
   ```bash
   npm start
   ```
2. Accede a la documentación en:
   ```
   http://localhost:3001/api-docs
   ```

---

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/registro` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Usuarios
- `GET /api/usuarios/perfil` - Obtener perfil (auth)
- `GET /api/usuarios` - Listar usuarios (solo admin)
- `PATCH /api/usuarios/:id/rol` - Cambiar rol (solo admin)

### Eventos
- `GET /api/eventos`
- `GET /api/eventos/:id`
- `POST /api/eventos` (admin, con imagen)
- `PUT /api/eventos/:id` (admin)
- `DELETE /api/eventos/:id` (admin)

### Funciones
- `GET /api/funciones`
- `GET /api/funciones/:id`
- `POST /api/funciones` (admin, con imagen)
- `PUT /api/funciones/:id` (admin)
- `DELETE /api/funciones/:id` (admin)

### Votaciones
- `GET /api/votaciones`
- `GET /api/votaciones/:id`
- `POST /api/votaciones` (admin)
- `POST /api/votaciones/:id/votar` (auth)
- `PUT /api/votaciones/:id` (admin)
- `DELETE /api/votaciones/:id` (admin)

---

## 📖 Documentación

La documentación Swagger está disponible en:

```
http://localhost:3001/api-docs
```

Generada automáticamente con `swagger-autogen`.

---

## 🗄️ Base de Datos

### Tablas

- `usuarios`: roles, datos de login
- `eventos`: eventos culturales
- `funciones`: funciones teatrales
- `votaciones`: temas abiertos a votación
- `votos`: votos individuales

### Características

- UUIDs como claves primarias
- Índices optimizados
- Triggers para timestamps automáticos
- Constraints de integridad
- Soporte de transacciones

---

## 🖼️ Gestión de Imágenes

- Guardadas localmente en `uploads/`
- Subcarpetas: `uploads/eventos/`, `uploads/funciones/`
- Nombres únicos mediante UUIDs
- Validación de tipo MIME y tamaño (hasta 5MB)
- Servidas públicamente vía Express

---

## 📁 Estructura del Proyecto

```
biblioteca-backend-postgresql/
├── app.js
├── swagger.js
├── .env.example
├── package.json
├── config/
│   └── database.js
├── middlewares/
│   └── auth.js
├── routes/
│   ├── auth.js
│   ├── usuarios.js
│   ├── eventos.js
│   ├── funciones.js
│   └── votaciones.js
├── utils/
│   ├── validation.js
│   └── fileUpload.js
├── scripts/
│   ├── migrate.js
│   ├── create-tables.sql
│   └── seed-data.sql
└── uploads/
    ├── eventos/
    └── funciones/
```

---

## 🛡️ Seguridad

- Contraseñas cifradas con **bcrypt** (12 salt rounds)
- JWT firmados con expiración
- Validación de datos con **Joi**
- Middleware de seguridad con **Helmet**
- Protección CORS configurada
- Queries SQL parametrizadas (anti-inyección)
- Control de acceso basado en roles

---

## 📦 Dependencias Principales

- `express` - Web framework
- `pg` - Cliente PostgreSQL
- `jsonwebtoken` - Autenticación JWT
- `bcryptjs` - Hash de contraseñas
- `multer` - Subida de archivos
- `joi` - Validación de datos
- `swagger-autogen` - Documentación
- `helmet` - Seguridad HTTP
- `cors` - Configuración CORS
- `uuid` - Identificadores únicos

---

## 🤝 Contribución

1. Haz un fork del proyecto
2. Crea tu rama (`git checkout -b feature/NuevaFuncionalidad`)
3. Haz commit (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a tu rama (`git push origin feature/NuevaFuncionalidad`)
5. Abre un Pull Request

---

## 🧩 Solución de Problemas

- ✅ PostgreSQL está corriendo correctamente
- ✅ Variables de entorno `.env` configuradas
- ✅ Ejecuta migraciones: `npm run migrate`
- ✅ Revisa logs del servidor (`console.log`, errores)
- ✅ Consulta la documentación Swagger en `/api-docs`

---
