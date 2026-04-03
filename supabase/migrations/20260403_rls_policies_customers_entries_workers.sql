-- =============================================================================
-- RLS Policies for: customers, entries, workers, worker_entries
--
-- Replaces any existing policies on these tables with proper access controls:
--   - SELECT on customers/entries: active subscribers only
--   - SELECT on workers/worker_entries: any authenticated user
--   - INSERT on all 4 tables: verified contractors only (is_verified = true)
--   - Service role (webhooks) bypasses RLS automatically
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Enable RLS (idempotent — safe to run even if already enabled)
-- ---------------------------------------------------------------------------
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_entries ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 2. Drop existing policies (idempotent — IF EXISTS prevents errors)
-- ---------------------------------------------------------------------------

-- customers
DROP POLICY IF EXISTS "Customers are viewable by active subscribers" ON customers;
DROP POLICY IF EXISTS "Verified users can insert customers" ON customers;

-- entries
DROP POLICY IF EXISTS "Entries are viewable by active subscribers" ON entries;
DROP POLICY IF EXISTS "Verified users can insert entries" ON entries;

-- workers (policies from initial migration)
DROP POLICY IF EXISTS "Workers are viewable by everyone" ON workers;
DROP POLICY IF EXISTS "Authenticated users can insert workers" ON workers;
DROP POLICY IF EXISTS "Workers are viewable by authenticated users" ON workers;
DROP POLICY IF EXISTS "Verified users can insert workers" ON workers;

-- worker_entries (policies from initial migration)
DROP POLICY IF EXISTS "Worker entries are viewable by everyone" ON worker_entries;
DROP POLICY IF EXISTS "Authenticated users can insert worker entries" ON worker_entries;
DROP POLICY IF EXISTS "Worker entries are viewable by authenticated users" ON worker_entries;
DROP POLICY IF EXISTS "Verified users can insert worker entries" ON worker_entries;

-- ---------------------------------------------------------------------------
-- 3. Create new policies
-- ---------------------------------------------------------------------------

-- ── customers ──

-- Only paid subscribers can view customer records
CREATE POLICY "Customers are viewable by active subscribers"
  ON customers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.subscription_status = 'active'
    )
  );

-- Only verified contractors can submit customer records
CREATE POLICY "Verified users can insert customers"
  ON customers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_verified = true
    )
  );

-- ── entries ──

-- Only paid subscribers can view reports about customers
CREATE POLICY "Entries are viewable by active subscribers"
  ON entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.subscription_status = 'active'
    )
  );

-- Only verified contractors can submit reports about customers
CREATE POLICY "Verified users can insert entries"
  ON entries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_verified = true
    )
  );

-- ── workers ──

-- Any authenticated user can view worker records (no subscription required)
CREATE POLICY "Workers are viewable by authenticated users"
  ON workers FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only verified contractors can submit worker records
CREATE POLICY "Verified users can insert workers"
  ON workers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_verified = true
    )
  );

-- ── worker_entries ──

-- Any authenticated user can view reports about workers (no subscription required)
CREATE POLICY "Worker entries are viewable by authenticated users"
  ON worker_entries FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only verified contractors can submit reports about workers
CREATE POLICY "Verified users can insert worker entries"
  ON worker_entries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_verified = true
    )
  );
