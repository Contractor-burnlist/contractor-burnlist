-- =============================================================================
-- Admin: content flags + user bans
-- =============================================================================

-- Ban column on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false;

-- Content flags table
CREATE TABLE content_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('entry', 'worker_entry', 'comment')),
  content_id uuid NOT NULL,
  reason text NOT NULL CHECK (reason IN ('false_information', 'harassment', 'spam', 'retaliation', 'inappropriate', 'other')),
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, content_type, content_id)
);

CREATE INDEX idx_flags_content ON content_flags(content_type, content_id);
CREATE INDEX idx_flags_status ON content_flags(status);

ALTER TABLE content_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own flags"
  ON content_flags FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own flags"
  ON content_flags FOR SELECT USING (auth.uid() = user_id);
