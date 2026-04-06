ALTER TABLE profiles ADD COLUMN IF NOT EXISTS welcome_email_sent boolean DEFAULT false;
