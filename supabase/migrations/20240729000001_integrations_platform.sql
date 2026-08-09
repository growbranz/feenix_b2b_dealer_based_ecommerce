-- Integrations & Background Processing Platform
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  provider TEXT,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  last_checked_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  event TEXT NOT NULL,
  secret TEXT,
  is_active BOOLEAN DEFAULT true,
  retry_count INTEGER DEFAULT 3,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES public.webhooks(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  response_status INTEGER,
  response_body TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_preview TEXT NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.api_key_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE,
  endpoint TEXT,
  method TEXT,
  status INTEGER,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.system_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  priority INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.scheduled_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  cron TEXT,
  interval_minutes INTEGER,
  job_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.system_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  actor_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  status TEXT,
  metadata JSONB,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_integrations_key ON public.integrations(key);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook ON public.webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON public.webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_system_jobs_status ON public.system_jobs(status);
CREATE INDEX IF NOT EXISTS idx_system_jobs_scheduled ON public.system_jobs(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_system_audit_logs_created ON public.system_audit_logs(created_at DESC);

-- RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_key_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY integrations_admin ON public.integrations FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'ADMIN');
CREATE POLICY webhooks_admin ON public.webhooks FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'ADMIN');
CREATE POLICY webhook_logs_admin ON public.webhook_logs FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'ADMIN');
CREATE POLICY api_keys_admin ON public.api_keys FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'ADMIN');
CREATE POLICY api_key_usage_logs_admin ON public.api_key_usage_logs FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'ADMIN');
CREATE POLICY system_jobs_admin ON public.system_jobs FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'ADMIN');
CREATE POLICY scheduled_tasks_admin ON public.scheduled_tasks FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'ADMIN');
CREATE POLICY system_audit_logs_admin ON public.system_audit_logs FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'ADMIN');

-- Default integrations
INSERT INTO public.integrations (key, name, provider, is_active, status, config)
VALUES
  ('resend', 'Resend Email', 'resend', true, 'active', '{"apiKey":"RESEND_API_KEY"}'),
  ('razorpay', 'Razorpay Payments', 'razorpay', true, 'active', '{"keyId":"RAZORPAY_KEY_ID","keySecret":"RAZORPAY_KEY_SECRET"}'),
  ('supabase_storage', 'Supabase Storage', 'supabase', true, 'active', '{}'),
  ('google_analytics', 'Google Analytics', 'google', false, 'pending', '{}'),
  ('google_maps', 'Google Maps', 'google', false, 'pending', '{}'),
  ('cloudinary', 'Cloudinary', 'cloudinary', false, 'pending', '{}'),
  ('slack', 'Slack', 'slack', false, 'pending', '{}'),
  ('whatsapp', 'WhatsApp Business', 'whatsapp', false, 'pending', '{}')
ON CONFLICT (key) DO NOTHING;

-- Default scheduled tasks
INSERT INTO public.scheduled_tasks (name, interval_minutes, job_type, payload)
VALUES
  ('daily_cleanup', 1440, 'cleanup', '{}'),
  ('weekly_reports', 10080, 'reports', '{}'),
  ('inventory_reconciliation', 60, 'inventory_sync', '{}'),
  ('log_cleanup', 10080, 'cleanup', '{}')
ON CONFLICT (name) DO NOTHING;
