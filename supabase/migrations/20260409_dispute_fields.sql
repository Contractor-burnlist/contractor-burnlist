-- =============================================================================
-- Add dispute support: allow non-authenticated disputes from reported parties
-- =============================================================================

-- Make user_id nullable so non-logged-in reported parties can submit disputes
ALTER TABLE content_flags ALTER COLUMN user_id DROP NOT NULL;

-- Add contact fields for non-authenticated disputants
ALTER TABLE content_flags ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE content_flags ADD COLUMN IF NOT EXISTS contact_name text;

-- Update the CHECK on content_type to include 'customer' and 'worker'
ALTER TABLE content_flags DROP CONSTRAINT IF EXISTS content_flags_content_type_check;
ALTER TABLE content_flags ADD CONSTRAINT content_flags_content_type_check
  CHECK (content_type IN ('entry', 'worker_entry', 'comment', 'customer', 'worker'));

-- Update the CHECK on reason to include 'identity_dispute'
ALTER TABLE content_flags DROP CONSTRAINT IF EXISTS content_flags_reason_check;
ALTER TABLE content_flags ADD CONSTRAINT content_flags_reason_check
  CHECK (reason IN ('false_information', 'harassment', 'spam', 'retaliation', 'inappropriate', 'identity_dispute', 'inaccurate', 'other'));

-- Drop old unique constraint that requires user_id (non-null)
ALTER TABLE content_flags DROP CONSTRAINT IF EXISTS content_flags_user_id_content_type_content_id_key;

-- Allow anonymous INSERT for disputes (no auth required)
DROP POLICY IF EXISTS "Users can insert own flags" ON content_flags;
CREATE POLICY "Anyone can insert flags"
  ON content_flags FOR INSERT WITH CHECK (true);
