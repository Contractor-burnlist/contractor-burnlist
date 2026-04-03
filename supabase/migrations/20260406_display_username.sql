-- =============================================================================
-- Public display username for contractor anonymity in comments
-- =============================================================================

-- Add display_username column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_username text;

-- Format constraint: 3-20 chars, letters/numbers/underscores/hyphens only
ALTER TABLE profiles ADD CONSTRAINT display_username_format
  CHECK (display_username IS NULL OR display_username ~ '^[a-zA-Z0-9_-]{3,20}$');

-- Case-insensitive uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_display_username_lower
  ON profiles (LOWER(display_username));

-- Allow any authenticated user to read public profile fields for comments
-- (id, display_username, is_verified, reputation_points, reputation_rank)
-- The existing self-access policy covers the user's own row; this adds read
-- access to other users' public fields.
CREATE POLICY "Public profile fields readable by authenticated users"
  ON profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);
