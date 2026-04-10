-- ============================================================
-- Chat Sessions — Conversaciones del agente StratosCore
-- Persiste sesiones del widget web y WhatsApp
-- ============================================================

CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL DEFAULT 'web' CHECK (channel IN ('web', 'whatsapp')),
  lead_name TEXT,
  lead_email TEXT,
  lead_phone TEXT,
  lead_score INTEGER NOT NULL DEFAULT 0,
  messages JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'escalated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated ON chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_channel ON chat_sessions(channel);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_score ON chat_sessions(lead_score DESC);
