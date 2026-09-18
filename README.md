# The Royal Shepherds — Company Website & Admin Platform

A production-ready website and administration platform for a single local
company of The Royal Shepherds (CAC-affiliated Christian youth organization).
Built with Next.js 16 (App Router), Supabase (Postgres + Auth + Storage +
RLS), Tailwind CSS, and Zod.

> **Everything organizational is placeholder.** Ranks, departments, history,
> contact details and demo people are clearly marked `[Demo ...]` / bracketed
> placeholders. Replace them with your company's real information via
> `/admin/settings` and the respective admin screens before launch — see
> "Customizing branding" and "Replacing demo content" below.

## 1. Requirements

- Node.js 20+
- A free [Supabase](https://supabase.com) project
- A Vercel account for deployment (optional for local dev)

## 2. Install

```bash
npm install
cp .env.example .env.local
```

## 3. Supabase setup

1. Create a new Supabase project.
2. In **Settings → API**, copy the Project URL, `anon` public key, and
   `service_role` secret key into `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
   SUPABASE_SERVICE_ROLE_KEY=xxxx   # server-only, never exposed to the client
   ```

3. Install the Supabase CLI and link your project:

   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   ```

## 4. Database migrations

Run the three migrations in order (schema → RLS policies → workflows/storage):

```bash
npx supabase db push
```

This applies everything in `supabase/migrations/`:
- `0001_init_schema.sql` — all tables, indexes, constraints, triggers
- `0002_rls_policies.sql` — Row Level Security policies for every table
- `0003_workflows_storage.sql` — the atomic application→member approval
  function, membership-number generator, and storage buckets/policies

## 5. Seed data (optional but recommended for first run)

```bash
psql "$(npx supabase status -o env | grep DB_URL | cut -d= -f2)" -f supabase/seed.sql
```

Or paste the contents of `supabase/seed.sql` into the Supabase SQL Editor.
All seeded content is clearly bracketed/labelled as demo data — delete or
replace it from the admin dashboard.

## 6. Storage buckets

Buckets (`company-assets`, `member-photos`, `event-images`, `news-images`,
`gallery`, `resources`) and their access policies are created by migration
`0003`. Public buckets are publicly readable; `member-photos` and `resources`
are private — the app serves private resource downloads through short-lived
signed URLs (`/api/resources/[id]/download`), never a raw bucket URL.

## 7. Authentication & your first admin account

Supabase Auth handles login. There is no public admin sign-up — create your
first administrator manually:

1. In the Supabase dashboard, go to **Authentication → Users → Add user**
   and create a user with an email/password.
2. In the SQL Editor, insert their profile with the `super_admin` role:

   ```sql
   insert into profiles (id, full_name, email, role)
   values ('<paste the auth user id>', 'Your Name', 'you@example.org', 'super_admin');
   ```

3. Sign in at `/admin/login`.

Roles: `super_admin` > `admin` > `editor` > `officer` (see `lib/auth/index.ts`
for the exact permission map — extend `PERMISSIONS` there as you add
features). Authorization is enforced **server-side** in Server Actions and
Server Components, not just by hiding buttons — and RLS enforces it again at
the database layer as defense in depth.

## 8. Local development

```bash
npm run dev
```

Visit `http://localhost:3000` for the public site and
`http://localhost:3000/admin/login` for the admin dashboard.

## 9. Production deployment (Vercel + Supabase)

1. Push this repo to GitHub.
2. Import it into Vercel.
3. Add the same environment variables from `.env.local` in Vercel's project
   settings (**never** expose `SUPABASE_SERVICE_ROLE_KEY` as a
   `NEXT_PUBLIC_*` variable).
4. Set `NEXT_PUBLIC_SITE_URL` to your production domain (used for metadata,
   sitemap, and canonical URLs).
5. Deploy. Run migrations against your production Supabase project the same
   way as step 4 above (`supabase db push` with the production project
   linked).

## 10. Customizing branding

Everything in `site_settings` is editable from `/admin/settings`: company
name, motto, description, logo, contact details, social links, homepage hero
copy/CTAs, and SEO metadata. Nothing is hard-coded into components — pages
read from `getSiteSettings()` (`lib/settings.ts`).

To add a logo/favicon: upload the image to the `company-assets` bucket
(via the Supabase dashboard or a future admin upload UI) and paste its public
URL into Settings.

## 11. Replacing demo content

- **Ranks / Departments / Officer Positions**: `/admin/ranks`,
  `/admin/departments` — currently read-only screens seeded with demo rows;
  add create/edit forms following the same pattern as `EventFormDialog` /
  `MemberFormDialog` before relying on them for real data entry.
- **Members**: `/admin/members` — full create/archive/restore flow is wired
  up; demo members are seeded and safe to delete.
- **Events / News**: full create/publish/cancel/delete flows are wired up
  in `/admin/events` and `/admin/news`.
- **Membership Applications**: `/admin/applications` — approve/reject is
  fully wired, including the atomic application→member conversion (see
  `approve_application` in migration `0003`).
- **Gallery / Resources / Officers**: list views are wired to real data;
  the create/upload forms are the next piece to build (see "What's left" below).

## 12. What's implemented vs. what's scaffolded

This is a real, working system connected to Supabase — not a static mockup.
Given the scope of the spec (110 sections), the following is fully wired
end-to-end with real queries, RLS, validation and server-side authorization:

**Fully wired:** public site (all pages, SEO, sitemap/robots, event
registration, membership application, contact form with honeypot + basic
rate limiting), auth (login/logout, protected routes, role hierarchy),
members (CRUD + archive/restore + membership-number generation), events
(CRUD + publish/cancel/delete + registration + capacity + CSV-ready data
shape), news (create/publish/delete + sanitized rich text), membership
applications (review/approve/reject with atomic member conversion + email
hook), contact messages (read/archive), site settings, audit logging,
private resource downloads via signed URLs, RLS on every table, storage
bucket policies, member privacy (private columns never selected on public
pages — enforced by the `public_members` view + RLS, not just UI hiding).

**Scaffolded (list views wired to real data; create/edit forms to add
next, following the existing `EventFormDialog`/`MemberFormDialog` pattern):**
officers, ranks, departments, gallery album/photo upload with drag-and-drop
reordering, resource upload, CSV export buttons, email provider integration
(the abstraction in `lib/email/index.ts` is ready — plug in Resend/Postmark/SES),
scheduled news publication, bulk table actions.

## 13. Security notes

- Every admin mutation goes through a Server Action that calls
  `requirePermission()`/`requireRole()` server-side — never trust a hidden
  button alone.
- RLS is enabled on every table; policies are defined in
  `0002_rls_policies.sql`. There is no `USING (true)` on any sensitive table.
- Member private fields (DOB, address, guardian/emergency contact, private
  notes) are **never** selected on public pages — public pages query the
  `public_members` view, which only exposes safe columns, and RLS further
  restricts even that to `public_profile = true` rows.
- File uploads are validated server-side by size and MIME type
  (`lib/storage/signed-url.ts`) — never trust the client-reported type alone.
- Rich text (news `content`) is sanitized with DOMPurify both before storage
  and again at render time.
- Membership numbers are generated **server-side** via a Postgres function
  (`generate_membership_number`), never in the browser, avoiding races.
- The application→member approval workflow runs as a single atomic
  `SECURITY DEFINER` Postgres function so it can't be partially applied.

## 14. Known follow-ups

- `npx eslint .` currently fails in this sandbox due to an
  `eslint-config-next` / flat-config compatibility issue with this Next.js
  16 prerelease + ESLint 9 combination — `npm run typecheck` and
  `npm run build` both pass cleanly, which is the stronger guarantee. Re-run
  lint once you're on stable dependency versions in your own environment.
- `types/database.ts` is hand-written to match the migrations. Once your
  Supabase project is linked, regenerate it with
  `npx supabase gen types typescript --project-id <ref> > types/database.ts`
  for full type safety on every query.
- The in-memory rate limiter in `app/actions/public.ts` is best-effort and
  resets on redeploy — for real spam protection at scale, back it with a
  Supabase table or Redis (e.g. Upstash) keyed by IP.

## 15. Project structure

See the top-level `app/`, `components/`, `lib/`, `supabase/`, and `types/`
directories — organized by the architecture in the original spec (public
route group, admin section, Server Actions in `app/actions/`, Supabase
client variants in `lib/supabase/`, validation schemas in
`lib/validation/`).
