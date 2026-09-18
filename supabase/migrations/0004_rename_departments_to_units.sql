-- ============================================================================
-- Rename departments -> units (the org structure is rank + unit/platoon,
-- not functional departments). Postgres carries over indexes, constraints,
-- RLS policies and the FK automatically on a table/column rename.
-- ============================================================================

alter table departments rename to units;
alter table members rename column department_id to unit_id;

-- Rename indexes for clarity (optional, purely cosmetic — skip if it errors
-- on your Postgres version's default index-naming, it's not load-bearing).
alter index if exists departments_pkey rename to units_pkey;

comment on table units is 'Units/platoons members belong to (paired with rank, not a functional department).';

-- The public_members view (migration 0002) has its output column name
-- frozen at creation time — a column rename on the underlying `members`
-- table does NOT propagate to it. Recreate it so PostgREST's relationship
-- embedding (`.select("units(name)")`) resolves against the new column.
-- CREATE OR REPLACE VIEW cannot rename/drop output columns, only append new
-- ones — so the view must be dropped and recreated, not replaced in place.
drop view if exists public_members;
create view public_members as
  select id, full_name, photo_url, rank_id, unit_id, short_bio
  from members
  where public_profile = true and status = 'active';

-- Supabase grants SELECT on new tables to anon/authenticated automatically
-- via default privileges, but a dropped-and-recreated view can lose that —
-- grant explicitly so the public /members page keeps working.
grant select on public_members to anon, authenticated;
