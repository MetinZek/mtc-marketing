-- Cover video pixel size, measured by the admin on upload, so the
-- Selected Work card can take the video's exact proportions ("original"
-- Cover format). Additive and nullable: NULL → the card falls back to 4:3.
alter table projects add column if not exists cover_video_width integer;
alter table projects add column if not exists cover_video_height integer;
