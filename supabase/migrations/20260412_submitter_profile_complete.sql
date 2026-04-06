-- Add submitter_profile_complete flag to entries and worker_entries
ALTER TABLE entries ADD COLUMN IF NOT EXISTS submitter_profile_complete boolean DEFAULT false;
ALTER TABLE worker_entries ADD COLUMN IF NOT EXISTS submitter_profile_complete boolean DEFAULT false;
