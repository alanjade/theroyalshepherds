-- ============================================================================
-- Asset quantities.
--   tracking = 'individual' : one physical item (serial number allowed, quantity = 1)
--   tracking = 'bulk'       : a stock of identical items (e.g. 20 chairs), no serial number
-- Bulk loans carry a quantity and can be returned in part. Replaces the check-out /
-- check-in functions from 0011 (check-in now works on a single loan).
-- ============================================================================

alter table assets add column if not exists tracking text not null default 'individual';
alter table assets add column if not exists quantity integer not null default 1;
alter table asset_checkouts add column if not exists quantity integer not null default 1;

alter table assets drop constraint if exists assets_tracking_check;
alter table assets add constraint assets_tracking_check check (tracking in ('individual','bulk'));
alter table assets drop constraint if exists assets_quantity_check;
alter table assets add constraint assets_quantity_check check (quantity >= 0);
alter table assets drop constraint if exists assets_individual_one;
alter table assets add constraint assets_individual_one check (tracking <> 'individual' or quantity = 1);
alter table assets drop constraint if exists assets_bulk_no_serial;
alter table assets add constraint assets_bulk_no_serial check (tracking <> 'bulk' or serial_number is null);
alter table asset_checkouts drop constraint if exists asset_checkouts_quantity_check;
alter table asset_checkouts add constraint asset_checkouts_quantity_check check (quantity >= 1);

-- A bulk asset can have several open loans, so the one-open-loan index goes.
-- The functions below lock the asset row and enforce the rules instead.
drop index if exists uq_asset_open_checkout;
-- A serial number identifies one physical item.
create unique index if not exists uq_assets_serial on assets (lower(serial_number)) where serial_number is not null;

drop function if exists checkout_asset(uuid, uuid, text, date, text, text);
drop function if exists checkin_asset(uuid, text, text, boolean);

create or replace function checkout_asset(
  p_asset_id uuid,
  p_member_id uuid,
  p_borrower_name text,
  p_due_date date,
  p_condition text,
  p_notes text,
  p_quantity integer default 1
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_status text; v_tracking text; v_qty integer; v_out integer; v_name text; v_id uuid;
begin
  if not is_staff() then raise exception 'Not allowed.'; end if;

  select status, tracking, quantity into v_status, v_tracking, v_qty
    from assets where id = p_asset_id for update;
  if not found then raise exception 'Asset not found.'; end if;
  if v_status <> 'available' then
    raise exception 'No units are available (status: %).', replace(v_status, '_', ' ');
  end if;

  if v_tracking = 'individual' then p_quantity := 1; end if;
  if p_quantity is null or p_quantity < 1 then raise exception 'Quantity must be at least 1.'; end if;

  select coalesce(sum(quantity), 0) into v_out from asset_checkouts where asset_id = p_asset_id and checked_in_at is null;
  if p_quantity > v_qty - v_out then
    raise exception 'Only % available.', v_qty - v_out;
  end if;

  v_name := nullif(trim(coalesce(p_borrower_name, '')), '');
  if p_member_id is not null then
    select full_name into v_name from members where id = p_member_id;
    if v_name is null then raise exception 'Member not found.'; end if;
  end if;
  if v_name is null then raise exception 'Choose a member or enter a borrower name.'; end if;

  insert into asset_checkouts (asset_id, member_id, borrower_name, due_date, condition_out, notes_out, checked_out_by, quantity)
  values (p_asset_id, p_member_id, v_name, p_due_date, nullif(p_condition, ''), nullif(p_notes, ''), auth.uid(), p_quantity)
  returning id into v_id;

  update assets
     set status = case when v_out + p_quantity >= v_qty then 'checked_out' else 'available' end
   where id = p_asset_id;
  return v_id;
end;
$$;

-- Returns some or all of ONE open loan. A part-return splits the loan: the returned
-- units become a closed history row and the rest stay on the open loan.
-- p_written_off = returned units that are damaged/lost and leave the stock (bulk only).
create or replace function checkin_asset(
  p_checkout_id uuid,
  p_quantity integer,
  p_written_off integer,
  p_condition text,
  p_notes text,
  p_needs_maintenance boolean default false
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_loan asset_checkouts%rowtype;
  v_tracking text; v_qty integer; v_out integer; v_new_qty integer; v_id uuid;
begin
  if not is_staff() then raise exception 'Not allowed.'; end if;

  select * into v_loan from asset_checkouts where id = p_checkout_id and checked_in_at is null for update;
  if not found then raise exception 'This loan is already closed.'; end if;

  select tracking, quantity into v_tracking, v_qty from assets where id = v_loan.asset_id for update;

  if v_tracking = 'individual' then p_quantity := v_loan.quantity; p_written_off := 0; end if;
  p_quantity := coalesce(p_quantity, v_loan.quantity);
  p_written_off := coalesce(p_written_off, 0);
  if p_quantity < 1 or p_quantity > v_loan.quantity then
    raise exception 'Return between 1 and % units.', v_loan.quantity;
  end if;
  if p_written_off < 0 or p_written_off > p_quantity then
    raise exception 'Written-off units must be between 0 and the quantity returned.';
  end if;

  if p_quantity = v_loan.quantity then
    update asset_checkouts
       set checked_in_at = now(), condition_in = nullif(p_condition, ''), notes_in = nullif(p_notes, ''), checked_in_by = auth.uid()
     where id = v_loan.id;
    v_id := v_loan.id;
  else
    update asset_checkouts set quantity = quantity - p_quantity where id = v_loan.id;
    insert into asset_checkouts (asset_id, member_id, borrower_name, checked_out_at, due_date, condition_out, notes_out,
                                 checked_out_by, quantity, checked_in_at, condition_in, notes_in, checked_in_by)
    values (v_loan.asset_id, v_loan.member_id, v_loan.borrower_name, v_loan.checked_out_at, v_loan.due_date, v_loan.condition_out,
            v_loan.notes_out, v_loan.checked_out_by, p_quantity, now(), nullif(p_condition, ''), nullif(p_notes, ''), auth.uid())
    returning id into v_id;
  end if;

  v_new_qty := v_qty - p_written_off;
  select coalesce(sum(quantity), 0) into v_out from asset_checkouts where asset_id = v_loan.asset_id and checked_in_at is null;

  update assets
     set quantity = v_new_qty,
         status = case
           when v_tracking = 'bulk' and v_new_qty = 0 then 'retired'
           when v_tracking = 'individual' and p_needs_maintenance then 'maintenance'
           when v_new_qty > 0 and v_out >= v_new_qty then 'checked_out'
           else 'available' end,
         condition = case when v_tracking = 'individual' and p_condition in ('new','good','fair','poor') then p_condition else condition end
   where id = v_loan.asset_id;
  return v_id;
end;
$$;

grant execute on function checkout_asset(uuid, uuid, text, date, text, text, integer) to authenticated;
grant execute on function checkin_asset(uuid, integer, integer, text, text, boolean) to authenticated;
