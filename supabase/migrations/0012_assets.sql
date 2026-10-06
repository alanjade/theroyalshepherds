-- ============================================================================
-- Asset management with check-out / check-in.
--   assets          : the inventory (one row per physical item)
--   asset_checkouts : loan history (one open loan per asset at a time)
-- Check-out / check-in go through SECURITY DEFINER functions so the loan
-- record and the asset's status always change together, atomically.
-- ============================================================================

create sequence if not exists asset_tag_seq;

create table if not exists assets (
  id            uuid primary key default gen_random_uuid(),
  asset_tag     text unique,
  name          text not null,
  category      text,
  description   text,
  serial_number text,
  location      text,
  condition     text not null default 'good' check (condition in ('new','good','fair','poor')),
  status        text not null default 'available' check (status in ('available','checked_out','maintenance','retired')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create or replace function set_asset_tag()
returns trigger language plpgsql as $$
begin
  if new.asset_tag is null or new.asset_tag = '' then
    new.asset_tag := 'AST-' || lpad(nextval('asset_tag_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_assets_tag on assets;
create trigger trg_assets_tag before insert on assets
  for each row execute function set_asset_tag();

drop trigger if exists trg_assets_updated on assets;
create trigger trg_assets_updated before update on assets
  for each row execute function set_updated_at();

create table if not exists asset_checkouts (
  id               uuid primary key default gen_random_uuid(),
  asset_id         uuid not null references assets(id) on delete cascade,
  member_id        uuid references members(id) on delete set null,
  borrower_name    text not null,
  checked_out_at   timestamptz not null default now(),
  due_date         date,
  condition_out    text,
  notes_out        text,
  checked_out_by   uuid references profiles(id) on delete set null,
  checked_in_at    timestamptz,
  condition_in     text,
  notes_in         text,
  checked_in_by    uuid references profiles(id) on delete set null
);

create index if not exists idx_asset_checkouts_asset on asset_checkouts(asset_id, checked_out_at desc);
create index if not exists idx_asset_checkouts_member on asset_checkouts(member_id);
-- An asset can only have ONE open (not yet returned) loan.
create unique index if not exists uq_asset_open_checkout on asset_checkouts(asset_id) where checked_in_at is null;

-- ----------------------------------------------------------------------------
-- RLS: any signed-in staff can read; admins manage the inventory; loans are
-- written only through the functions below.
-- ----------------------------------------------------------------------------
alter table assets enable row level security;
alter table asset_checkouts enable row level security;

create policy "assets_staff_read" on assets for select using (is_staff());
create policy "assets_admin_write" on assets for all
  using (is_admin_or_above()) with check (is_admin_or_above());

create policy "asset_checkouts_staff_read" on asset_checkouts for select using (is_staff());

-- ----------------------------------------------------------------------------
-- checkout_asset / checkin_asset
-- ----------------------------------------------------------------------------
create or replace function checkout_asset(
  p_asset_id uuid,
  p_member_id uuid,
  p_borrower_name text,
  p_due_date date,
  p_condition text,
  p_notes text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_status text;
  v_name text;
  v_id uuid;
begin
  if not is_staff() then raise exception 'Not allowed.'; end if;

  select status into v_status from assets where id = p_asset_id for update;
  if not found then raise exception 'Asset not found.'; end if;
  if v_status <> 'available' then
    raise exception 'This asset is not available (it is %).', replace(v_status, '_', ' ');
  end if;

  v_name := nullif(trim(coalesce(p_borrower_name, '')), '');
  if p_member_id is not null then
    select full_name into v_name from members where id = p_member_id;
    if v_name is null then raise exception 'Member not found.'; end if;
  end if;
  if v_name is null then raise exception 'Choose a member or enter a borrower name.'; end if;

  insert into asset_checkouts (asset_id, member_id, borrower_name, due_date, condition_out, notes_out, checked_out_by)
  values (p_asset_id, p_member_id, v_name, p_due_date, nullif(p_condition, ''), nullif(p_notes, ''), auth.uid())
  returning id into v_id;

  update assets set status = 'checked_out' where id = p_asset_id;
  return v_id;
end;
$$;

create or replace function checkin_asset(
  p_asset_id uuid,
  p_condition text,
  p_notes text,
  p_needs_maintenance boolean default false
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  if not is_staff() then raise exception 'Not allowed.'; end if;

  update asset_checkouts
     set checked_in_at = now(),
         condition_in  = nullif(p_condition, ''),
         notes_in      = nullif(p_notes, ''),
         checked_in_by = auth.uid()
   where asset_id = p_asset_id and checked_in_at is null
  returning id into v_id;
  if v_id is null then raise exception 'This asset is not checked out.'; end if;

  update assets
     set status = case when p_needs_maintenance then 'maintenance' else 'available' end,
         condition = case when p_condition in ('new','good','fair','poor') then p_condition else condition end
   where id = p_asset_id;
  return v_id;
end;
$$;

grant execute on function checkout_asset(uuid, uuid, text, date, text, text) to authenticated;
grant execute on function checkin_asset(uuid, text, text, boolean) to authenticated;
