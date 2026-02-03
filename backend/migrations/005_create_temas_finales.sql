-- Migracion: Crear tablas para "La Fija" - Banco Colaborativo de Temas de Finales
-- Fecha: 2026

-- Tabla principal de temas reportados en finales
CREATE TABLE IF NOT EXISTS temas_finales (
    id SERIAL PRIMARY KEY,
    materia_id INTEGER NOT NULL REFERENCES materias(id),
    tema VARCHAR(300) NOT NULL,
    fecha_mesa DATE,
    es_anonimo BOOLEAN DEFAULT FALSE,
    user_id UUID NOT NULL REFERENCES users(id),
    votos_utiles INTEGER DEFAULT 0,
    votos_no_utiles INTEGER DEFAULT 0,
    reportes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de votos de temas de finales
CREATE TABLE IF NOT EXISTS votos_temas_finales (
    id SERIAL PRIMARY KEY,
    tema_final_id INTEGER NOT NULL REFERENCES temas_finales(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    tipo tipo_voto_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tema_final_id, user_id)
);

-- Tabla de reportes de temas de finales
CREATE TABLE IF NOT EXISTS reportes_temas_finales (
    id SERIAL PRIMARY KEY,
    tema_final_id INTEGER NOT NULL REFERENCES temas_finales(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    motivo VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tema_final_id, user_id)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_temas_finales_materia_id ON temas_finales(materia_id);
CREATE INDEX IF NOT EXISTS idx_temas_finales_user_id ON temas_finales(user_id);
CREATE INDEX IF NOT EXISTS idx_votos_temas_finales_tema_final_id ON votos_temas_finales(tema_final_id);
CREATE INDEX IF NOT EXISTS idx_votos_temas_finales_user_id ON votos_temas_finales(user_id);
CREATE INDEX IF NOT EXISTS idx_reportes_temas_finales_tema_final_id ON reportes_temas_finales(tema_final_id);
CREATE INDEX IF NOT EXISTS idx_reportes_temas_finales_user_id ON reportes_temas_finales(user_id);

-- RLS policies
ALTER TABLE temas_finales ENABLE ROW LEVEL SECURITY;
ALTER TABLE votos_temas_finales ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_temas_finales ENABLE ROW LEVEL SECURITY;

-- Policies para temas_finales
CREATE POLICY "temas_finales_select" ON temas_finales FOR SELECT USING (true);
CREATE POLICY "temas_finales_insert" ON temas_finales FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "temas_finales_update" ON temas_finales FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "temas_finales_delete" ON temas_finales FOR DELETE USING (auth.uid() = user_id);

-- Policies para votos_temas_finales
CREATE POLICY "votos_temas_finales_select" ON votos_temas_finales FOR SELECT USING (true);
CREATE POLICY "votos_temas_finales_insert" ON votos_temas_finales FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "votos_temas_finales_delete" ON votos_temas_finales FOR DELETE USING (auth.uid() = user_id);

-- Policies para reportes_temas_finales
CREATE POLICY "reportes_temas_finales_select" ON reportes_temas_finales FOR SELECT USING (true);
CREATE POLICY "reportes_temas_finales_insert" ON reportes_temas_finales FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger para updated_at en temas_finales
CREATE OR REPLACE TRIGGER update_temas_finales_updated_at
    BEFORE UPDATE ON temas_finales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
