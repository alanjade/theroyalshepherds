-- ============================================================================
-- Membership application -> member conversion (server-side, atomic)
-- ============================================================================
create or replace function approve_application(p_application_id uuid)
returns uuid
language plpgsql
security definer
as $$
declare
  v_app membership_applications%rowtype;
  v_member_id uuid;
  v_number text;
begin
  if not is_admin_or_above() then
    raise exception 'not authorized';
  end if;

  select * into v_app from membership_applications where id = p_application_id for update;
  if not found then
    raise exception 'application not found';
  end if;
  if v_app.status = 'approved' and v_app.member_id is not null then
    return v_app.member_id; -- idempotent: already converted
  end if;

  v_number := generate_membership_number();

  insert into members (
    membership_number, full_name, phone, email, date_of_birth, gender,
    address, church, guardian_name, guardian_phone, emergency_contact, status
  ) values (
    v_number, v_app.full_name, v_app.phone, v_app.email, v_app.date_of_birth, v_app.gender,
    v_app.address, v_app.church, v_app.parent_or_guardian_name, v_app.parent_or_guardian_phone,
    v_app.emergency_contact, 'active'
  ) returning id into v_member_id;

  update membership_applications
    set status = 'approved', member_id = v_member_id, reviewed_by = auth.uid()
    where id = p_application_id;

  perform log_audit_event('application_approved', 'membership_applications', p_application_id,
    jsonb_build_object('member_id', v_member_id, 'membership_number', v_number));

  return v_member_id;
end;
$$;

-- ============================================================================
-- Storage buckets
-- ============================================================================
insert into storage.buckets (id, name, public)
values
  ('company-assets', 'company-assets', true),
  ('member-photos', 'member-photos', false),
  ('event-images', 'event-images', true),
  ('news-images', 'news-images', true),
  ('gallery', 'gallery', true),
  ('resources', 'resources', false)
on conflict (id) do nothing;

-- Public buckets: anyone can read; only staff can write
create policy "public_assets_read" on storage.objects for select
  using (bucket_id in ('company-assets','event-images','news-images','gallery'));

create policy "public_assets_staff_write" on storage.objects for insert
  with check (bucket_id in ('company-assets','event-images','news-images','gallery') and is_staff());

create policy "public_assets_staff_update" on storage.objects for update
  using (bucket_id in ('company-assets','event-images','news-images','gallery') and is_staff());

create policy "public_assets_staff_delete" on storage.objects for delete
  using (bucket_id in ('company-assets','event-images','news-images','gallery') and is_staff());

-- Private buckets: staff-only read/write. Public resources are served via
-- signed URLs generated server-side (lib/storage), never direct bucket reads.
create policy "private_staff_read" on storage.objects for select
  using (bucket_id in ('member-photos','resources') and is_staff());

create policy "private_staff_write" on storage.objects for insert
  with check (bucket_id in ('member-photos','resources') and is_staff());

create policy "private_staff_update" on storage.objects for update
  using (bucket_id in ('member-photos','resources') and is_staff());

create policy "private_staff_delete" on storage.objects for delete
  using (bucket_id in ('member-photos','resources') and is_staff());
