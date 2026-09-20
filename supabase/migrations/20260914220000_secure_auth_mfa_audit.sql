-- ====================================================================
-- CAREERSETU AI — PRODUCTION SECURE SQL AUTHENTICATION SCHEMA
-- Includes: users, admin_accounts, mfa_codes, password_reset_tokens, sessions, audit_logs
-- ====================================================================

-- 1. Create Enums if not existing
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('STUDENT', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create or Update USERS table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT, -- Stored as pbkdf2:sha256:100000:<salt>:<hash>, NEVER plaintext
  phone TEXT,
  age INTEGER,
  gender TEXT,
  state TEXT,
  city TEXT,
  education TEXT,
  preferred_language TEXT DEFAULT 'english',
  role TEXT NOT NULL DEFAULT 'STUDENT',
  is_active BOOLEAN NOT NULL DEFAULT true,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  is_first_login BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ
);

-- Email index & uniqueness constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON public.users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users (is_active);

-- 3. Create ADMIN_ACCOUNTS table
CREATE TABLE IF NOT EXISTS public.admin_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  security_email TEXT NOT NULL,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_accounts_user_id ON public.admin_accounts (user_id);
CREATE INDEX IF NOT EXISTS idx_admin_accounts_sec_email ON public.admin_accounts (LOWER(security_email));

-- 4. Create MFA_CODES table
CREATE TABLE IF NOT EXISTS public.mfa_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL, -- SHA-256 hash of the 6-digit OTP
  purpose TEXT NOT NULL DEFAULT 'LOGIN', -- 'LOGIN', 'EMAIL_VERIFICATION', 'ADMIN_LOGIN', 'PASSWORD_RESET', 'FIRST_SETUP'
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mfa_codes_user_purpose ON public.mfa_codes (user_id, purpose);
CREATE INDEX IF NOT EXISTS idx_mfa_codes_expires_at ON public.mfa_codes (expires_at);

-- 5. Create PASSWORD_RESET_TOKENS table
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL, -- SHA-256 hash of random reset token/code
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_user_id ON public.password_reset_tokens (user_id);

-- 6. Create SESSIONS table
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_token_hash TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON public.sessions (session_token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON public.sessions (expires_at) WHERE revoked_at IS NULL;

-- 7. Create AUDIT_LOGS table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

-- 8. Seed Default Production Administrator (tysonfire13@gmail.com)
-- Initial state: is_first_login = true (requires first-time password setup, no permanent hardcoded password)
INSERT INTO public.users (
  id, name, email, role, is_active, email_verified, is_first_login, created_at, updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Primary Administrator',
  'tysonfire13@gmail.com',
  'ADMIN',
  true,
  true,
  true,
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;

INSERT INTO public.admin_accounts (
  user_id, security_email, two_factor_enabled, created_at, updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'tysonfire13@gmail.com',
  true,
  now(),
  now()
) ON CONFLICT DO NOTHING;
