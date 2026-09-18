-- ============================================================================
-- Royal Shepherds — Initial Schema
-- Single-company installation. UUID PKs. created_at/updated_at where relevant.
-- ============================================================================

create extension if not exists "pgcrypto";

-- Generic updated_at trigger
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ----------------------------------------------------------------------------
-- profiles (mirrors auth.users)
-- ----------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  avatar_url text,
  role text not null default 'officer' check (role in ('super_admin','admin','editor','officer')),
  member_id uuid, -- fk added after members table exists
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- site_settings (single row, JSON blocks for flexible config)
-- ----------------------------------------------------------------------------
create table site_settings (
  id boolean primary key default true check (id), -- enforce single row
  company_name text not null default '[Company Name]',
  company_motto text not null default 'One Fold, One Shepherd',
  company_description text not null default '[Company description not yet configured]',
  logo_url text,
  favicon_url text,
  address text,
  phone text,
  email text,
  whatsapp text,
  facebook_url text,
  instagram_url text,
  youtube_url text,
  tiktok_url text,
  x_url text,
  timezone text not null default 'Africa/Lagos',
  homepage jsonb not null default '{}'::jsonb, -- hero title/subtitle/image, cta labels, stats
  seo jsonb not null default '{}'::jsonb,      -- site title, meta description, og image, keywords
  updated_at timestamptz not null default now()
);
create trigger trg_settings_updated before update on site_settings
  for each row execute function set_updated_at();
insert into site_settings (id) values (true);

-- ----------------------------------------------------------------------------
-- ranks
-- ----------------------------------------------------------------------------
create table ranks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text,
  description text,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_ranks_updated before update on ranks
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- departments
-- ----------------------------------------------------------------------------
create table departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  display_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_departments_updated before update on departments
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- members
-- ----------------------------------------------------------------------------
create table members (
  id uuid primary key default gen_random_uuid(),
  membership_number text unique not null,
  full_name text not null,
  photo_url text,
  rank_id uuid references ranks(id) on delete set null,
  department_id uuid references departments(id) on delete set null,
  status text not null default 'active' check (status in ('active','inactive','suspended','archived')),
  public_profile boolean not null default false,
  short_bio text,
  -- private fields (never exposed publicly)
  phone text,
  email text,
  date_of_birth date,
  gender text,
  address text,
  church text,
  guardian_name text,
  guardian_phone text,
  emergency_contact text,
  private_notes text,
  joined_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_members_status on members(status);
create index idx_members_membership_number on members(membership_number);
create index idx_members_public on members(public_profile);
create trigger trg_members_updated before update on members
  for each row execute function set_updated_at();

alter table profiles add constraint fk_profiles_member
  foreign key (member_id) references members(id) on delete set null;

-- Server-side unique membership number generator: RS-YYYY-#### (per-year sequence)
create sequence if not exists membership_number_seq;

create or replace function generate_membership_number()
returns text as $$
declare
  yr text := to_char(now(), 'YYYY');
  next_val int;
  candidate text;
begin
  loop
    select count(*) + 1 into next_val
    from members
    where membership_number like 'RS-' || yr || '-%';
    candidate := 'RS-' || yr || '-' || lpad(next_val::text, 4, '0');
    exit when not exists (select 1 from members where membership_number = candidate);
  end loop;
  return candidate;
end;
$$ language plpgsql security definer;

-- ----------------------------------------------------------------------------
-- officer_positions + officers
-- ----------------------------------------------------------------------------
create table officer_positions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table officers (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  position_id uuid not null references officer_positions(id) on delete restrict,
  rank_id uuid references ranks(id) on delete set null,
  start_date date not null default current_date,
  end_date date,
  photo_url text,
  public_visible boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_officers_public on officers(public_visible);
create trigger trg_officers_updated before update on officers
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- events + event_registrations
-- ----------------------------------------------------------------------------
create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  short_description text,
  featured_image text,
  start_date date not null,
  end_date date,
  start_time time,
  end_time time,
  location text,
  category text,
  registration_enabled boolean not null default false,
  registration_deadline timestamptz,
  registration_capacity int,
  status text not null default 'draft' check (status in ('draft','published','cancelled','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_events_slug on events(slug);
create index idx_events_status on events(status);
create index idx_events_start_date on events(start_date);
create trigger trg_events_updated before update on events
  for each row execute function set_updated_at();

create table event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  membership_status text,
  member_id uuid references members(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  unique (event_id, email)
);
create index idx_registrations_event on event_registrations(event_id);

-- ----------------------------------------------------------------------------
-- news_categories + news
-- ----------------------------------------------------------------------------
create table news_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  display_order int not null default 0
);

create table news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text, -- sanitized HTML, sanitize again at render time
  featured_image text,
  category_id uuid references news_categories(id) on delete set null,
  author_id uuid references profiles(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_news_slug on news(slug);
create index idx_news_status on news(status);
create index idx_news_published_at on news(published_at);
create trigger trg_news_updated before update on news
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- gallery_albums + gallery_photos
-- ----------------------------------------------------------------------------
create table gallery_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  cover_image text,
  event_id uuid references events(id) on delete set null,
  album_date date,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_albums_slug on gallery_albums(slug);
create index idx_albums_published on gallery_albums(published);
create trigger trg_albums_updated before update on gallery_albums
  for each row execute function set_updated_at();

create table gallery_photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references gallery_albums(id) on delete cascade,
  image_url text not null,
  caption text,
  alt_text text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);
create index idx_photos_album on gallery_photos(album_id);

-- ----------------------------------------------------------------------------
-- membership_applications
-- ----------------------------------------------------------------------------
create table membership_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  date_of_birth date,
  gender text,
  address text,
  church text,
  parent_or_guardian_name text,
  parent_or_guardian_phone text,
  emergency_contact text,
  previous_experience text,
  message text,
  status text not null default 'pending' check (status in ('pending','reviewing','approved','rejected')),
  reviewer_notes text,
  reviewed_by uuid references profiles(id) on delete set null,
  member_id uuid references members(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_applications_status on membership_applications(status);
create index idx_applications_email on membership_applications(email);
create trigger trg_applications_updated before update on membership_applications
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- resources
-- ----------------------------------------------------------------------------
create table resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null check (category in ('Forms','Training','Notices','Guidelines','Publications','Documents','Other')),
  file_url text not null,
  file_name text not null,
  file_size bigint,
  visibility text not null default 'public' check (visibility in ('public','members','admin')),
  uploaded_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_resources_visibility on resources(visibility);
create trigger trg_resources_updated before update on resources
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- contact_messages
-- ----------------------------------------------------------------------------
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  is_read boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_messages_read on contact_messages(is_read);
create index idx_messages_created on contact_messages(created_at);

-- ----------------------------------------------------------------------------
-- audit_logs
-- ----------------------------------------------------------------------------
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index idx_audit_created on audit_logs(created_at);
create index idx_audit_user on audit_logs(user_id);
