-- Personal, manual asset ledger. Existing user_preferences RLS policies keep each row private.
alter table public.user_preferences
  add column if not exists asset_ledger jsonb not null
  default '{"accounts": [], "entries": []}'::jsonb;

comment on column public.user_preferences.asset_ledger is
  'User-entered personal asset balances and deposit/withdrawal history. Not linked to bank transfers.';
