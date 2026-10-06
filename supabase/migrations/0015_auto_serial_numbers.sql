-- ============================================================================
-- Auto-generate serial numbers for individual assets (SN-000001, SN-000002, ...).
-- Asset tags are already auto-generated (0012). A serial number typed in by hand
-- is always kept. Bulk stock never gets a serial (see assets_bulk_no_serial).
-- Runs on insert and update, so clearing the field on an individual item gives it
-- a fresh serial rather than leaving it empty.
-- ============================================================================

create sequence if not exists asset_serial_seq;

create or replace function set_asset_serial()
returns trigger language plpgsql set search_path = public as $$
declare
  v_serial text;
begin
  if new.tracking = 'individual' and (new.serial_number is null or btrim(new.serial_number) = '') then
    loop
      v_serial := 'SN-' || lpad(nextval('asset_serial_seq')::text, 6, '0');
      exit when not exists (select 1 from assets where lower(serial_number) = lower(v_serial));
    end loop;
    new.serial_number := v_serial;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_assets_serial on assets;
create trigger trg_assets_serial before insert or update on assets
  for each row execute function set_asset_serial();

-- Signed-in admins insert assets, so the generators need to use the sequences.
grant usage, select on sequence asset_tag_seq to authenticated;
grant usage, select on sequence asset_serial_seq to authenticated;

-- Give any existing individual item that has no serial one now.
update assets set serial_number = serial_number where tracking = 'individual' and serial_number is null;
