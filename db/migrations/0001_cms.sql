-- MTC CMS — initial schema (Postgres / Supabase).
-- Applied by `npm run db:migrate`, or paste into the Supabase SQL editor.
-- Idempotent: safe to run more than once.

-- Projects (Selected Work + /work). One column per CMS field.
create table if not exists projects (
  id                text primary key,
  slug              text not null,
  title             text not null,
  client            text not null,
  category          text not null,
  year              integer not null,
  description       text not null,
  content           text not null default '',
  services          jsonb not null default '[]'::jsonb,
  thumbnail         jsonb,
  hero_image        jsonb not null,
  gallery           jsonb not null default '[]'::jsonb,
  results           jsonb not null default '[]'::jsonb,
  testimonial_id    text,
  featured          boolean not null default false, -- shown in Selected Work
  published         boolean not null default true,
  display_order     integer not null default 0,
  desktop_video_url text,
  mobile_video_url  text,
  poster_url        text,
  case_study_url    text,
  seo_title         text,
  meta_description  text,
  og_image          text,
  noindex           boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists projects_selected_work_idx
  on projects (featured, published, display_order);
create index if not exists projects_slug_idx on projects (slug);

-- Contact form submissions (admin-only, never public).
create table if not exists contact_submissions (
  id           text primary key,
  name         text not null,
  email        text not null,
  company      text not null default '',
  phone        text not null default '',
  service      text not null default '',
  message      text not null,
  status       text not null default 'New'
               check (status in ('New', 'Contacted', 'In Progress', 'Completed')),
  submitted_at timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Every other CMS collection (services, team, posts, testimonials,
-- clients) as validated JSON documents — the app's zod schemas are the
-- contract for their shape.
create table if not exists cms_entries (
  collection text not null,
  id         text not null,
  data       jsonb not null,
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (collection, id)
);

-- Which collections have been written to the database. Until a
-- collection is listed here the app serves its built-in seed content
-- (the same "seed until first save" behaviour the JSON store had).
create table if not exists cms_collections (
  name           text primary key,
  initialized_at timestamptz not null default now()
);

-- Admin-uploaded images, served by /api/media/[name].
create table if not exists cms_media (
  name         text primary key,
  content_type text not null,
  size         integer not null,
  data         bytea not null,
  created_at   timestamptz not null default now()
);

-- Only the server (direct Postgres connection) touches these tables.
-- Enabling RLS with no policies blocks Supabase's public REST/anon API.
alter table projects            enable row level security;
alter table contact_submissions enable row level security;
alter table cms_entries         enable row level security;
alter table cms_collections     enable row level security;
alter table cms_media           enable row level security;
