-- ============================================================
-- Contractor Burnlist — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- PROFILES
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,
  business_name text,
  business_initials text,
  trade_category text,
  city text,
  state text,
  phone text,
  google_business_profile_id text,
  google_business_verified boolean default false,
  subscription_tier text default 'none',
  subscription_status text default 'inactive',
  stripe_customer_id text,
  is_verified boolean default false,
  created_at timestamp with time zone default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- CUSTOMERS
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  first_initial text,
  last_initial text,
  display_name text,
  address text,
  city text,
  state text,
  zip text,
  phone text,
  email text,
  flag_count integer default 0,
  risk_level text default 'unknown',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table customers enable row level security;

create policy "Subscribed users can view customers"
  on customers for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.subscription_status = 'active'
    )
  );

create policy "Verified users can insert customers"
  on customers for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_verified = true
    )
  );

-- ENTRIES
create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers on delete cascade,
  submitted_by uuid references profiles on delete set null,
  category_tags text[],
  description text,
  amount_owed decimal,
  incident_date date,
  is_verified_submission boolean default false,
  created_at timestamp with time zone default now()
);

alter table entries enable row level security;

create policy "Subscribed users can view entries"
  on entries for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.subscription_status = 'active'
    )
  );

create policy "Verified users can insert own entries"
  on entries for insert
  with check (
    auth.uid() = submitted_by
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_verified = true
    )
  );

-- SUBSCRIPTIONS
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade,
  stripe_subscription_id text,
  stripe_price_id text,
  tier text,
  status text,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table subscriptions enable row level security;

create policy "Users can view own subscription"
  on subscriptions for select using (auth.uid() = user_id);

-- Auto-update updated_at on customers
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_customers_updated_at
  before update on customers
  for each row execute function update_updated_at_column();
