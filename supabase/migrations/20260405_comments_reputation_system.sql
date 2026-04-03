-- =============================================================================
-- Comments & Reputation System
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Comments table
-- ---------------------------------------------------------------------------
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid REFERENCES entries(id) ON DELETE CASCADE,
  worker_entry_id uuid REFERENCES worker_entries(id) ON DELETE CASCADE,
  parent_comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) <= 2000),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_deleted boolean DEFAULT false,
  CONSTRAINT exactly_one_entry CHECK (
    (entry_id IS NOT NULL AND worker_entry_id IS NULL) OR
    (entry_id IS NULL AND worker_entry_id IS NOT NULL)
  )
);

CREATE INDEX idx_comments_entry_id ON comments(entry_id);
CREATE INDEX idx_comments_worker_entry_id ON comments(worker_entry_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);

-- ---------------------------------------------------------------------------
-- 2. Comment likes table
-- ---------------------------------------------------------------------------
CREATE TABLE comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (comment_id, user_id)
);

CREATE INDEX idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user ON comment_likes(user_id);

-- ---------------------------------------------------------------------------
-- 3. Profile columns for reputation
-- ---------------------------------------------------------------------------
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reputation_points integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reputation_rank text DEFAULT 'Rookie';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS comment_count integer DEFAULT 0;

-- ---------------------------------------------------------------------------
-- 4. RLS
-- ---------------------------------------------------------------------------
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- Comments: read for authenticated, insert/update/delete for author
CREATE POLICY "Comments readable by authenticated users"
  ON comments FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert own comments"
  ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Likes: read for authenticated, insert/delete for self
CREATE POLICY "Likes readable by authenticated users"
  ON comment_likes FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert own likes"
  ON comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON comment_likes FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 5. Triggers
-- ---------------------------------------------------------------------------

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_comment_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_updated_at_trigger
  BEFORE UPDATE ON comments FOR EACH ROW
  EXECUTE FUNCTION update_comment_updated_at();

-- Rank helper
CREATE OR REPLACE FUNCTION calculate_rank(pts integer)
RETURNS text AS $$
BEGIN
  IF pts >= 200 THEN RETURN 'Legend';
  ELSIF pts >= 100 THEN RETURN 'Expert';
  ELSIF pts >= 60 THEN RETURN 'Veteran';
  ELSIF pts >= 30 THEN RETURN 'Trusted Voice';
  ELSIF pts >= 10 THEN RETURN 'Contributor';
  ELSE RETURN 'Rookie';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- On comment INSERT: +2 rep, +1 comment_count
CREATE OR REPLACE FUNCTION on_comment_insert()
RETURNS trigger AS $$
BEGIN
  UPDATE profiles SET
    reputation_points = reputation_points + 2,
    comment_count = comment_count + 1,
    reputation_rank = calculate_rank(reputation_points + 2)
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_insert_rep
  AFTER INSERT ON comments FOR EACH ROW
  EXECUTE FUNCTION on_comment_insert();

-- On comment soft delete: -2 rep
CREATE OR REPLACE FUNCTION on_comment_soft_delete()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_deleted = true AND OLD.is_deleted = false THEN
    UPDATE profiles SET
      reputation_points = GREATEST(reputation_points - 2, 0),
      reputation_rank = calculate_rank(GREATEST(reputation_points - 2, 0))
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_soft_delete_rep
  AFTER UPDATE OF is_deleted ON comments FOR EACH ROW
  EXECUTE FUNCTION on_comment_soft_delete();

-- On like INSERT: +3 rep to comment author
CREATE OR REPLACE FUNCTION on_like_insert()
RETURNS trigger AS $$
DECLARE
  author_id uuid;
BEGIN
  SELECT user_id INTO author_id FROM comments WHERE id = NEW.comment_id;
  IF author_id IS NOT NULL AND author_id != NEW.user_id THEN
    UPDATE profiles SET
      reputation_points = reputation_points + 3,
      reputation_rank = calculate_rank(reputation_points + 3)
    WHERE id = author_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER like_insert_rep
  AFTER INSERT ON comment_likes FOR EACH ROW
  EXECUTE FUNCTION on_like_insert();

-- On like DELETE: -3 rep from comment author
CREATE OR REPLACE FUNCTION on_like_delete()
RETURNS trigger AS $$
DECLARE
  author_id uuid;
BEGIN
  SELECT user_id INTO author_id FROM comments WHERE id = OLD.comment_id;
  IF author_id IS NOT NULL AND author_id != OLD.user_id THEN
    UPDATE profiles SET
      reputation_points = GREATEST(reputation_points - 3, 0),
      reputation_rank = calculate_rank(GREATEST(reputation_points - 3, 0))
    WHERE id = author_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER like_delete_rep
  AFTER DELETE ON comment_likes FOR EACH ROW
  EXECUTE FUNCTION on_like_delete();
