-- ============================================================================
-- Row Level Security
-- Roles live in profiles.role: super_admin, admin, editor, officer.
-- Helper functions read the caller's role without recursive RLS lookups
-- (SECURITY DEFINER + STABLE, bypasses RLS on profiles internally).
-- ============================================================================

alter table profiles enable row level security;
alter table site_settings enable row level security;
alter table ranks enable row level security;
alter table departments enable row level security;
alter table members enable row level security;
alter table officer_positions enable row level security;
alter table officers enable row level security;
alter table events enable row level security;
alter table event_registrations enable row level security;
alter table news_categories enable row level security;
alter table news enable row level security;
alter table gallery_albums enable row level security;
alter table gallery_photos enable row level security;
alter table membership_applications enable row level security;
alter table resources enable row level security;
alter table contact_messages enable row level security;
alter table audit_logs enable row level security;

create or replace function current_role_name()
returns text
language sql
security definer
stable
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_admin_or_above()
returns boolean
language sql
security definer
stable
as $$
  select coalesce((select role from profiles where id = auth.uid()) in ('super_admin','admin'), false);
$$;

create or replace function is_staff()
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from profiles where id = auth.uid());
$$;

-- ----------------------------------------------------------------------------
-- profiles: a user can read/update their own profile; admins can read all
-- ----------------------------------------------------------------------------
create policy "profiles_select_own_or_admin" on profiles for select
  using (id = auth.uid() or is_admin_or_above());
create policy "profiles_update_own" on profiles for update
  using (id = auth.uid());
create policy "profiles_admin_manage" on profiles for all
  using (is_admin_or_above()) with check (is_admin_or_above());

-- ----------------------------------------------------------------------------
-- site_settings: public read, admin write
-- ----------------------------------------------------------------------------
create policy "settings_public_read" on site_settings for select using (true);
create policy "settings_admin_write" on site_settings for update
  using (is_admin_or_above()) with check (is_admin_or_above());

-- ----------------------------------------------------------------------------
-- ranks / departments / officer_positions: public read, admin write
-- ----------------------------------------------------------------------------
create policy "ranks_public_read" on ranks for select using (true);
create policy "ranks_admin_write" on ranks for all
  using (is_admin_or_above()) with check (is_admin_or_above());

create policy "departments_public_read" on departments for select using (true);
create policy "departments_admin_write" on departments for all
  using (is_admin_or_above()) with check (is_admin_or_above());

create policy "positions_public_read" on officer_positions for select using (true);
create policy "positions_admin_write" on officer_positions for all
  using (is_admin_or_above()) with check (is_admin_or_above());

-- ----------------------------------------------------------------------------
-- members: public can only see rows with public_profile = true, and NOT the
-- private columns. Enforce column privacy via a public view (see below);
-- direct table SELECT is public_profile-gated, staff get full row access.
-- ----------------------------------------------------------------------------
create policy "members_public_read_flagged" on members for select
  using (public_profile = true or is_staff());
create policy "members_staff_write" on members for insert
  with check (is_staff());
create policy "members_staff_update" on members for update
  using (is_staff());
create policy "members_admin_delete" on members for delete
  using (is_admin_or_above());

-- Public-safe view: excludes all private columns entirely
create or replace view public_members as
  select id, full_name, photo_url, rank_id, department_id, short_bio
  from members
  where public_profile = true and status = 'active';

-- ----------------------------------------------------------------------------
-- officers: public read only where public_visible = true; staff manage
-- ----------------------------------------------------------------------------
create policy "officers_public_read" on officers for select
  using (public_visible = true or is_staff());
create policy "officers_staff_write" on officers for all
  using (is_staff()) with check (is_staff());

-- ----------------------------------------------------------------------------
-- events: public read published; staff read/manage all
-- ----------------------------------------------------------------------------
create policy "events_public_read_published" on events for select
  using (status = 'published' or is_staff());
create policy "events_staff_write" on events for all
  using (is_staff()) with check (is_staff());

-- event_registrations: never publicly readable. Public can INSERT (register)
-- if the event allows it; staff can read/manage.
create policy "registrations_staff_read" on event_registrations for select
  using (is_staff());
create policy "registrations_public_insert" on event_registrations for insert
  with check (
    exists (
      select 1 from events e
      where e.id = event_id
        and e.status = 'published'
        and e.registration_enabled = true
        and (e.registration_deadline is null or e.registration_deadline > now())
    )
  );
create policy "registrations_staff_manage" on event_registrations for all
  using (is_staff()) with check (is_staff());

-- ----------------------------------------------------------------------------
-- news_categories / news
-- ----------------------------------------------------------------------------
create policy "news_categories_public_read" on news_categories for select using (true);
create policy "news_categories_staff_write" on news_categories for all
  using (is_staff()) with check (is_staff());

create policy "news_public_read_published" on news for select
  using (status = 'published' or is_staff());
create policy "news_staff_write" on news for all
  using (is_staff()) with check (is_staff());

-- ----------------------------------------------------------------------------
-- gallery
-- ----------------------------------------------------------------------------
create policy "albums_public_read_published" on gallery_albums for select
  using (published = true or is_staff());
create policy "albums_staff_write" on gallery_albums for all
  using (is_staff()) with check (is_staff());

create policy "photos_public_read" on gallery_photos for select
  using (
    exists (select 1 from gallery_albums a where a.id = album_id and (a.published = true or is_staff()))
  );
create policy "photos_staff_write" on gallery_photos for all
  using (is_staff()) with check (is_staff());

-- ----------------------------------------------------------------------------
-- membership_applications: public can INSERT only; only staff can read/manage
-- ----------------------------------------------------------------------------
create policy "applications_public_insert" on membership_applications for insert
  with check (true);
create policy "applications_staff_manage" on membership_applications for all
  using (is_staff()) with check (is_staff());

-- ----------------------------------------------------------------------------
-- resources: visibility-gated
-- ----------------------------------------------------------------------------
create policy "resources_public_read" on resources for select
  using (
    visibility = 'public'
    or (visibility = 'members' and is_staff())
    or (visibility = 'admin' and is_admin_or_above())
  );
create policy "resources_staff_write" on resources for all
  using (is_staff()) with check (is_staff());

-- ----------------------------------------------------------------------------
-- contact_messages: public INSERT only; staff read/manage
-- ----------------------------------------------------------------------------
create policy "messages_public_insert" on contact_messages for insert with check (true);
create policy "messages_staff_manage" on contact_messages for all
  using (is_staff()) with check (is_staff());

-- ----------------------------------------------------------------------------
-- audit_logs: staff-only read; inserts happen via SECURITY DEFINER helper
-- (server actions call log_audit_event, not direct inserts) — but allow
-- staff inserts too for simplicity.
-- ----------------------------------------------------------------------------
create policy "audit_admin_read" on audit_logs for select using (is_admin_or_above());
create policy "audit_staff_insert" on audit_logs for insert with check (is_staff());

create or replace function log_audit_event(
  p_action text, p_entity_type text, p_entity_id uuid, p_metadata jsonb default '{}'::jsonb
) returns void
language plpgsql
security definer
as $$
begin
  insert into audit_logs (user_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, p_metadata);
end;
$$;
