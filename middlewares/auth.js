const jwt = require("jsonwebtoken")
const { query } = require("../config/database")

// Middleware para verificar token JWT
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Token no proporcionado",
        message: "Se requiere un token de autorización",
      })
    }

    const token = authHeader.substring(7)

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Verificar que el usuario existe en la base de datos
      const result = await query("SELECT * FROM usuarios WHERE id = $1", [decoded.userId])

      if (result.rows.length === 0) {
        return res.status(401).json({
          error: "Usuario no válido",
          message: "El token no corresponde a un usuario válido",
        })
      }

      req.user = result.rows[0]
      next()
    } catch (jwtError) {
      return res.status(401).json({
        error: "Token inválido",
        message: "El token proporcionado no es válido o ha expirado",
      })
    }
  } catch (error) {
    console.error("Error en authMiddleware:", error)
    res.status(500).json({
      error: "Error de autenticación",
      message: "Error interno en la verificación del token",
    })
  }
}

// Middleware para verificar rol de administrador
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "No autenticado",
      message: "Se requiere autenticación",
    })
  }

  if (req.user.rol !== "admin") {
    return res.status(403).json({
      error: "Acceso denegado",
      message: "Se requieren permisos de administrador",
    })
  }

  next()
}

module.exports = {
  authMiddleware,
  adminMiddleware,
}
