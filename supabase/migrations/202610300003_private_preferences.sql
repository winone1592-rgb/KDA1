-- Ensure contact and preference rows are readable only by their signed-in owner.
alter table public.user_preferences enable row level security;

revoke all on table public.user_preferences from public, anon;
grant select, insert, update on table public.user_preferences to authenticated;

drop policy if exists "Users can read their own RADAR preferences" on public.user_preferences;
create policy "Users can read their own RADAR preferences"
  on public.user_preferences for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own RADAR preferences" on public.user_preferences;
create policy "Users can create their own RADAR preferences"
  on public.user_preferences for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own RADAR preferences" on public.user_preferences;
create policy "Users can update their own RADAR preferences"
  on public.user_preferences for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
