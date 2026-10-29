-- cms_migrations records which of these files have run. scripts/db.mjs
-- creates it before applying them, so unlike every other CMS table it
-- never went through a migration that enables RLS (Supabase's Security
-- Advisor: "RLS Disabled in Public").
--
-- Only that migration runner touches it, over the server-side
-- DATABASE_URL connection, as the table's owner, which RLS does not
-- restrict. Nothing reads it through Supabase's Data API.
--
-- RLS with no policies, as for the other tables: the API's anon and
-- authenticated roles see no rows and can write none. Their table
-- privileges go too, so the API refuses the table outright, even if RLS
-- were ever switched off. (Guarded: those roles exist only on Supabase.)
-- Safe to run more than once.
alter table public.cms_migrations enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table public.cms_migrations from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table public.cms_migrations from authenticated;
  end if;
end $$;
