-- Extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  rol VARCHAR(50) DEFAULT 'usuario' CHECK (rol IN ('admin', 'usuario')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de eventos
CREATE TABLE IF NOT EXISTS eventos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha TIMESTAMP WITH TIME ZONE NOT NULL,
  imagen_url VARCHAR(500),
  created_by UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de funciones
CREATE TABLE IF NOT EXISTS funciones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha TIMESTAMP WITH TIME ZONE NOT NULL,
  imagen_url VARCHAR(500),
  created_by UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de votaciones
CREATE TABLE IF NOT EXISTS votaciones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  opciones JSONB NOT NULL,
  fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
  activa BOOLEAN DEFAULT true,
  created_by UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de votos
CREATE TABLE IF NOT EXISTS votos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  votacion_id UUID REFERENCES votaciones(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  opcion VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(votacion_id, usuario_id)
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha);
CREATE INDEX IF NOT EXISTS idx_eventos_created_by ON eventos(created_by);
CREATE INDEX IF NOT EXISTS idx_funciones_fecha ON funciones(fecha);
CREATE INDEX IF NOT EXISTS idx_funciones_created_by ON funciones(created_by);
CREATE INDEX IF NOT EXISTS idx_votaciones_activa ON votaciones(activa);
CREATE INDEX IF NOT EXISTS idx_votaciones_fecha_fin ON votaciones(fecha_fin);
CREATE INDEX IF NOT EXISTS idx_votaciones_created_by ON votaciones(created_by);
CREATE INDEX IF NOT EXISTS idx_votos_votacion ON votos(votacion_id);
CREATE INDEX IF NOT EXISTS idx_votos_usuario ON votos(usuario_id);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_eventos_updated_at ON eventos;
CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON eventos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_funciones_updated_at ON funciones;
CREATE TRIGGER update_funciones_updated_at BEFORE UPDATE ON funciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_votaciones_updated_at ON votaciones;
CREATE TRIGGER update_votaciones_updated_at BEFORE UPDATE ON votaciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Crear función para limpiar votaciones expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_votaciones()
RETURNS void AS $$
BEGIN
    UPDATE votaciones 
    SET activa = false 
    WHERE fecha_fin < NOW() AND activa = true;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE usuarios IS 'Tabla de usuarios del sistema';
COMMENT ON TABLE eventos IS 'Tabla de eventos de la biblioteca';
COMMENT ON TABLE funciones IS 'Tabla de funciones teatrales/culturales';
COMMENT ON TABLE votaciones IS 'Tabla de votaciones activas';
COMMENT ON TABLE votos IS 'Tabla de votos individuales';
