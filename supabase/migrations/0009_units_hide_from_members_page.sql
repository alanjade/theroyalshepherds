-- Units can be hidden from the public Members page (e.g. patrons & chaplain,
-- who are shown on the Leadership page instead). Their member records stay,
-- because officer assignments reference them.
alter table units add column if not exists show_on_members_page boolean not null default true;
update units set show_on_members_page = false where name = 'Patrons & Chaplain';
