const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // requerido para SSL externo como Neon
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Función para ejecutar queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("✅ Query ejecutada:", { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error("❌ Error en query:", error.message);
    throw error;
  }
};

// Obtener cliente del pool (para transacciones)
const getClient = async () => {
  return await pool.connect();
};

// Probar conexión inicial
const testConnection = async () => {
  try {
    const res = await query("SELECT NOW()");
    console.log("✅ Conexión exitosa a PostgreSQL:", res.rows[0].now);
  } catch (error) {
    console.error("❌ Fallo de conexión PostgreSQL:", error.message);
  }
};

testConnection();

module.exports = {
  query,
  getClient,
  pool,
};
