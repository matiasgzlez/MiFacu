-- Migracion: Crear tabla comentarios_calificaciones
-- Fecha: 2024

-- Crear tabla de comentarios
CREATE TABLE IF NOT EXISTS comentarios_calificaciones (
    id SERIAL PRIMARY KEY,
    calificacion_id INTEGER NOT NULL REFERENCES calificaciones_catedras(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    contenido TEXT NOT NULL,
    es_anonimo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indice para buscar comentarios por calificacion
CREATE INDEX IF NOT EXISTS idx_comentarios_calificacion_id ON comentarios_calificaciones(calificacion_id);

-- Indice para buscar comentarios por usuario
CREATE INDEX IF NOT EXISTS idx_comentarios_user_id ON comentarios_calificaciones(user_id);

-- Agregar columna avatar_url a users si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
        ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
    END IF;
END $$;
