// routes/libros.js

const express = require('express');
const router = express.Router();
const { buscarLibros } = require('../utils/scraper');

/**
 * @swagger
 * tags: [Libros]
 * name: Libros
 * description: Búsqueda y gestión de libros a través de scraping.
 */

/**
 * @swagger
 * /api/libros/buscar:
 *   get:
 *     summary: Buscar libros
 *     description: Buscar libros por término usando scraping
 *     tags: [Libros]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *       - in: query
 *         name: idx
 *         required: false
 *         schema:
 *           type: string
 *         description: Índice de búsqueda
 *       - in: query
 *         name: pagina
 *         required: false
 *         schema:
 *           type: string
 *         description: Número de página
 *     responses:
 *       200:
 *         description: Resultados de la búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 paginacion:
 *                   type: object
 *                 resultados:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Parámetro de búsqueda faltante
 *       404:
 *         description: No se encontraron libros
 *       500:
 *         description: Error del servidor
 */
router.get('/buscar', async (req, res) => {
    const { q, idx, pagina } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'El parámetro de búsqueda "q" es obligatorio.' });
    }

    try {
        const { libros, paginacion } = await buscarLibros(q, idx, pagina);


        res.json({
            paginacion,
            resultados: libros
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Ocurrió un error en el servidor al realizar la búsqueda.',
            message: error.message
        });
    }
});

module.exports = router;