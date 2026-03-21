-- BlightVeil Allowlist - Run this AFTER the initial schema
-- This adds user access control so only approved Discord users can use the app

-- Allowed users table
create table allowed_users (
  id uuid primary key default gen_random_uuid(),
  discord_id text not null unique,
  display_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table allowed_users enable row level security;

-- Helper function: check if current user is in the allowlist
create or replace function is_allowed_user()
returns boolean as $$
  select exists (
    select 1 from allowed_users
    where discord_id = (auth.jwt() -> 'user_metadata' ->> 'sub')
  );
$$ language sql security definer;

-- Helper function: check if current user is an admin
create or replace function is_admin_user()
returns boolean as $$
  select exists (
    select 1 from allowed_users
    where discord_id = (auth.jwt() -> 'user_metadata' ->> 'sub')
    and is_admin = true
  );
$$ language sql security definer;

-- allowed_users policies: only admins can manage, allowed users can view
create policy "Allowed users can view allowlist"
  on allowed_users for select to authenticated
  using (is_allowed_user());

create policy "Admins can insert allowed users"
  on allowed_users for insert to authenticated
  with check (is_admin_user());

create policy "Admins can update allowed users"
  on allowed_users for update to authenticated
  using (is_admin_user()) with check (is_admin_user());

create policy "Admins can delete allowed users"
  on allowed_users for delete to authenticated
  using (is_admin_user());

-- Update existing table policies to require allowlist membership
-- First drop the old open policies
drop policy "Authenticated users can view pilots" on pilots;
drop policy "Authenticated users can insert pilots" on pilots;
drop policy "Authenticated users can update pilots" on pilots;
drop policy "Authenticated users can delete pilots" on pilots;

drop policy "Authenticated users can view goals" on goals;
drop policy "Authenticated users can insert goals" on goals;
drop policy "Authenticated users can update goals" on goals;
drop policy "Authenticated users can delete goals" on goals;

drop policy "Authenticated users can view goal_notes" on goal_notes;
drop policy "Authenticated users can insert goal_notes" on goal_notes;
drop policy "Authenticated users can delete goal_notes" on goal_notes;

-- Recreate with allowlist check
create policy "Allowed users can view pilots"
  on pilots for select to authenticated using (is_allowed_user());
create policy "Allowed users can insert pilots"
  on pilots for insert to authenticated with check (is_allowed_user());
create policy "Allowed users can update pilots"
  on pilots for update to authenticated using (is_allowed_user()) with check (is_allowed_user());
create policy "Allowed users can delete pilots"
  on pilots for delete to authenticated using (is_allowed_user());

create policy "Allowed users can view goals"
  on goals for select to authenticated using (is_allowed_user());
create policy "Allowed users can insert goals"
  on goals for insert to authenticated with check (is_allowed_user());
create policy "Allowed users can update goals"
  on goals for update to authenticated using (is_allowed_user()) with check (is_allowed_user());
create policy "Allowed users can delete goals"
  on goals for delete to authenticated using (is_allowed_user());

create policy "Allowed users can view goal_notes"
  on goal_notes for select to authenticated using (is_allowed_user());
create policy "Allowed users can insert goal_notes"
  on goal_notes for insert to authenticated with check (is_allowed_user());
create policy "Allowed users can delete goal_notes"
  on goal_notes for delete to authenticated using (is_allowed_user());

-- Insert you as the first admin
insert into allowed_users (discord_id, display_name, is_admin)
values ('1016433684326387803', 'Craig', true);
