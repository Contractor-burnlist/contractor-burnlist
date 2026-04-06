-- =============================================================================
-- Forum System: categories, posts, replies, upvotes
-- =============================================================================

-- Categories
CREATE TABLE forum_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  emoji text,
  display_order integer DEFAULT 0,
  is_locked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Posts
CREATE TABLE forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES forum_categories(id),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 5 AND 200),
  content text NOT NULL CHECK (char_length(content) BETWEEN 10 AND 10000),
  is_pinned boolean DEFAULT false,
  is_locked boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  upvote_count integer DEFAULT 0,
  reply_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_forum_posts_category ON forum_posts(category_id);
CREATE INDEX idx_forum_posts_user ON forum_posts(user_id);
CREATE INDEX idx_forum_posts_created ON forum_posts(created_at DESC);
CREATE INDEX idx_forum_posts_upvotes ON forum_posts(upvote_count DESC);

-- Replies
CREATE TABLE forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_reply_id uuid REFERENCES forum_replies(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 5000),
  is_deleted boolean DEFAULT false,
  upvote_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_forum_replies_post ON forum_replies(post_id);
CREATE INDEX idx_forum_replies_user ON forum_replies(user_id);
CREATE INDEX idx_forum_replies_created ON forum_replies(created_at);

-- Upvotes
CREATE TABLE forum_upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES forum_posts(id) ON DELETE CASCADE,
  reply_id uuid REFERENCES forum_replies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT exactly_one_target CHECK (
    (post_id IS NOT NULL AND reply_id IS NULL) OR
    (post_id IS NULL AND reply_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX idx_forum_upvotes_post ON forum_upvotes(user_id, post_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX idx_forum_upvotes_reply ON forum_upvotes(user_id, reply_id) WHERE reply_id IS NOT NULL;
CREATE INDEX idx_forum_upvotes_user ON forum_upvotes(user_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_upvotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories public read" ON forum_categories FOR SELECT USING (true);
CREATE POLICY "Posts public read" ON forum_posts FOR SELECT USING (true);
CREATE POLICY "Posts auth insert" ON forum_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Posts author update" ON forum_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Replies public read" ON forum_replies FOR SELECT USING (true);
CREATE POLICY "Replies auth insert" ON forum_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Replies author update" ON forum_replies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Upvotes auth read" ON forum_upvotes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Upvotes auth insert" ON forum_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Upvotes own delete" ON forum_upvotes FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

-- Auto update updated_at
CREATE OR REPLACE FUNCTION forum_update_timestamp() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER forum_posts_updated BEFORE UPDATE ON forum_posts FOR EACH ROW EXECUTE FUNCTION forum_update_timestamp();
CREATE TRIGGER forum_replies_updated BEFORE UPDATE ON forum_replies FOR EACH ROW EXECUTE FUNCTION forum_update_timestamp();

-- Reply count
CREATE OR REPLACE FUNCTION forum_reply_count_inc() RETURNS trigger AS $$
BEGIN UPDATE forum_posts SET reply_count = reply_count + 1 WHERE id = NEW.post_id; RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER forum_reply_inc AFTER INSERT ON forum_replies FOR EACH ROW EXECUTE FUNCTION forum_reply_count_inc();

CREATE OR REPLACE FUNCTION forum_reply_soft_delete() RETURNS trigger AS $$
BEGIN
  IF NEW.is_deleted = true AND OLD.is_deleted = false THEN
    UPDATE forum_posts SET reply_count = GREATEST(reply_count - 1, 0) WHERE id = NEW.post_id;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER forum_reply_del AFTER UPDATE OF is_deleted ON forum_replies FOR EACH ROW EXECUTE FUNCTION forum_reply_soft_delete();

-- Upvote triggers — posts
CREATE OR REPLACE FUNCTION forum_post_upvote_inc() RETURNS trigger AS $$
DECLARE author_id uuid;
BEGIN
  IF NEW.post_id IS NOT NULL THEN
    UPDATE forum_posts SET upvote_count = upvote_count + 1 WHERE id = NEW.post_id;
    SELECT user_id INTO author_id FROM forum_posts WHERE id = NEW.post_id;
    IF author_id IS NOT NULL AND author_id != NEW.user_id THEN
      UPDATE profiles SET reputation_points = reputation_points + 2, reputation_rank = calculate_rank(reputation_points + 2) WHERE id = author_id;
    END IF;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER forum_upvote_post_inc AFTER INSERT ON forum_upvotes FOR EACH ROW EXECUTE FUNCTION forum_post_upvote_inc();

CREATE OR REPLACE FUNCTION forum_post_upvote_dec() RETURNS trigger AS $$
DECLARE author_id uuid;
BEGIN
  IF OLD.post_id IS NOT NULL THEN
    UPDATE forum_posts SET upvote_count = GREATEST(upvote_count - 1, 0) WHERE id = OLD.post_id;
    SELECT user_id INTO author_id FROM forum_posts WHERE id = OLD.post_id;
    IF author_id IS NOT NULL AND author_id != OLD.user_id THEN
      UPDATE profiles SET reputation_points = GREATEST(reputation_points - 2, 0), reputation_rank = calculate_rank(GREATEST(reputation_points - 2, 0)) WHERE id = author_id;
    END IF;
  END IF;
  RETURN OLD;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER forum_upvote_post_dec AFTER DELETE ON forum_upvotes FOR EACH ROW EXECUTE FUNCTION forum_post_upvote_dec();

-- Upvote triggers — replies
CREATE OR REPLACE FUNCTION forum_reply_upvote_inc() RETURNS trigger AS $$
DECLARE author_id uuid;
BEGIN
  IF NEW.reply_id IS NOT NULL THEN
    UPDATE forum_replies SET upvote_count = upvote_count + 1 WHERE id = NEW.reply_id;
    SELECT user_id INTO author_id FROM forum_replies WHERE id = NEW.reply_id;
    IF author_id IS NOT NULL AND author_id != NEW.user_id THEN
      UPDATE profiles SET reputation_points = reputation_points + 1, reputation_rank = calculate_rank(reputation_points + 1) WHERE id = author_id;
    END IF;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER forum_upvote_reply_inc AFTER INSERT ON forum_upvotes FOR EACH ROW EXECUTE FUNCTION forum_reply_upvote_inc();

CREATE OR REPLACE FUNCTION forum_reply_upvote_dec() RETURNS trigger AS $$
DECLARE author_id uuid;
BEGIN
  IF OLD.reply_id IS NOT NULL THEN
    UPDATE forum_replies SET upvote_count = GREATEST(upvote_count - 1, 0) WHERE id = OLD.reply_id;
    SELECT user_id INTO author_id FROM forum_replies WHERE id = OLD.reply_id;
    IF author_id IS NOT NULL AND author_id != OLD.user_id THEN
      UPDATE profiles SET reputation_points = GREATEST(reputation_points - 1, 0), reputation_rank = calculate_rank(GREATEST(reputation_points - 1, 0)) WHERE id = author_id;
    END IF;
  END IF;
  RETURN OLD;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER forum_upvote_reply_dec AFTER DELETE ON forum_upvotes FOR EACH ROW EXECUTE FUNCTION forum_reply_upvote_dec();

-- Post creation rep
CREATE OR REPLACE FUNCTION forum_post_create_rep() RETURNS trigger AS $$
BEGIN
  UPDATE profiles SET reputation_points = reputation_points + 3, reputation_rank = calculate_rank(reputation_points + 3) WHERE id = NEW.user_id;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER forum_post_rep AFTER INSERT ON forum_posts FOR EACH ROW EXECUTE FUNCTION forum_post_create_rep();

-- Post soft delete rep
CREATE OR REPLACE FUNCTION forum_post_delete_rep() RETURNS trigger AS $$
BEGIN
  IF NEW.is_deleted = true AND OLD.is_deleted = false THEN
    UPDATE profiles SET reputation_points = GREATEST(reputation_points - 3, 0), reputation_rank = calculate_rank(GREATEST(reputation_points - 3, 0)) WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER forum_post_del_rep AFTER UPDATE OF is_deleted ON forum_posts FOR EACH ROW EXECUTE FUNCTION forum_post_delete_rep();

-- ---------------------------------------------------------------------------
-- Seed categories
-- ---------------------------------------------------------------------------
INSERT INTO forum_categories (name, slug, emoji, description, display_order) VALUES
  ('Vent Zone', 'vent-zone', '🔥', 'Get it off your chest. Nightmare customers, impossible jobs, no judgment.', 1),
  ('Business Advice', 'business-advice', '💼', 'Pricing, contracts, growth strategies — real talk from contractors who''ve been there.', 2),
  ('Trade Talk', 'trade-talk', '🔧', 'Technical questions, tips, tricks, and tools of the trade.', 3),
  ('Wins & Milestones', 'wins', '🏆', 'Brag about it. You earned it. Big contracts, milestones, and success stories.', 4),
  ('Hiring & Crew', 'hiring-crew', '👷', 'Finding reliable workers, managing crews, and building great teams.', 5),
  ('Legal & Contracts', 'legal-contracts', '⚖️', 'Lien rights, contract language, insurance — protect yourself. Not legal advice.', 6),
  ('Off Topic', 'off-topic', '🎯', 'Trucks, tools, BBQ, weekend projects — the water cooler.', 7);
