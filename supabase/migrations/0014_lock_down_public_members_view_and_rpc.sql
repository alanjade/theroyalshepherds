-- ============================================================================
-- Security hardening found by the Supabase advisor.
--  1. public_members is a read-only window onto members. It is a SECURITY
--     DEFINER, auto-updatable view, so write grants on it bypassed the RLS on
--     members. Remove every write privilege; keep SELECT.
--  2. Functions that only signed-in users should call are no longer executable
--     by anon / PUBLIC (Postgres grants EXECUTE to PUBLIC by default).
--     is_staff / is_admin_or_above / is_super_admin / current_role_name are left
--     alone on purpose: RLS policies call them for anon queries too.
-- ============================================================================

revoke insert, update, delete, truncate, references, trigger on public.public_members from anon, authenticated;
grant select on public.public_members to anon, authenticated;

revoke execute on function public.checkout_asset(uuid, uuid, text, date, text, text, integer) from public, anon;
revoke execute on function public.checkin_asset(uuid, integer, integer, text, text, boolean) from public, anon;
revoke execute on function public.approve_application(uuid) from public, anon;
revoke execute on function public.log_audit_event(text, text, uuid, jsonb) from public, anon;

grant execute on function public.checkout_asset(uuid, uuid, text, date, text, text, integer) to authenticated;
grant execute on function public.checkin_asset(uuid, integer, integer, text, text, boolean) to authenticated;
grant execute on function public.approve_application(uuid) to authenticated;
grant execute on function public.log_audit_event(text, text, uuid, jsonb) to authenticated;
