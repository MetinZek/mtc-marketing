-- Ordered detail-page media (images + videos) per project, as a JSON
-- array of {type, src, alt?, width?, height?}; array position = order.
-- Nullable with no default on purpose: NULL means "not curated yet", and
-- the site keeps rendering the existing `gallery` column for that
-- project. No existing column or row is modified.
--
-- (projects.video_url from 0002 is no longer used by the app — the
-- single "Project Video" became items in this list. It is left in place
-- rather than dropped; it holds no data.)
alter table projects add column if not exists media jsonb;
