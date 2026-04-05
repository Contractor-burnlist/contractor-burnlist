-- Risk score system: 0.0–10.0 calculated scores
ALTER TABLE customers ADD COLUMN IF NOT EXISTS risk_score numeric(3,1) DEFAULT 0.0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS risk_factors text[];
ALTER TABLE customers ADD COLUMN IF NOT EXISTS risk_calculated_at timestamptz;

ALTER TABLE workers ADD COLUMN IF NOT EXISTS risk_score numeric(3,1) DEFAULT 0.0;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS risk_factors text[];
ALTER TABLE workers ADD COLUMN IF NOT EXISTS risk_calculated_at timestamptz;
