-- BlightVeil Pilot Roster - Supabase Schema
-- Run this in your Supabase SQL Editor

create table pilots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  team_fighting int not null default 0 check (team_fighting >= 0 and team_fighting <= 5),
  duelling int not null default 0 check (duelling >= 0 and duelling <= 5),
  leadership int not null default 0 check (leadership >= 0 and leadership <= 5),
  created_at timestamptz not null default now(),
  updated_by text
);

create table goals (
  id uuid primary key default gen_random_uuid(),
  pilot_id uuid not null references pilots(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table goal_notes (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references goals(id) on delete cascade,
  content text not null,
  author text,
  created_at timestamptz not null default now()
);

alter table pilots enable row level security;
alter table goals enable row level security;
alter table goal_notes enable row level security;

create policy "Authenticated users can view pilots" on pilots for select to authenticated using (true);
create policy "Authenticated users can insert pilots" on pilots for insert to authenticated with check (true);
create policy "Authenticated users can update pilots" on pilots for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete pilots" on pilots for delete to authenticated using (true);
create policy "Authenticated users can view goals" on goals for select to authenticated using (true);
create policy "Authenticated users can insert goals" on goals for insert to authenticated with check (true);
create policy "Authenticated users can update goals" on goals for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete goals" on goals for delete to authenticated using (true);
create policy "Authenticated users can view goal_notes" on goal_notes for select to authenticated using (true);
create policy "Authenticated users can insert goal_notes" on goal_notes for insert to authenticated with check (true);
create policy "Authenticated users can delete goal_notes" on goal_notes for delete to authenticated using (true);
