const Joi = require("joi")

const schemas = {
  // Validación para registro de usuario
  registro: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Debe ser un email válido",
      "any.required": "El email es requerido",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "La contraseña debe tener al menos 6 caracteres",
      "any.required": "La contraseña es requerida",
    }),
    nombre: Joi.string().min(2).max(100).required().messages({
      "string.min": "El nombre debe tener al menos 2 caracteres",
      "string.max": "El nombre no puede exceder 100 caracteres",
      "any.required": "El nombre es requerido",
    }),
  }),

  // Validación para login
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // Validación para eventos
  evento: Joi.object({
    titulo: Joi.string().min(3).max(200).required(),
    descripcion: Joi.string().max(1000).allow(""),
    fecha: Joi.date().iso().required(),
  }),

  // Validación para funciones
  funcion: Joi.object({
    titulo: Joi.string().min(3).max(200).required(),
    descripcion: Joi.string().max(1000).allow(""),
    fecha: Joi.date().iso().required(),
  }),

  // Validación para votaciones
  votacion: Joi.object({
    titulo: Joi.string().min(3).max(200).required(),
    descripcion: Joi.string().max(1000).allow(""),
    opciones: Joi.array().items(Joi.string()).min(2).required(),
    fecha_fin: Joi.date().iso().required(),
  }),
}

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({
        error: "Datos inválidos",
        message: error.details[0].message,
      })
    }
    next()
  }
}

module.exports = {
  schemas,
  validate,
}
