const swaggerJsdoc = require("swagger-jsdoc")

require("dotenv").config()

const PORT = process.env.PORT || 3001

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Biblioteca con PostgreSQL",
      description: "Sistema de gestión de biblioteca con autenticación JWT y PostgreSQL",
      version: "1.0.0",
      contact: {
        name: "Soporte",
      email:"frankmolinaj9604@gmail.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Servidor de desarrollo",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token JWT en formato: Bearer <token>",
        },
      },
      schemas: {
        Usuario: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            email: { type: "string", format: "email" },
            nombre: { type: "string" },
            rol: { type: "string", enum: ["admin", "usuario"] },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Evento: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            titulo: { type: "string" },
            descripcion: { type: "string" },
            fecha: { type: "string", format: "date-time" },
            imagen_url: { type: "string" },
            created_by: { type: "string", format: "uuid" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Funcion: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            titulo: { type: "string" },
            descripcion: { type: "string" },
            fecha: { type: "string", format: "date-time" },
            imagen_url: { type: "string" },
            created_by: { type: "string", format: "uuid" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Votacion: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            titulo: { type: "string" },
            descripcion: { type: "string" },
            opciones: {
              type: "array",
              items: { type: "string" },
            },
            fecha_fin: { type: "string", format: "date-time" },
            activa: { type: "boolean" },
            created_by: { type: "string", format: "uuid" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js", "./app.js"], // Rutas a los archivos que contienen anotaciones JSDoc
}

const specs = swaggerJsdoc(options)

module.exports = specs
