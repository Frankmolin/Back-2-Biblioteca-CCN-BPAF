const express = require("express")
const { v4: uuidv4 } = require("uuid")
const { query } = require("../config/database")
const { authMiddleware, adminMiddleware } = require("../middlewares/auth")
const { validate, schemas } = require("../utils/validation")
const { upload, deleteFile, getFileUrl } = require("../utils/fileUpload")

const router = express.Router()

// Listar todas las funciones
router.get("/", async (req, res) => {
  /*
    #swagger.tags = ['Funciones']
    #swagger.summary = 'Listar todas las funciones'
  */
  try {
    /**
     * @swagger
     * /api/funciones:
     *   get:
     *     summary: Listar todas las funciones
     *     description: Recupera una lista de todas las funciones, incluyendo los datos del creador de cada función.
     *     tags: [Funciones]
     *     responses:
     *       200:
     *         description: Lista de funciones obtenida exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 funciones:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Funcion'
     *                 total:
     *                   type: integer
     *                   example: 1
     *       500:
     *         description: Error del servidor
     */
    const result = await query(`
      SELECT f.*, u.nombre as creador_nombre
      FROM funciones f
      LEFT JOIN usuarios u ON f.created_by = u.id
      ORDER BY f.fecha ASC
    `)

    const funciones = result.rows.map((funcion) => ({
      ...funcion,
      imagen_url: funcion.imagen_url ? getFileUrl(req, funcion.imagen_url, "funciones") : null,
    }))

    res.json({
      funciones,
      total: funciones.length,
    })
  } catch (error) {
    console.error("Error listando funciones:", error)
    res.status(500).json({
      error: "Error listando funciones",
      message: "No se pudieron obtener las funciones",
    })
  }
})

// Obtener funci��n por ID
router.get("/:id", async (req, res) => {
 /*
    #swagger.tags = ['Funciones']
    #swagger.summary = 'Obtener función por ID'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID de la función',
      required: true,
      type: 'string'
    }
  */
  /**
   * @swagger
   * /api/funciones/{id}:
   *   get:
   *     summary: Obtener función por ID
   *     description: Recupera los detalles de una función específica usando su ID.
   *     tags: [Funciones]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID de la función a recuperar
   *     responses:
   *       200:
   *         description: Función encontrada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Funcion'
   *       404:
   *         description: Función no encontrada
   *       500:
   *         description: Error del servidor
   */
  try {
    const { id } = req.params

    const result = await query(
      `SELECT f.*, u.nombre as creador_nombre
       FROM funciones f
       LEFT JOIN usuarios u ON f.created_by = u.id
       WHERE f.id = $1`,
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Función no encontrada",
        message: "La función solicitada no existe",
      })
    }

    const funcion = result.rows[0]
    funcion.imagen_url = funcion.imagen_url ? getFileUrl(req, funcion.imagen_url, "funciones") : null

    res.json({ funcion })
  } catch (error) {
    console.error("Error obteniendo función:", error)
    res.status(500).json({
      error: "Error obteniendo función",
      message: "No se pudo obtener la función",
    })
  }
})

