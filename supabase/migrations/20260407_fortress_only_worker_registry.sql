-- =============================================================================
-- Worker registry gated to Fortress subscribers only
-- =============================================================================

-- Drop existing open SELECT policies on workers/worker_entries
DROP POLICY IF EXISTS "Workers are viewable by authenticated users" ON workers;
DROP POLICY IF EXISTS "Workers are viewable by everyone" ON workers;
DROP POLICY IF EXISTS "Worker entries are viewable by authenticated users" ON worker_entries;
DROP POLICY IF EXISTS "Worker entries are viewable by everyone" ON worker_entries;

-- New SELECT: require fortress tier
CREATE POLICY "Workers viewable by fortress subscribers"
  ON workers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.subscription_tier = 'fortress'
    )
  );

CREATE POLICY "Worker entries viewable by fortress subscribers"
  ON worker_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.subscription_tier = 'fortress'
    )
  );
