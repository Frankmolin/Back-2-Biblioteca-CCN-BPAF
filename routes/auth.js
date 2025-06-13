const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { v4: uuidv4 } = require("uuid")
const { query } = require("../config/database")
const { validate, schemas } = require("../utils/validation")

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints para autenticación de usuarios
 */

// Registro de usuario
router.post("/registro", validate(schemas.registro), async (req, res) => {
  /**
   * @swagger
   * /api/auth/registro:
   *   post:
   *     summary: Registrar nuevo usuario
   *     description: Crea una nueva cuenta de usuario
   *     tags: [Autenticación]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *               - nombre
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: usuario@ejemplo.com
   *               password:
   *                 type: string
   *                 format: password
   *                 example: contraseña123
   *               nombre:
   *                 type: string
   *                 example: Juan Pérez
   *     responses:
   *       201:
   *         description: Usuario registrado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 token:
   *                   type: string
   *                 usuario:
   *                   $ref: '#/components/schemas/Usuario'
   *       400:
   *         description: Datos inválidos o usuario ya existe
   *       500:
   *         description: Error del servidor
   */
  try {
    const { email, password, nombre } = req.body

    // Verificar si el usuario ya existe
    const existingUser = await query("SELECT id FROM usuarios WHERE email = $1", [email])

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: "Usuario ya existe",
        message: "Ya existe un usuario con este email",
      })
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear usuario
    const userId = uuidv4()
    const result = await query(
      `INSERT INTO usuarios (id, email, password, nombre, rol) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, nombre, rol, created_at`,
      [userId, email, hashedPassword, nombre, "usuario"],
    )

    const usuario = result.rows[0]

    // Generar token JWT
    const token = jwt.sign({ userId: usuario.id, email: usuario.email, rol: usuario.rol }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    })

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    })
  } catch (error) {
    console.error("Error en registro:", error)
    res.status(500).json({
      error: "Error en el registro",
      message: "No se pudo crear el usuario",
    })
  }
})

// Login de usuario
router.post("/login", validate(schemas.login), async (req, res) => {
  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Iniciar sesión
   *     description: Autentica un usuario y devuelve un token JWT
   *     tags: [Autenticación]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: usuario@ejemplo.com
   *               password:
   *                 type: string
   *                 format: password
   *                 example: contraseña123
   *     responses:
   *       200:
   *         description: Login exitoso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 token:
   *                   type: string
   *                 usuario:
   *                   $ref: '#/components/schemas/Usuario'
   *       401:
   *         description: Credenciales inválidas
   *       500:
   *         description: Error del servidor
   */
  try {
    const { email, password } = req.body

    // Buscar usuario
    const result = await query("SELECT * FROM usuarios WHERE email = $1", [email])

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Credenciales inválidas",
        message: "Email o contraseña incorrectos",
      })
    }

    const usuario = result.rows[0]

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, usuario.password)
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Credenciales inválidas",
        message: "Email o contraseña incorrectos",
      })
    }

    // Generar token JWT
    const token = jwt.sign({ userId: usuario.id, email: usuario.email, rol: usuario.rol }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    })

    res.json({
      message: "Login exitoso",
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    })
  } catch (error) {
    console.error("Error en login:", error)
    res.status(500).json({
      error: "Error en el login",
      message: "No se pudo autenticar el usuario",
    })
  }
})

module.exports = router
