-- ============================================================================
-- 1. Force a password change on first sign-in (temporary passwords).
-- 2. Harden the profiles table: only super admins can change roles / links.
--    (Previously any signed-in user could update their own row, including
--    `role`, and any admin could edit any profile.)
-- ============================================================================

alter table profiles add column if not exists must_change_password boolean not null default false;

create or replace function is_super_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce((select role from profiles where id = auth.uid()) = 'super_admin', false);
$$;

-- Admins can still READ every profile (profiles_select_own_or_admin), but only
-- super admins can write other people's rows.
drop policy if exists "profiles_admin_manage" on profiles;
create policy "profiles_super_admin_manage" on profiles for all
  using (is_super_admin()) with check (is_super_admin());

-- A user may still update their own row (name, avatar, clearing the
-- must-change-password flag) but never their privileges.
create or replace function protect_profile_privileges()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  -- auth.uid() is null for the service role and SQL editor, so server-side
  -- provisioning keeps working.
  if auth.uid() is not null and not is_super_admin()
     and (new.id is distinct from old.id
          or new.role is distinct from old.role
          or new.member_id is distinct from old.member_id
          or new.email is distinct from old.email) then
    raise exception 'You are not allowed to change role, email or linked member.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_protect on profiles;
create trigger trg_profiles_protect before update on profiles
  for each row execute function protect_profile_privileges();

-- The super admin's password was shared in a chat message: make it change on next sign-in.
update profiles set must_change_password = true where role = 'super_admin';
