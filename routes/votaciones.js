const express = require("express")
const { v4: uuidv4 } = require("uuid")
const { query, getClient } = require("../config/database")
const { authMiddleware, adminMiddleware } = require("../middlewares/auth")
const { validate, schemas } = require("../utils/validation")

const router = express.Router()

/**
 * @swagger
 * /api/votaciones:
 *   get:
 *     summary: Listar todas las votaciones
 *     description: Obtiene la lista de todas las votaciones
 *     tags: [Votaciones]
 *     responses:
 *       200:
 *         description: Lista de votaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 votaciones:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Votacion'
 *                 total:
 *                   type: integer
 *       500:
 *         description: Error del servidor
 */
router.get("/", async (req, res) => {

  try {
    const result = await query(`
      SELECT v.*, u.nombre as creador_nombre
      FROM votaciones v
      LEFT JOIN usuarios u ON v.created_by = u.id
      ORDER BY v.created_at DESC
    `)

    res.json({
      votaciones: result.rows,
      total: result.rows.length,
    })
  } catch (error) {
    console.error("Error listando votaciones:", error)
    res.status(500).json({
      error: "Error listando votaciones",
      message: "No se pudieron obtener las votaciones",
    })
  }
})

/**
 * @swagger
 * /api/votaciones/{id}:
 *   get:
 *     summary: Obtener votación por ID con resultados
 *     description: Devuelve la información de una votación y sus resultados
 *     tags: [Votaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la votación
 *     responses:
 *       200:
 *         description: Detalle de la votación y resultados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 votacion:
 *                   $ref: '#/components/schemas/Votacion'
 *                 resultados:
 *                   type: object
 *                 total_votos:
 *                   type: integer
 *       404:
 *         description: Votación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get("/:id", async (req, res) => {
  /*
    #swagger.tags = ['Votaciones']
    #swagger.summary = 'Obtener votación por ID con resultados'
  */
  try {
    const { id } = req.params

    // Obtener votación
    const votacionResult = await query(
      `SELECT v.*, u.nombre as creador_nombre
       FROM votaciones v
       LEFT JOIN usuarios u ON v.created_by = u.id
       WHERE v.id = $1`,
      [id],
    )

    if (votacionResult.rows.length === 0) {
      return res.status(404).json({
        error: "Votación no encontrada",
        message: "La votación solicitada no existe",
      })
    }

    const votacion = votacionResult.rows[0]

    // Obtener votos
    const votosResult = await query("SELECT opcion FROM votos WHERE votacion_id = $1", [id])

    // Calcular resultados
    const resultados = {}
    votacion.opciones.forEach((opcion) => {
      resultados[opcion] = votosResult.rows.filter((voto) => voto.opcion === opcion).length
    })

    res.json({
      votacion,
      resultados,
      total_votos: votosResult.rows.length,
    })
  } catch (error) {
    console.error("Error obteniendo votación:", error)
    res.status(500).json({
      error: "Error obteniendo votación",
      message: "No se pudo obtener la votación",
    })
  }
})

