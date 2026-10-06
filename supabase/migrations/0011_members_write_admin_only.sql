-- ============================================================================
-- Only admins (and super admins) can create or edit members.
-- Previously any signed-in staff account (editor, officer) could, via the API,
-- even though the app only offers it to admins. Reading stays as it was.
-- ============================================================================

drop policy if exists "members_staff_write" on members;
drop policy if exists "members_staff_update" on members;

create policy "members_admin_insert" on members for insert
  with check (is_admin_or_above());

create policy "members_admin_update" on members for update
  using (is_admin_or_above()) with check (is_admin_or_above());
