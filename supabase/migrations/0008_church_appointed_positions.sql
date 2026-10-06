-- ============================================================================
-- Church-appointed positions (patrons, patronesses, chaplain) get their own
-- section on the Leadership page, and a matching unit on the Members page.
-- ============================================================================

alter table officer_positions add column if not exists church_appointed boolean not null default false;

update officer_positions
set church_appointed = true
where lower(title) in ('patron', 'patroness', 'chaplain');

insert into units (name, display_order)
select 'Patrons & Chaplain', 0
where not exists (select 1 from units where name = 'Patrons & Chaplain');
