-- ============================================================================
-- Manual ordering for members on the public Members page.
-- Public order = rank order, then unit order, then members.display_order, then name.
-- ============================================================================

alter table members add column if not exists display_order integer not null default 0;

-- Start from the current (imported list) order so nothing changes visually.
update members m
set display_order = s.rn
from (
  select id, row_number() over (order by membership_number) as rn from members
) s
where m.id = s.id and m.display_order = 0;

create or replace view public_members as
  select id, full_name, photo_url, rank_id, unit_id, short_bio, occupation, display_order
  from members
  where public_profile = true and status = 'active';

grant select on public_members to anon, authenticated;
