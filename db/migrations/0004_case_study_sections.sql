-- Case-study sections for the /work/[slug] page: each project has any
-- number of ordered sections (optional title + text), and each section
-- any number of ordered images/videos. Purely additive — no existing
-- table, column or row is touched; the project media/cover fields stay
-- as they are. Deleting a project or section removes its children.
create table if not exists case_study_sections (
  id          text primary key,
  project_id  text not null references projects (id) on delete cascade,
  title       text,
  body        text,
  layout      text not null default 'auto'
              check (layout in ('auto', 'stack', 'columns-2', 'columns-3')),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists case_study_sections_project_idx
  on case_study_sections (project_id, sort_order);

create table if not exists case_study_media (
  id          uuid primary key default gen_random_uuid(),
  section_id  text not null references case_study_sections (id) on delete cascade,
  type        text not null check (type in ('image', 'video')),
  src         text not null,
  alt         text,
  width       integer,
  height      integer,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists case_study_media_section_idx
  on case_study_media (section_id, sort_order);

-- Server-only, like every other CMS table.
alter table case_study_sections enable row level security;
alter table case_study_media    enable row level security;
