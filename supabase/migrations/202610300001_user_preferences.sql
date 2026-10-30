-- RADAR account preferences. Safe for the browser publishable key through RLS.
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  watchlist integer[] not null default '{0,1,2,3}',
  saved_disclosures integer[] not null default '{}',
  read_disclosures integer[] not null default '{}',
  notification_settings jsonb not null default '{}'::jsonb,
  checklist text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;
drop policy if exists "Users can read their own RADAR preferences" on public.user_preferences;
create policy "Users can read their own RADAR preferences" on public.user_preferences
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can create their own RADAR preferences" on public.user_preferences;
create policy "Users can create their own RADAR preferences" on public.user_preferences
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update their own RADAR preferences" on public.user_preferences;
create policy "Users can update their own RADAR preferences" on public.user_preferences
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
grant select, insert, update on public.user_preferences to authenticated;
