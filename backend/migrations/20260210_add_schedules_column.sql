-- Migration: Add multiple schedules support to usuario_materias
ALTER TABLE usuario_materias ADD COLUMN IF NOT EXISTS schedules JSONB DEFAULT '[]'::jsonb;

-- Commment explaining the structure:
-- schedules: [
--   { "dia": "LU", "hora": 18, "duracion": 2, "aula": "304" },
--   { "dia": "MI", "hora": 18, "duracion": 2, "aula": "305" }
-- ]
