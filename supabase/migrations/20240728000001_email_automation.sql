-- Email Automation schema
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name TEXT NOT NULL DEFAULT 'Feenix Repair',
  sender_email TEXT NOT NULL DEFAULT 'noreply@feenixrepair.com',
  reply_to TEXT,
  company_logo TEXT,
  footer_content TEXT,
  primary_color TEXT DEFAULT '#f97316',
  secondary_color TEXT DEFAULT '#1e293b',
  provider TEXT NOT NULL DEFAULT 'resend',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient TEXT NOT NULL,
  template_key TEXT NOT NULL,
  subject TEXT NOT NULL,
  html TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  provider TEXT NOT NULL,
  provider_message_id TEXT,
  error_message TEXT,
  opened_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient TEXT NOT NULL,
  template_key TEXT NOT NULL,
  subject TEXT NOT NULL,
  html TEXT NOT NULL,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  scheduled_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_template ON public.email_logs(template_key);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON public.email_queue(scheduled_at);

-- RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY email_templates_admin ON public.email_templates
  FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY email_settings_admin ON public.email_settings
  FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY email_logs_admin ON public.email_logs
  FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY email_queue_admin ON public.email_queue
  FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'ADMIN');

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_email_templates_updated_at') THEN
    CREATE TRIGGER tr_email_templates_updated_at BEFORE UPDATE ON public.email_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_email_settings_updated_at') THEN
    CREATE TRIGGER tr_email_settings_updated_at BEFORE UPDATE ON public.email_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_email_logs_updated_at') THEN
    CREATE TRIGGER tr_email_logs_updated_at BEFORE UPDATE ON public.email_logs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Default settings
INSERT INTO public.email_settings (sender_name, sender_email, reply_to, provider, enabled)
VALUES ('Feenix Repair', 'noreply@feenixrepair.com', 'support@feenixrepair.com', 'resend', true)
ON CONFLICT DO NOTHING;
