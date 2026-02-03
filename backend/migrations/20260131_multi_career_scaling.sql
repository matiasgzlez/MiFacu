-- Migración: Multi-Carreras y Universidades
-- Fecha: 2026-01-31

-- 1. Crear tabla de Universidades
CREATE TABLE IF NOT EXISTS universidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE,
    abreviatura TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Crear tabla de Carreras
CREATE TABLE IF NOT EXISTS carreras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    universidad_id UUID NOT NULL REFERENCES universidades(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Evitar duplicados de la misma carrera en la misma universidad
    UNIQUE(universidad_id, nombre)
);

-- 3. Modificar tabla de Materias para vincularla a una Carrera
-- Primero añadimos la columna como obligatoria (pero manejamos datos existentes)
ALTER TABLE materias ADD COLUMN IF NOT EXISTS carrera_id UUID REFERENCES carreras(id) ON DELETE SET NULL;

-- 4. Modificar tabla de Usuarios para que elijan su carrera
ALTER TABLE users ADD COLUMN IF NOT EXISTS carrera_id UUID REFERENCES carreras(id) ON DELETE SET NULL;

-- 5. Crear Índices en Llaves Foráneas (Sugerido por skill: schema-foreign-key-indexes)
CREATE INDEX IF NOT EXISTS idx_carreras_universidad_id ON carreras(universidad_id);
CREATE INDEX IF NOT EXISTS idx_materias_carrera_id ON materias(carrera_id);
CREATE INDEX IF NOT EXISTS idx_users_carrera_id ON users(carrera_id);

-- 6. Sembrar datos iniciales y Backfill (Para no romper los datos actuales)
DO $$
DECLARE
    univ_id UUID;
    carr_id UUID;
BEGIN
    -- Insertar UTN
    INSERT INTO universidades (nombre, abreviatura)
    VALUES ('Universidad Tecnológica Nacional', 'UTN')
    ON CONFLICT (nombre) DO UPDATE SET abreviatura = EXCLUDED.abreviatura
    RETURNING id INTO univ_id;

    -- Insertar Ingeniería en Sistemas vinculada a UTN
    INSERT INTO carreras (universidad_id, nombre)
    VALUES (univ_id, 'Ingeniería en Sistemas de Información')
    ON CONFLICT (universidad_id, nombre) DO UPDATE SET nombre = EXCLUDED.nombre
    RETURNING id INTO carr_id;

    -- Vincular materias huérfanas a Sistemas (Backfill)
    UPDATE materias SET carrera_id = carr_id WHERE carrera_id IS NULL;

    -- Vincular usuarios huérfanos a Sistemas (Backfill)
    UPDATE users SET carrera_id = carr_id WHERE carrera_id IS NULL;
END $$;

-- 7. Configurar RLS (Row Level Security) (Sugerido por skill: security-rls-basics)
-- Habilitar RLS en las nuevas tablas
ALTER TABLE universidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE carreras ENABLE ROW LEVEL SECURITY;

-- Políticas: Catálogos públicos (Lectura para todos, escritura solo admin/service_role)
DROP POLICY IF EXISTS "Universidades son públicas para lectura" ON universidades;
CREATE POLICY "Universidades son públicas para lectura" ON universidades
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Carreras son públicas para lectura" ON carreras;
CREATE POLICY "Carreras son públicas para lectura" ON carreras
    FOR SELECT TO public USING (true);

-- Nota: Las políticas de materias y usuario_materias se deben ajustar 
-- para filtrar por carrera_id si se desea aislamiento total entre facultades.
