const express = require("express")
const { v4: uuidv4 } = require("uuid")
const { query } = require("../config/database")
const { authMiddleware, adminMiddleware } = require("../middlewares/auth")
const { validate, schemas } = require("../utils/validation")
const { upload, deleteFile, getFileUrl } = require("../utils/fileUpload")

/**
 * @swagger
 * tags:
 *   name: Eventos
 *   description: Gestión de eventos de la biblioteca
 */

const router = express.Router()

// Listar todos los eventos
/**
 * @swagger
 * /api/eventos:
 *   get:
 *     summary: Listar todos los eventos
 *     description: Obtiene la lista de todos los eventos
 *     tags: [Eventos]
 *     responses:
 *       200:
 *         description: Lista de eventos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 eventos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Evento'
 *                 total:
 *                   type: integer
 *       500:
 *         description: Error del servidor
 */
router.get("/", async (req, res) => {
  try {
    const result = await query(`
      SELECT e.*, u.nombre as creador_nombre
      FROM eventos e
      LEFT JOIN usuarios u ON e.created_by = u.id
      ORDER BY e.fecha ASC
    `)

    // Agregar URLs completas de imágenes
    const eventos = result.rows.map((evento) => ({
      ...evento,
      imagen_url: evento.imagen_url ? getFileUrl(req, evento.imagen_url, "eventos") : null,
    }))

    res.json({
      eventos,
      total: eventos.length,
    })
  } catch (error) {
    console.error("Error listando eventos:", error)
    res.status(500).json({
      error: "Error listando eventos",
      message: "No se pudieron obtener los eventos",
    })
  }
})

// Obtener evento por ID
/**
 * @swagger
 * /api/eventos/{id}:
 *   get:
 *     summary: Obtener evento por ID
 *     description: Obtiene los detalles de un evento específico
 *     tags: [Eventos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Detalles del evento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 evento:
 *                   $ref: '#/components/schemas/Evento'
 *       404:
 *         description: Evento no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const result = await query(
      `SELECT e.*, u.nombre as creador_nombre
       FROM eventos e
       LEFT JOIN usuarios u ON e.created_by = u.id
       WHERE e.id = $1`,
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Evento no encontrado",
        message: "El evento solicitado no existe",
      })
    }

    const evento = result.rows[0]
    evento.imagen_url = evento.imagen_url ? getFileUrl(req, evento.imagen_url, "eventos") : null

    res.json({ evento })
  } catch (error) {
    console.error("Error obteniendo evento:", error)
    res.status(500).json({
      error: "Error obteniendo evento",
      message: "No se pudo obtener el evento",
    })
  }
})

// Crear nuevo evento (solo admin)
/**
 * @swagger
 * /api/eventos:
 *   post:
 *     summary: Crear nuevo evento
 *     description: Solo accesible para administradores
 *     tags: [Eventos]
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
 *                 example: Conferencia de Literatura
 *               descripcion:
 *                 type: string
 *                 example: Evento sobre literatura contemporánea
 *               fecha:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-12-31T18:00:00Z
 *               imagen:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Evento creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 evento:
 *                   $ref: '#/components/schemas/Evento'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.single("imagen"),
  validate(schemas.evento),
  async (req, res) => {
    try {
      const { titulo, descripcion, fecha } = req.body
      const imagen_url = req.file ? req.file.filename : null

      const eventoId = uuidv4()
      const result = await query(
        `INSERT INTO eventos (id, titulo, descripcion, fecha, imagen_url, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
        [eventoId, titulo, descripcion, fecha, imagen_url, req.user.id],
      )

      const evento = result.rows[0]
      evento.imagen_url = evento.imagen_url ? getFileUrl(req, evento.imagen_url, "eventos") : null

      res.status(201).json({
        message: "Evento creado exitosamente",
        evento,
      })
    } catch (error) {
      console.error("Error creando evento:", error)
      // Si hay error, eliminar archivo subido
      if (req.file) {
        deleteFile(req.file.path)
      }
      res.status(500).json({
        error: "Error creando evento",
        message: "No se pudo crear el evento",
      })
    }
  },
)

router.put("/:id", authMiddleware, adminMiddleware, upload.single("imagen"), async (req, res) => {
  /**
   * @swagger
   * /api/eventos/{id}:
   *   put:
   *     summary: Actualizar evento
   *     description: Solo accesible para administradores
   *     tags: [Eventos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID del evento
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               titulo:
   *                 type: string
   *                 example: Nuevo Título
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
   *         description: Evento actualizado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 evento:
   *                   $ref: '#/components/schemas/Evento'
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No autorizado
   *       404:
   *         description: Evento no encontrado
   *       500:
   *         description: Error del servidor
   */
  try {
    const { id } = req.params
    const { titulo, descripcion, fecha } = req.body

    // Obtener evento actual para manejar imagen anterior
    const currentEvent = await query("SELECT imagen_url FROM eventos WHERE id = $1", [id])

    if (currentEvent.rows.length === 0) {
      if (req.file) deleteFile(req.file.path)
      return res.status(404).json({
        error: "Evento no encontrado",
        message: "El evento especificado no existe",
      })
    }

    let imagen_url = currentEvent.rows[0].imagen_url

    // Si se subió nueva imagen, eliminar la anterior y usar la nueva
    if (req.file) {
      if (imagen_url) {
        deleteFile(`uploads/eventos/${imagen_url}`)
      }
      imagen_url = req.file.filename
    }

    const result = await query(
      `UPDATE eventos 
       SET titulo = $1, descripcion = $2, fecha = $3, imagen_url = $4, updated_at = NOW()
       WHERE id = $5 
       RETURNING *`,
      [titulo, descripcion, fecha, imagen_url, id],
    )

    const evento = result.rows[0]
    evento.imagen_url = evento.imagen_url ? getFileUrl(req, evento.imagen_url, "eventos") : null

    res.json({
      message: "Evento actualizado exitosamente",
      evento,
    })
  } catch (error) {
    console.error("Error actualizando evento:", error)
    if (req.file) deleteFile(req.file.path)
    res.status(500).json({
      error: "Error actualizando evento",
      message: "No se pudo actualizar el evento",
    })
  }
})


router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  /**
   * @swagger
   * /api/eventos/{id}:
   *   delete:
   *     summary: Eliminar evento
   *     description: Solo accesible para administradores
   *     tags: [Eventos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID del evento
   *     responses:
   *       200:
   *         description: Evento eliminado exitosamente
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
   *         description: Evento no encontrado
   *       500:
   *         description: Error del servidor
   */
  try {
    const { id } = req.params

    // Obtener evento para eliminar imagen
    const result = await query("SELECT imagen_url FROM eventos WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Evento no encontrado",
        message: "El evento especificado no existe",
      })
    }

    const evento = result.rows[0]

    // Eliminar evento de la base de datos
    await query("DELETE FROM eventos WHERE id = $1", [id])

    // Eliminar archivo de imagen si existe
    if (evento.imagen_url) {
      deleteFile(`uploads/eventos/${evento.imagen_url}`)
    }

    res.json({
      message: "Evento eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error eliminando evento:", error)
    res.status(500).json({
      error: "Error eliminando evento",
      message: "No se pudo eliminar el evento",
    })
  }
})

module.exports = router
