-- The service (by id) a project belongs to: drives the /work service
-- filters and which Work gallery pieces sit next to it. Additive and
-- nullable: NULL → matched by category title, else shown under "All" only.
alter table projects add column if not exists service_id text;
