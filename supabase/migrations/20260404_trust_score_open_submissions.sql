-- =============================================================================
-- Trust Score System & Open Submissions
--
-- Changes:
-- 1. Replace INSERT policies: any authenticated user can submit (no is_verified gate)
-- 2. Add trust score columns to profiles
-- 3. Add submitter_verified column to entries and worker_entries
-- =============================================================================

-- ---------------------------------------------------------------------------
-- PART 1: Update INSERT policies — allow any authenticated user
-- ---------------------------------------------------------------------------

-- Drop old verified-only INSERT policies
DROP POLICY IF EXISTS "Verified users can insert customers" ON customers;
DROP POLICY IF EXISTS "Verified users can insert entries" ON entries;
DROP POLICY IF EXISTS "Verified users can insert workers" ON workers;
DROP POLICY IF EXISTS "Verified users can insert worker entries" ON worker_entries;

-- New INSERT policies: any authenticated user
CREATE POLICY "Authenticated users can insert customers"
  ON customers FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert entries"
  ON entries FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert workers"
  ON workers FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert worker entries"
  ON worker_entries FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ---------------------------------------------------------------------------
-- PART 2: Trust score columns on profiles
-- ---------------------------------------------------------------------------

-- Trust score logic (enforced in app code):
--   Sign up with Google OAuth         = 1 (base, this is the default)
--   Add business name + phone         = +1 (score becomes 2)
--   Link and verify GBP               = +2 (score becomes 4, sets is_verified = true)
--   Active subscription               = +1 (score becomes 5)
--   Score range: 1–5

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trust_score integer DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_business_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trade text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_at timestamptz;

-- business_name and is_verified already exist on profiles — no changes needed

-- ---------------------------------------------------------------------------
-- PART 3: Submitter verified flag on entries
-- ---------------------------------------------------------------------------

ALTER TABLE entries ADD COLUMN IF NOT EXISTS submitter_verified boolean DEFAULT false;
ALTER TABLE worker_entries ADD COLUMN IF NOT EXISTS submitter_verified boolean DEFAULT false;
