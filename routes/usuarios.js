const express = require("express")
const { query } = require("../config/database")
const { authMiddleware, adminMiddleware } = require("../middlewares/auth")

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios
 */

const router = express.Router()

// Obtener perfil del usuario actual
router.get("/perfil", authMiddleware, async (req, res) => {
  /**
   * @swagger
   * /api/usuarios/perfil:
   *   get:
   *     summary: Obtener perfil del usuario actual
   *     description: Devuelve la información del usuario autenticado
   *     tags: [Usuarios]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Perfil del usuario
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 usuario:
   *                   $ref: '#/components/schemas/Usuario'
   *       401:
   *         description: No autenticado
   *       500:
   *         description: Error del servidor
   */
  try {
    res.json({
      usuario: {
        id: req.user.id,
        email: req.user.email,
        nombre: req.user.nombre,
        rol: req.user.rol,
        created_at: req.user.created_at,
      },
    })
  } catch (error) {
    console.error("Error obteniendo perfil:", error)
    res.status(500).json({
      error: "Error obteniendo perfil",
      message: "No se pudo obtener la información del usuario",
    })
  }
})

// Listar todos los usuarios (solo admin)
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  /**
   * @swagger
   * /api/usuarios:
   *   get:
   *     summary: Listar todos los usuarios
   *     description: Solo accesible para administradores
   *     tags: [Usuarios]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de usuarios
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 usuarios:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Usuario'
   *                 total:
   *                   type: integer
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No autorizado
   *       500:
   *         description: Error del servidor
   */
  try {
    const result = await query(
      `SELECT id, email, nombre, rol, created_at 
       FROM usuarios 
       ORDER BY created_at DESC`,
    )

    res.json({
      usuarios: result.rows,
      total: result.rows.length,
    })
  } catch (error) {
    console.error("Error listando usuarios:", error)
    res.status(500).json({
      error: "Error listando usuarios",
      message: "No se pudieron obtener los usuarios",
    })
  }
})

// Actualizar rol de usuario (solo admin)
router.patch("/:id/rol", authMiddleware, adminMiddleware, async (req, res) => {
  /**
   * @swagger
   * /api/usuarios/{id}/rol:
   *   patch:
   *     summary: Actualizar rol de usuario
   *     description: Solo accesible para administradores
   *     tags: [Usuarios]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID del usuario
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - rol
   *             properties:
   *               rol:
   *                 type: string
   *                 enum: [admin, usuario]
   *                 example: admin
   *     responses:
   *       200:
   *         description: Rol actualizado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 usuario:
   *                   $ref: '#/components/schemas/Usuario'
   *       400:
   *         description: Rol inválido
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No autorizado
   *       404:
   *         description: Usuario no encontrado
   *       500:
   *         description: Error del servidor
   */
  try {
    const { id } = req.params
    const { rol } = req.body

    if (!["admin", "usuario"].includes(rol)) {
      return res.status(400).json({
        error: "Rol inválido",
        message: 'El rol debe ser "admin" o "usuario"',
      })
    }

    const result = await query(
      `UPDATE usuarios 
       SET rol = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING id, email, nombre, rol`,
      [rol, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Usuario no encontrado",
        message: "El usuario especificado no existe",
      })
    }

    const usuario = result.rows[0]

    res.json({
      message: "Rol actualizado exitosamente",
      usuario,
    })
  } catch (error) {
    console.error("Error actualizando rol:", error)
    res.status(500).json({
      error: "Error actualizando rol",
      message: "No se pudo actualizar el rol del usuario",
    })
  }
})

module.exports = router