/**
 * @swagger
 * /api/votaciones:
 *   post:
 *     summary: Crear nueva votación
 *     description: Crea una nueva votación (solo administradores)
 *     tags: [Votaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - opciones
 *               - fecha_fin
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: Mejor Libro del Año
 *               descripcion:
 *                 type: string
 *                 example: Votación para elegir el mejor libro
 *               opciones:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Opción 1", "Opción 2", "Opción 3"]
 *               fecha_fin:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-12-31T23:59:59Z
 *     responses:
 *       201:
 *         description: Votación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 votacion:
 *                   $ref: '#/components/schemas/Votacion'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post("/", authMiddleware, adminMiddleware, validate(schemas.votacion), async (req, res) => {
  /*
    #swagger.tags = ['Votaciones']
    #swagger.summary = 'Crear nueva votación'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Datos de la votación',
      required: true,
      schema: {
        titulo: 'Mejor Libro del Año',
        descripcion: 'Votación para elegir el mejor libro',
        opciones: ['Opción 1', 'Opción 2', 'Opción 3'],
        fecha_fin: '2024-12-31T23:59:59Z'
      }
    }
  */
  try {
    const { titulo, descripcion, opciones, fecha_fin } = req.body

    const votacionId = uuidv4()
    const result = await query(
      `INSERT INTO votaciones (id, titulo, descripcion, opciones, fecha_fin, activa, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [votacionId, titulo, descripcion, JSON.stringify(opciones), fecha_fin, true, req.user.id],
    )

    const votacion = result.rows[0]

    res.status(201).json({
      message: "Votación creada exitosamente",
      votacion,
    })
  } catch (error) {
    console.error("Error creando votación:", error)
    res.status(500).json({
      error: "Error creando votación",
      message: "No se pudo crear la votación",
    })
  }
})

/**
 * @swagger
 * /api/votaciones/{id}/votar:
 *   post:
 *     summary: Votar en una votación
 *     description: Permite a un usuario autenticado votar en una votación activa
 *     tags: [Votaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la votación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - opcion
 *             properties:
 *               opcion:
 *                 type: string
 *                 example: Opción 1
 *     responses:
 *       201:
 *         description: Voto registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 voto:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     opcion:
 *                       type: string
 *                     fecha:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Datos inválidos o ya votaste
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Votación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.post("/:id/votar", authMiddleware, async (req, res) => {
  /*
    #swagger.tags = ['Votaciones']
    #swagger.summary = 'Votar en una votación'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID de la votación',
      required: true,
      type: 'string'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Opción de voto',
      required: true,
      schema: {
        opcion: 'Opción 1'
      }
    }
  */
  const client = await getClient()

  try {
    const { id } = req.params
    const { opcion } = req.body

    if (!opcion) {
      return res.status(400).json({
        error: "Opción requerida",
        message: "Debe seleccionar una opción para votar",
      })
    }

    await client.query("BEGIN")

    // Verificar que la votación existe y está activa
    const votacionResult = await client.query("SELECT * FROM votaciones WHERE id = $1", [id])

    if (votacionResult.rows.length === 0) {
      await client.query("ROLLBACK")
      return res.status(404).json({
        error: "Votación no encontrada",
        message: "La votación solicitada no existe",
      })
    }

    const votacion = votacionResult.rows[0]

    if (!votacion.activa) {
      await client.query("ROLLBACK")
      return res.status(400).json({
        error: "Votación inactiva",
        message: "Esta votación ya no está activa",
      })
    }

    if (new Date() > new Date(votacion.fecha_fin)) {
      await client.query("ROLLBACK")
      return res.status(400).json({
        error: "Votación finalizada",
        message: "El período de votación ha finalizado",
      })
    }

    if (!votacion.opciones.includes(opcion)) {
      await client.query("ROLLBACK")
      return res.status(400).json({
        error: "Opción inválida",
        message: "La opción seleccionada no es válida",
      })
    }

    // Verificar si el usuario ya votó
    const votoExistente = await client.query("SELECT id FROM votos WHERE votacion_id = $1 AND usuario_id = $2", [
      id,
      req.user.id,
    ])

    if (votoExistente.rows.length > 0) {
      await client.query("ROLLBACK")
      return res.status(400).json({
        error: "Ya votaste",
        message: "Ya has emitido tu voto en esta votación",
      })
    }

    // Registrar voto
    const votoId = uuidv4()
    const votoResult = await client.query(
      `INSERT INTO votos (id, votacion_id, usuario_id, opcion) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [votoId, id, req.user.id, opcion],
    )

    await client.query("COMMIT")

    const voto = votoResult.rows[0]

    res.status(201).json({
      message: "Voto registrado exitosamente",
      voto: {
        id: voto.id,
        opcion: voto.opcion,
        fecha: voto.created_at,
      },
    })
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Error registrando voto:", error)
    res.status(500).json({
      error: "Error registrando voto",
      message: "No se pudo registrar el voto",
    })
  } finally {
    client.release()
  }
})

/**
 * @swagger
 * /api/votaciones/{id}:
 *   put:
 *     summary: Actualizar votación
 *     description: Actualiza los datos de una votación (solo administradores)
 *     tags: [Votaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la votación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               fecha_fin:
 *                 type: string
 *                 format: date-time
 *               activa:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Votación actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 votacion:
 *                   $ref: '#/components/schemas/Votacion'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Votación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  /*
    #swagger.tags = ['Votaciones']
    #swagger.summary = 'Actualizar votación'
    #swagger.security = [{ "bearerAuth": [] }]
  */
  try {
    const { id } = req.params
    const { titulo, descripcion, fecha_fin, activa } = req.body

    const result = await query(
      `UPDATE votaciones 
       SET titulo = $1, descripcion = $2, fecha_fin = $3, activa = $4, updated_at = NOW()
       WHERE id = $5 
       RETURNING *`,
      [titulo, descripcion, fecha_fin, activa, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Votación no encontrada",
        message: "La votación especificada no existe",
      })
    }

    res.json({
      message: "Votación actualizada exitosamente",
      votacion: result.rows[0],
    })
  } catch (error) {
    console.error("Error actualizando votación:", error)
    res.status(500).json({
      error: "Error actualizando votación",
      message: "No se pudo actualizar la votación",
    })
  }
})

/**
 * @swagger
 * /api/votaciones/{id}:
 *   delete:
 *     summary: Eliminar votación
 *     description: Elimina una votación y sus votos relacionados (solo administradores)
 *     tags: [Votaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la votación
 *     responses:
 *       200:
 *         description: Votación eliminada exitosamente
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
 *         description: Votación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  /*
    #swagger.tags = ['Votaciones']
    #swagger.summary = 'Eliminar votación'
    #swagger.security = [{ "bearerAuth": [] }]
  */
  const client = await getClient()

  try {
    const { id } = req.params

    await client.query("BEGIN")

    // Primero eliminar votos relacionados
    await client.query("DELETE FROM votos WHERE votacion_id = $1", [id])

    // Luego eliminar la votación
    const result = await client.query("DELETE FROM votaciones WHERE id = $1 RETURNING id", [id])

    if (result.rows.length === 0) {
      await client.query("ROLLBACK")
      return res.status(404).json({
        error: "Votación no encontrada",
        message: "La votación especificada no existe",
      })
    }

    await client.query("COMMIT")

    res.json({
      message: "Votación eliminada exitosamente",
    })
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Error eliminando votación:", error)
    res.status(500).json({
      error: "Error eliminando votación",
      message: "No se pudo eliminar la votación",
    })
  } finally {
    client.release()
  }
})

module.exports = router
