-- THE FORGE — Row Level Security Policies
-- Run in Supabase SQL Editor after 001_initial_schema.sql

-- Enable RLS on all tables and create "Users manage own data" policy
do $$
declare tbl text;
begin
  for tbl in select unnest(array[
    'user_profile','daily_logs','quests','expenses','income','contacts',
    'workouts','swimming_sessions','boxing_sessions','anvil_tasks',
    'outreach_log','guild_interactions','deep_work_sessions','papers',
    'courses','weekly_reviews'
  ]) loop
    execute format('alter table %I enable row level security', tbl);
    execute format(
      'create policy "Users manage own data" on %I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      tbl
    );
  end loop;
end $$;
