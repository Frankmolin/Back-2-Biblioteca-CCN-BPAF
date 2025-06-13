const { Pool } = require("pg")
require('dotenv').config();

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "biblioteca_db",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  max: 20, // Máximo número de conexiones en el pool
  idleTimeoutMillis: 30000, // Tiempo antes de cerrar conexiones inactivas
  connectionTimeoutMillis: 2000, // Tiempo de espera para obtener conexión
})

// Función para ejecutar queries
const query = async (text, params) => {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log("Executed query", { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Función para obtener un cliente del pool (para transacciones)
const getClient = async () => {
  return await pool.connect()
}

// Función para verificar la conexión
const testConnection = async () => {
  try {
    const res = await query("SELECT NOW()")
    console.log("✅ Conexión a PostgreSQL exitosa:", res.rows[0].now)
    return true
  } catch (error) {
    console.error("❌ Error conectando a PostgreSQL:", error.message)
    return false
  }
}

// Probar conexión al inicializar
testConnection()

module.exports = {
  query,
  getClient,
  pool,
}
