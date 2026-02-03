-- Migration: Add user_gamification table
-- Date: 2026-02-03

CREATE TABLE IF NOT EXISTS user_gamification (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    xp_total INT NOT NULL DEFAULT 0,
    nivel INT NOT NULL DEFAULT 1,
    racha_actual INT NOT NULL DEFAULT 0,
    racha_maxima INT NOT NULL DEFAULT 0,
    ultimo_dia_activo DATE,
    sesiones_totales INT NOT NULL DEFAULT 0,
    minutos_totales INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_gamification_user_id ON user_gamification(user_id);

-- RLS
ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own gamification profile"
    ON user_gamification FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gamification profile"
    ON user_gamification FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gamification profile"
    ON user_gamification FOR UPDATE
    USING (auth.uid() = user_id);
