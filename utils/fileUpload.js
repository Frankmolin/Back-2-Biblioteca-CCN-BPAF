const multer = require("multer")
const path = require("path")
const fs = require("fs")
const { v4: uuidv4 } = require("uuid")

// Crear directorio de uploads si no existe
const uploadDir = process.env.UPLOAD_DIR || "uploads"
const createUploadDirs = () => {
  const dirs = [uploadDir, `${uploadDir}/eventos`, `${uploadDir}/funciones`]
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
}

createUploadDirs()

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = uploadDir
    if (req.baseUrl.includes("eventos")) {
      folder = `${uploadDir}/eventos`
    } else if (req.baseUrl.includes("funciones")) {
      folder = `${uploadDir}/funciones`
    }
    cb(null, folder)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  },
})

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Solo se permiten archivos de imagen"), false)
  }
}

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
})

// Función para eliminar archivo
const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
}

// Función para obtener URL completa del archivo
const getFileUrl = (req, filename, folder = "") => {
  if (!filename) return null
  const baseUrl = `${req.protocol}://${req.get("host")}`
  return `${baseUrl}/uploads${folder ? "/" + folder : ""}/${filename}`
}

module.exports = {
  upload,
  deleteFile,
  getFileUrl,
}
