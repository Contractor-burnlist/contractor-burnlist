-- Workers registry table
CREATE TABLE workers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  first_initial text,
  last_initial text,
  display_name text,
  phone text,
  city text,
  state text,
  trade_specialty text,
  flag_count integer default 0,
  risk_level text default 'unknown',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Worker entries / reports table
CREATE TABLE worker_entries (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid references workers on delete cascade,
  submitted_by uuid references profiles on delete cascade,
  category_tags text[],
  description text,
  incident_date date,
  is_verified_submission boolean default false,
  created_at timestamptz default now()
);

-- Auto-generate display_name from full_name initials
CREATE OR REPLACE FUNCTION generate_worker_display_name()
RETURNS trigger AS $$
DECLARE
  parts text[];
BEGIN
  parts := string_to_array(trim(NEW.full_name), ' ');
  NEW.first_initial := upper(left(parts[1], 1));
  NEW.last_initial := upper(left(parts[array_upper(parts, 1)], 1));
  NEW.display_name := NEW.first_initial || '.' || NEW.last_initial || '.';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER worker_display_name_trigger
  BEFORE INSERT OR UPDATE OF full_name ON workers
  FOR EACH ROW
  EXECUTE FUNCTION generate_worker_display_name();

-- Auto-update flag_count when entries change
CREATE OR REPLACE FUNCTION update_worker_flag_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE workers SET flag_count = (
      SELECT count(*) FROM worker_entries WHERE worker_id = OLD.worker_id
    ), updated_at = now() WHERE id = OLD.worker_id;
    RETURN OLD;
  ELSE
    UPDATE workers SET flag_count = (
      SELECT count(*) FROM worker_entries WHERE worker_id = NEW.worker_id
    ), updated_at = now() WHERE id = NEW.worker_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER worker_flag_count_trigger
  AFTER INSERT OR DELETE ON worker_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_worker_flag_count();

-- Enable RLS
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_entries ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Workers are viewable by everyone"
  ON workers FOR SELECT USING (true);

CREATE POLICY "Worker entries are viewable by everyone"
  ON worker_entries FOR SELECT USING (true);

-- Authenticated users can insert
CREATE POLICY "Authenticated users can insert workers"
  ON workers FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert worker entries"
  ON worker_entries FOR INSERT WITH CHECK (auth.uid() = submitted_by);

-- Indexes
CREATE INDEX idx_workers_full_name ON workers USING gin (full_name gin_trgm_ops);
CREATE INDEX idx_workers_city_state ON workers (city, state);
CREATE INDEX idx_worker_entries_worker_id ON worker_entries (worker_id);
CREATE INDEX idx_worker_entries_submitted_by ON worker_entries (submitted_by);
