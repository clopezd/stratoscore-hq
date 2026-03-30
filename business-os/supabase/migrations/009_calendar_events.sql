-- ── Calendar Events ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT false,
  account TEXT NOT NULL DEFAULT 'personal' CHECK (account IN ('personal', 'business', 'tasks')),
  color TEXT,
  location TEXT,
  task_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date ON calendar_events(user_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_account ON calendar_events(user_id, account);
