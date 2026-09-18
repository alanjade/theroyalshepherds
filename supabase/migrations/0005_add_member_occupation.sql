-- ============================================================================
-- Add `occupation` to members. Unlike phone/email/address/etc., this is a
-- public-safe field — it's included in the public_members view alongside
-- full_name, photo_url, rank_id, unit_id and short_bio.
-- ============================================================================

alter table members add column occupation text;
comment on column members.occupation is 'Member''s occupation — public-safe, shown on the /members page.';

-- Recreate the view (CREATE OR REPLACE VIEW can append columns in place,
-- since we're only adding a new output column, not renaming/dropping one).
create or replace view public_members as
  select id, full_name, photo_url, rank_id, unit_id, short_bio, occupation
  from members
  where public_profile = true and status = 'active';

grant select on public_members to anon, authenticated;
