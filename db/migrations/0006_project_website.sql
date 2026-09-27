-- Optional client website / social link shown in the project page header.
-- Additive and nullable: existing projects keep NULL and show no link.
alter table projects add column if not exists website_url text;
