const { query } = require("../config/database")
const fs = require("fs")
const path = require("path")

async function runMigrations() {
  try {
    console.log("🚀 Iniciando migraciones...")

    // Leer y ejecutar script de creación de tablas
    const createTablesSQL = fs.readFileSync(path.join(__dirname, "create-tables.sql"), "utf8")
    await query(createTablesSQL)
    console.log("✅ Tablas creadas exitosamente")

    // Leer y ejecutar script de datos de ejemplo
    const seedDataSQL = fs.readFileSync(path.join(__dirname, "seed-data.sql"), "utf8")
    await query(seedDataSQL)
    console.log("✅ Datos de ejemplo insertados exitosamente")

    console.log("🎉 Migraciones completadas")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error en migraciones:", error)
    process.exit(1)
  }
}

runMigrations()
