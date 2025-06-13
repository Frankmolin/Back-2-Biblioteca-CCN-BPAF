-- Insertar usuario administrador de ejemplo
-- Contraseña: admin123
INSERT INTO usuarios (email, password, nombre, rol) VALUES 
('admin@biblioteca.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Administrador Sistema', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insertar usuario normal de ejemplo
-- Contraseña: usuario123
INSERT INTO usuarios (email, password, nombre, rol) VALUES 
('usuario@biblioteca.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Usuario Test', 'usuario')
ON CONFLICT (email) DO NOTHING;

-- Insertar más usuarios de ejemplo
INSERT INTO usuarios (email, password, nombre, rol) VALUES 
('maria@biblioteca.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'María García', 'usuario'),
('carlos@biblioteca.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Carlos López', 'usuario')
ON CONFLICT (email) DO NOTHING;

-- Insertar eventos de ejemplo
INSERT INTO eventos (titulo, descripcion, fecha, created_by) 
SELECT 
  'Conferencia de Literatura Contemporánea',
  'Un evento dedicado a explorar las tendencias actuales en la literatura mundial. Contaremos con la participación de reconocidos autores y críticos literarios.',
  '2024-12-15 18:00:00+00',
  u.id
FROM usuarios u WHERE u.rol = 'admin' LIMIT 1;

INSERT INTO eventos (titulo, descripcion, fecha, created_by) 
SELECT 
  'Taller de Escritura Creativa',
  'Aprende técnicas de escritura creativa con autores reconocidos. Un espacio para desarrollar tu creatividad literaria.',
  '2024-12-20 16:00:00+00',
  u.id
FROM usuarios u WHERE u.rol = 'admin' LIMIT 1;

INSERT INTO eventos (titulo, descripcion, fecha, created_by) 
SELECT 
  'Presentación de Libro: "Nuevas Voces"',
  'Presentación del libro que recopila obras de nuevos talentos literarios de la región.',
  '2024-12-25 19:00:00+00',
  u.id
FROM usuarios u WHERE u.rol = 'admin' LIMIT 1;

-- Insertar funciones de ejemplo
INSERT INTO funciones (titulo, descripcion, fecha, created_by) 
SELECT 
  'Obra: Romeo y Julieta',
  'Presentación clásica de la obra de Shakespeare por la compañía teatral local.',
  '2024-12-18 20:00:00+00',
  u.id
FROM usuarios u WHERE u.rol = 'admin' LIMIT 1;

INSERT INTO funciones (titulo, descripcion, fecha, created_by) 
SELECT 
  'Concierto de Música Clásica',
  'Velada musical con obras de compositores clásicos interpretadas por la orquesta sinfónica.',
  '2024-12-22 19:30:00+00',
  u.id
FROM usuarios u WHERE u.rol = 'admin' LIMIT 1;

INSERT INTO funciones (titulo, descripcion, fecha, created_by) 
SELECT 
  'Espectáculo de Danza Contemporánea',
  'Presentación de danza contemporánea con coreografías originales.',
  '2024-12-28 20:30:00+00',
  u.id
FROM usuarios u WHERE u.rol = 'admin' LIMIT 1;

-- Insertar votaciones de ejemplo
INSERT INTO votaciones (titulo, descripcion, opciones, fecha_fin, created_by) 
SELECT 
  'Mejor Libro del Año 2024',
  'Vota por el libro que consideres el mejor del año entre estas opciones seleccionadas.',
  '["Cien años de soledad", "1984", "El Quijote", "Rayuela", "Pedro Páramo"]'::jsonb,
  '2024-12-31 23:59:59+00',
  u.id
FROM usuarios u WHERE u.rol = 'admin' LIMIT 1;

INSERT INTO votaciones (titulo, descripcion, opciones, fecha_fin, created_by) 
SELECT 
  'Próximo Evento Cultural',
  'Ayúdanos a decidir qué tipo de evento organizar próximamente en nuestra biblioteca.',
  '["Exposición de Arte", "Festival de Música", "Feria del Libro", "Ciclo de Cine", "Taller de Fotografía"]'::jsonb,
  '2024-12-25 23:59:59+00',
  u.id
FROM usuarios u WHERE u.rol = 'admin' LIMIT 1;

INSERT INTO votaciones (titulo, descripcion, opciones, fecha_fin, created_by) 
SELECT 
  'Horario Preferido para Eventos',
  'Queremos conocer tu preferencia de horario para los eventos de la biblioteca.',
  '["Mañana (9:00-12:00)", "Tarde (14:00-17:00)", "Noche (18:00-21:00)", "Fin de semana"]'::jsonb,
  '2024-12-30 23:59:59+00',
  u.id
FROM usuarios u WHERE u.rol = 'admin' LIMIT 1;

-- Insertar algunos votos de ejemplo
INSERT INTO votos (votacion_id, usuario_id, opcion)
SELECT 
  v.id,
  u.id,
  'Cien años de soledad'
FROM votaciones v, usuarios u 
WHERE v.titulo = 'Mejor Libro del Año 2024' 
AND u.email = 'usuario@biblioteca.com'
LIMIT 1;

INSERT INTO votos (votacion_id, usuario_id, opcion)
SELECT 
  v.id,
  u.id,
  'Festival de Música'
FROM votaciones v, usuarios u 
WHERE v.titulo = 'Próximo Evento Cultural' 
AND u.email = 'maria@biblioteca.com'
LIMIT 1;
