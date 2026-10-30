alter table public.user_preferences
  add column if not exists contact_email text,
  add column if not exists phone_number text;
