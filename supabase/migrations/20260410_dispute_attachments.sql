-- Add attachment_paths array column for dispute file uploads
ALTER TABLE content_flags ADD COLUMN IF NOT EXISTS attachment_paths text[];
