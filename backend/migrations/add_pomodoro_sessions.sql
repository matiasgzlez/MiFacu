-- Migration: Add pomodoro_sessions table
-- Date: 2026-02-03

CREATE TABLE IF NOT EXISTS pomodoro_sessions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('focus', 'short_break', 'long_break')),
    duracion_minutos INT NOT NULL,
    duracion_real_segundos INT NOT NULL,
    completada BOOLEAN NOT NULL DEFAULT false,
    materia_id INT REFERENCES materias(id) ON DELETE SET NULL,
    xp_ganado INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_pomodoro_sessions_user_id ON pomodoro_sessions(user_id);
CREATE INDEX idx_pomodoro_sessions_created_at ON pomodoro_sessions(created_at);
CREATE INDEX idx_pomodoro_sessions_user_completada ON pomodoro_sessions(user_id, completada);

-- RLS
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own pomodoro sessions"
    ON pomodoro_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pomodoro sessions"
    ON pomodoro_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);