// Crear nueva función (solo admin)
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.single("imagen"),
  validate(schemas.funcion),
  async (req, res) => {
    /**
     * @swagger
     * /api/funciones:
     *   post:
     *     summary: Crear nueva función
     *     description: Solo accesible para administradores
     *     tags: [Funciones]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             required:
     *               - titulo
     *               - fecha
     *             properties:
     *               titulo:
     *                 type: string
     *                 example: Obra de teatro
     *               descripcion:
     *                 type: string
     *                 example: Descripción de la función
     *               fecha:
     *                 type: string
     *                 format: date-time
     *                 example: 2024-12-31T18:00:00Z
     *               imagen:
     *                 type: string
     *                 format: binary
     *     responses:
     *       201:
     *         description: Función creada exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 funcion:
     *                   $ref: '#/components/schemas/Funcion'
     *       400:
     *         description: Datos inválidos
     *       401:
     *         description: No autenticado
     *       403:
     *         description: No autorizado
     *       500:
     *         description: Error del servidor
     */
    try {
      const { titulo, descripcion, fecha } = req.body
      const imagen_url = req.file ? req.file.filename : null

      const funcionId = uuidv4()
      const result = await query(
        `INSERT INTO funciones (id, titulo, descripcion, fecha, imagen_url, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
        [funcionId, titulo, descripcion, fecha, imagen_url, req.user.id],
      )

      const funcion = result.rows[0]
      funcion.imagen_url = funcion.imagen_url ? getFileUrl(req, funcion.imagen_url, "funciones") : null

      res.status(201).json({
        message: "Función creada exitosamente",
        funcion,
      })
    } catch (error) {
      console.error("Error creando función:", error)
      if (req.file) deleteFile(req.file.path)
      res.status(500).json({
        error: "Error creando función",
        message: "No se pudo crear la función",
      })
    }
  },
)

// Actualizar función (solo admin)
router.put("/:id", authMiddleware, adminMiddleware, upload.single("imagen"), async (req, res) => {
  /**
   * @swagger
   * /api/funciones/{id}:
   *   put:
   *     summary: Actualizar función
   *     description: Solo accesible para administradores
   *     tags: [Funciones]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la función
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               titulo:
   *                 type: string
   *                 example: Nueva función
   *               descripcion:
   *                 type: string
   *                 example: Descripción actualizada
   *               fecha:
   *                 type: string
   *                 format: date-time
   *                 example: 2024-12-31T18:00:00Z
   *               imagen:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Función actualizada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 funcion:
   *                   $ref: '#/components/schemas/Funcion'
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No autorizado
   *       404:
   *         description: Función no encontrada
   *       500:
   *         description: Error del servidor
   */
  try {
    const { id } = req.params
    const { titulo, descripcion, fecha } = req.body

    const currentFunction = await query("SELECT imagen_url FROM funciones WHERE id = $1", [id])

    if (currentFunction.rows.length === 0) {
      if (req.file) deleteFile(req.file.path)
      return res.status(404).json({
        error: "Función no encontrada",
        message: "La función especificada no existe",
      })
    }

    let imagen_url = currentFunction.rows[0].imagen_url

    if (req.file) {
      if (imagen_url) {
        deleteFile(`uploads/funciones/${imagen_url}`)
      }
      imagen_url = req.file.filename
    }

    const result = await query(
      `UPDATE funciones 
       SET titulo = $1, descripcion = $2, fecha = $3, imagen_url = $4, updated_at = NOW()
       WHERE id = $5 
       RETURNING *`,
      [titulo, descripcion, fecha, imagen_url, id],
    )

    const funcion = result.rows[0]
    funcion.imagen_url = funcion.imagen_url ? getFileUrl(req, funcion.imagen_url, "funciones") : null

    res.json({
      message: "Función actualizada exitosamente",
      funcion,
    })
  } catch (error) {
    console.error("Error actualizando función:", error)
    if (req.file) deleteFile(req.file.path)
    res.status(500).json({
      error: "Error actualizando función",
      message: "No se pudo actualizar la función",
    })
  }
})

// Eliminar función (solo admin)
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  /**
   * @swagger
   * /api/funciones/{id}:
   *   delete:
   *     summary: Eliminar función
   *     description: Solo accesible para administradores
   *     tags: [Funciones]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la función
   *     responses:
   *       200:
   *         description: Función eliminada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No autorizado
   *       404:
   *         description: Función no encontrada
   *       500:
   *         description: Error del servidor
   */
  try {
    const { id } = req.params

    const result = await query("SELECT imagen_url FROM funciones WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Función no encontrada",
        message: "La función especificada no existe",
      })
    }

    const funcion = result.rows[0]

    await query("DELETE FROM funciones WHERE id = $1", [id])

    if (funcion.imagen_url) {
      deleteFile(`uploads/funciones/${funcion.imagen_url}`)
    }

    res.json({
      message: "Función eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error eliminando función:", error)
    res.status(500).json({
      error: "Error eliminando función",
      message: "No se pudo eliminar la función",
    })
  }
})

module.exports = router
