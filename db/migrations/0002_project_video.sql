-- Optional uploaded project video (Supabase Storage public URL), shown
-- on the /work/[slug] case-study page. Nullable: existing projects have
-- no video and keep rendering exactly as before.
alter table projects add column if not exists video_url text;
