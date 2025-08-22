-- seed.sql
-- Database schema and seed data for subscription cancellation flow
-- Includes all columns from the migration file

BEGIN;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table FIRST
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscriptions table with all columns from migration
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  monthly_price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_cancellation', 'cancelled')),
  cancel_requested_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cancellations table with all columns from migration
CREATE TABLE IF NOT EXISTS cancellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  downsell_variant TEXT NOT NULL CHECK (downsell_variant IN ('A', 'B')),
  reason TEXT,
  accepted_downsell BOOLEAN,
  -- Answers from the flow:
  found_with_mm BOOLEAN,
  applied_range TEXT CHECK (applied_range IN ('0','1-5','6-20','20+')),
  emailed_range TEXT CHECK (emailed_range IN ('0','1-5','6-20','20+')),
  interviewed_range TEXT CHECK (interviewed_range IN ('0','1-2','3-5','5+')),
  has_company_lawyer BOOLEAN,
  visa_name TEXT CHECK (char_length(visa_name) <= 120),
  cancel_reason TEXT,
  other_reason_text TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create helpful indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_cancellations_subscription ON cancellations(subscription_id);
CREATE INDEX IF NOT EXISTS idx_cancellations_user ON cancellations(user_id);

-- Add lifecycle constraint for subscription status consistency
ALTER TABLE subscriptions
  DROP CONSTRAINT IF EXISTS subs_cancel_fields_consistency;

ALTER TABLE subscriptions
  ADD CONSTRAINT subs_cancel_fields_consistency CHECK (
    CASE status
      WHEN 'active'               THEN cancelled_at IS NULL
      WHEN 'pending_cancellation' THEN cancel_requested_at IS NOT NULL AND cancelled_at IS NULL
      WHEN 'cancelled'            THEN cancel_requested_at IS NOT NULL AND cancelled_at IS NOT NULL
      ELSE FALSE
    END
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS '
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
' LANGUAGE plpgsql;

-- Create trigger for updating updated_at on subscriptions
CREATE TRIGGER subscriptions_set_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cancellations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cancellations" ON cancellations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own cancellations" ON cancellations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own cancellations" ON cancellations
  FOR UPDATE USING (auth.uid() = user_id);

-- Helper function: compute $10 off for variant B (price in cents)
CREATE OR REPLACE FUNCTION downsell_price(p_monthly_price integer, p_variant text)
RETURNS integer
LANGUAGE sql
AS '
  SELECT CASE
           WHEN p_variant = ''B'' THEN GREATEST(0, p_monthly_price - 1000)  -- cents
           ELSE p_monthly_price
         END;
';

-- RPC #1: Start cancellation flow
CREATE OR REPLACE FUNCTION start_cancellation_flow(
  p_subscription_id uuid,
  p_user_id         uuid
)
RETURNS TABLE (cancellation_id uuid, variant text, monthly_price integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS '
DECLARE
  v_sub   subscriptions%rowtype;
  v_row   cancellations%rowtype;
  v_var   text;
BEGIN
  -- Lock & validate ownership
  SELECT * INTO v_sub
  FROM subscriptions
  WHERE id = p_subscription_id
  FOR UPDATE;
  IF NOT FOUND OR v_sub.user_id <> p_user_id THEN
    RAISE EXCEPTION ''Subscription not found or forbidden'';
  END IF;

  -- Reuse the latest cancellation for this subscription if it exists
  SELECT * INTO v_row
  FROM cancellations
  WHERE subscription_id = p_subscription_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    cancellation_id := v_row.id;
    variant         := v_row.downsell_variant;
    monthly_price   := v_sub.monthly_price;
  ELSE
    -- Secure RNG 50/50 (gen_random_bytes requires pgcrypto)
    v_var := CASE WHEN (get_byte(gen_random_bytes(1),0) & 1) = 0 THEN ''A'' ELSE ''B'' END;

    INSERT INTO cancellations (user_id, subscription_id, downsell_variant)
    VALUES (p_user_id, p_subscription_id, v_var)
    RETURNING id INTO cancellation_id;

    variant       := v_var;
    monthly_price := v_sub.monthly_price;
  END IF;

  -- Flip subscription into pending_cancellation (idempotent)
  IF v_sub.status <> ''pending_cancellation'' THEN
    UPDATE subscriptions
    SET status = ''pending_cancellation'',
        cancel_requested_at = COALESCE(cancel_requested_at, NOW())
    WHERE id = p_subscription_id;
  END IF;

  RETURN;
END;
';

-- RPC #2: Complete cancellation flow
CREATE OR REPLACE FUNCTION complete_cancellation_flow(
  p_cancellation_id     uuid,
  p_user_id             uuid,
  p_reason              text,
  p_accepted_downsell   boolean,
  p_found_with_mm       boolean,
  p_applied_range       text,
  p_emailed_range       text,
  p_interviewed_range   text,
  p_has_company_lawyer  boolean,
  p_visa_name           text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_can cancellations%rowtype;
BEGIN
  SELECT * INTO v_can
  FROM cancellations
  WHERE id = p_cancellation_id;

  IF NOT FOUND OR v_can.user_id <> p_user_id THEN
    RAISE EXCEPTION 'Cancellation not found or forbidden';
  END IF;

  UPDATE cancellations
  SET reason             = LEFT(COALESCE(p_reason, ''), 2000),
      accepted_downsell  = p_accepted_downsell,
      found_with_mm      = p_found_with_mm,
      applied_range      = p_applied_range,
      emailed_range      = p_emailed_range,
      interviewed_range  = p_interviewed_range,
      has_company_lawyer = p_has_company_lawyer,
      visa_name          = NULLIF(BTRIM(p_visa_name), '')
  WHERE id = p_cancellation_id;

  -- Keep subscription in 'pending_cancellation' here; no payment ops in mock
END;
$$;

-- Seed data (using DO blocks to avoid parse-time dependency issues)
DO $seed$
BEGIN
    -- Insert users if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        INSERT INTO users (id, email) VALUES
          ('550e8400-e29b-41d4-a716-446655440001', 'user1@example.com'),
          ('550e8400-e29b-41d4-a716-446655440002', 'user2@example.com'),
          ('550e8400-e29b-41d4-a716-446655440003', 'user3@example.com')
        ON CONFLICT (email) DO NOTHING;
    END IF;
END $seed$;

-- Seed subscriptions with $25 and $29 plans
DO $seed_sub$
BEGIN
    -- Insert subscriptions if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions') THEN
        INSERT INTO subscriptions (user_id, monthly_price, status) VALUES
          ('550e8400-e29b-41d4-a716-446655440001', 2500, 'active'), -- $25.00
          ('550e8400-e29b-41d4-a716-446655440002', 2900, 'active'), -- $29.00
          ('550e8400-e29b-41d4-a716-446655440003', 2500, 'active')  -- $25.00
        ON CONFLICT DO NOTHING;
    END IF;
END $seed_sub$;

COMMIT;