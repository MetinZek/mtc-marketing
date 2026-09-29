-- Selected Work card proportion ("standard", "landscape", "widescreen",
-- "square", "portrait"). Additive and nullable: existing projects keep
-- NULL and render at the original 4:3 ("standard").
alter table projects add column if not exists cover_format text;
