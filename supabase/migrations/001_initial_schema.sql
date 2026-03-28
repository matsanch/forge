-- THE FORGE — Initial Database Schema
-- Run in Supabase SQL Editor

-- user_profile: domain levels, settings, truth
create table user_profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null unique,
  domains jsonb not null default '{"iron":0,"anvil":0,"vault":0,"guild":0,"library":0}',
  truth text default 'Click here to set your Uncomfortable Truth.',
  start_date date default current_date,
  budget_goals jsonb default '{"monthlyTarget":0,"savingsTarget":10}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  date date not null,
  gym boolean default false,
  boxing boolean default false,
  swimming boolean default false,
  rest boolean default false,
  overload boolean default false,
  sleep integer default 3,
  injury text default '',
  internship boolean default false,
  neurgait boolean default false,
  outreach_count integer default 0,
  gcp boolean default false,
  fin_literacy boolean default false,
  spent numeric(10,2) default 0,
  guild_outreach boolean default false,
  relationship boolean default false,
  new_contact text default '',
  deep_work numeric(4,1) default 0,
  paper text default '',
  avoided text default '',
  created_at timestamptz default now(),
  unique(user_id, date)
);

create table quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  domain text not null,
  description text default '',
  deadline date,
  difficulty text default 'normal',
  xp integer default 25,
  boss boolean default false,
  status text default 'active',
  created_at date default current_date,
  completed_at date,
  fail_count integer default 0
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  date date not null,
  amount numeric(10,2) not null,
  category text not null,
  note text default ''
);

create table income (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  date date not null,
  amount numeric(10,2) not null,
  source text not null,
  note text default ''
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  org text default '',
  type text default 'other',
  status text default 'identified',
  note text default '',
  date date default current_date
);

create table workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  date date not null,
  exercises jsonb default '[]',
  energy integer default 3,
  duration integer default 0,
  notes text default ''
);

create table swimming_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  date date not null,
  distance integer default 0,
  duration integer default 0,
  type text default 'freestyle',
  drills jsonb default '[]',
  notes text default ''
);

create table boxing_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  date date not null,
  type text default 'technique',
  rounds integer default 0,
  duration integer default 0,
  mistakes jsonb default '[]',
  work_on text default '',
  notes text default ''
);

create table anvil_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  date date not null,
  project text not null,
  description text default '',
  hours numeric(4,1) default 0,
  status text default 'done',
  blockers text default ''
);

create table outreach_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  date date not null,
  method text default 'email',
  target text not null,
  org text default '',
  status text default 'sent',
  followup date,
  notes text default ''
);

create table guild_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  date date not null,
  contact_name text default '',
  type text default 'email',
  notes text default '',
  followup date
);

create table deep_work_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  date date not null,
  hours numeric(4,1) default 0,
  topic text default '',
  category text default 'research',
  focus integer default 3,
  notes text default ''
);

create table papers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  date date not null,
  title text not null,
  type text default 'paper',
  relevance integer default 3,
  takeaways text default ''
);

create table courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  completed integer default 0,
  total integer default 0,
  notes text default '',
  last_updated date default current_date
);

create table weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  date date default current_date,
  stats jsonb default '{}',
  iron text default '',
  anvil text default '',
  vault text default '',
  guild text default '',
  library text default ''
);
