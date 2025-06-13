const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const path = require("path")
require("dotenv").config()

const swaggerUi = require("swagger-ui-express")
const swaggerSpecs = require("./swagger")

// Importar rutas
const authRoutes = require("./routes/auth")
const usuariosRoutes = require("./routes/usuarios")
const eventosRoutes = require("./routes/eventos")
const funcionesRoutes = require("./routes/funciones")
const votacionesRoutes = require("./routes/votaciones")

const app = express()
const PORT = process.env.PORT || 3000

/**
 * @swagger
 * /:
 *   get:
 *     summary: Ruta de bienvenida
 *     description: Muestra información general de la API
 *     responses:
 *       200:
 *         description: Información de la API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 version:
 *                   type: string
 *                 documentation:
 *                   type: string
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     auth:
 *                       type: string
 *                     usuarios:
 *                       type: string
 *                     eventos:
 *                       type: string
 *                     funciones:
 *                       type: string
 *                     votaciones:
 *                       type: string
 */

// Middlewares globales
app.use(helmet())
app.use(cors())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Servir archivos estáticos (imágenes subidas)
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Documentación Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs))

// Rutas principales
app.use("/api/auth", authRoutes)
app.use("/api/usuarios", usuariosRoutes)
app.use("/api/eventos", eventosRoutes)
app.use("/api/funciones", funcionesRoutes)
app.use("/api/votaciones", votacionesRoutes)

// Ruta de bienvenida
app.get("/", (req, res) => {
  res.json({
    message: "API de Biblioteca - Sistema de Gestión con PostgreSQL",
    version: "1.0.0",
    documentation: "/api-docs",
    endpoints: {
      auth: "/api/auth",
      usuarios: "/api/usuarios",
      eventos: "/api/eventos",
      funciones: "/api/funciones",
      votaciones: "/api/votaciones",
    },
  })
})

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    error: "Error interno del servidor",
    message: process.env.NODE_ENV === "development" ? err.message : "Algo salió mal",
  })
})

// Middleware para rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    message: `La ruta ${req.originalUrl} no existe`,
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
  console.log(`📚 Documentación disponible en http://localhost:${PORT}/api-docs`)
  console.log(`🗄️ Base de datos: PostgreSQL`)
})

module.exports = app
