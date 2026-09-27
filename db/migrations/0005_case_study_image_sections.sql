-- Case-study sections become image-only: each section is ONE image with
-- an optional description (no titles, layouts or videos). Replaces the
-- two tables from 0004, which were never used for content. It refuses
-- to run if either of them holds rows, so nothing can be lost silently.
-- Existing tables (projects, media, uploads) are not touched.
do $$
begin
  if to_regclass('case_study_media') is not null
     and exists (select 1 from case_study_media) then
    raise exception 'case_study_media is not empty; move its rows before applying 0005';
  end if;
  if to_regclass('case_study_sections') is not null
     and exists (select 1 from case_study_sections) then
    raise exception 'case_study_sections is not empty; move its rows before applying 0005';
  end if;
end $$;

drop table if exists case_study_media;
drop table if exists case_study_sections;

create table case_study_sections (
  id            text primary key,
  project_id    text not null references projects (id) on delete cascade,
  image_src     text not null,
  image_alt     text,
  image_width   integer,  -- intrinsic size recorded at upload, so the
  image_height  integer,  -- page can reserve the right aspect ratio
  description   text,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index case_study_sections_project_idx
  on case_study_sections (project_id, sort_order);

-- Server-only, like every other CMS table.
alter table case_study_sections enable row level security;
