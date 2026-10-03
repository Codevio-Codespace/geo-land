# Geo&Land Kosova — Next.js + Supabase

The Geo&Land Kosova website, built with Next.js (App Router, TypeScript) and Supabase.
The public design is a 1:1 port of the original static site; the admin panel replaces the
old Python/SQLite CMS with Supabase Auth, Postgres and Storage.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- Supabase: Postgres content tables, Auth (email + password), Storage bucket `media`
- `sharp` for the server-side image pipeline (WebP + JPEG at multiple widths)
- The original vanilla CSS from `public/assets/css` is linked untouched — zero design changes

## Setup (5 minutes)

1. **Create a Supabase project** at [supabase.com](https://supabase.com).

2. **Run the schema**: in the Supabase dashboard open *SQL → New query*, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql) and run it. This creates the content tables,
   row-level-security policies and the public `media` storage bucket.

3. **Add environment variables**: copy `.env.local.example` to `.env.local` and fill in the
   values from *Project Settings → API*:

   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   NEXT_PUBLIC_SITE_URL=https://www.geoland-kosova.com
   ```

4. **Install and create the admin user**:

   ```bash
   npm install
   npm run admin:create -- you@example.com your-password
   ```

   Re-run the same command any time to reset the password. There is no public sign-up.

5. **Load the existing site content** (28 projects, 6 services, 8 milestones — recommended):

   ```bash
   npm run seed
   ```

   Re-run with `npm run seed -- --force` to wipe content and seed again.

6. **Run it**:

   ```bash
   npm run dev
   ```

   - Public site: http://localhost:3000
   - Admin panel: http://localhost:3000/admin (sign in with the user from step 4)

## How it works

```
app/
  (site)/                   public pages — shared header/footer/scripts, revalidate 60s
    page.tsx                home: services index + featured projects from Supabase
    about/ services/ …      static shells; dynamic blocks are async server components
    project/[slug]/         project detail rendered from Supabase
  admin/                    admin panel
    login/                  Supabase Auth sign-in
    (protected)/            dashboard, projects, services, milestones, media, confirm
    actions.ts              server actions for every mutation (validation ported 1:1)
  api/projects/route.ts     legacy JSON endpoint (same shape as the old /api/projects)
  sitemap.ts                sitemap.xml generated from published projects
proxy.ts                    refreshes Supabase auth cookies on /admin/*
lib/
  content.ts                all public + admin queries
  fallback.ts               bundled fallback content (site works before Supabase is set up)
  media.ts                  sharp pipeline + Supabase Storage upload/delete
  supabase/                 browser-free clients: public (anon), server (cookies), admin (service role)
components/                 site header/footer/lightbox/scripts + admin forms
public/assets/              original CSS, JS-independent images, fonts links live in layouts
supabase/schema.sql         database + storage + RLS, idempotent
scripts/seed.mjs            pushes data/*.json into Supabase
scripts/create-admin.mjs    creates or resets the admin user
data/                       seed + fallback content and the media manifest
```

Notes:

- Without environment variables the public site renders the bundled fallback content, so it
  builds and demos offline. The admin panel shows setup instructions instead.
- Uploaded images are resized to up to 1600/900/640 px, converted to WebP + JPEG and stored in
  the public `media` bucket; the `media` table records the URL base and available widths.
- Drafts (`published = 0`) never appear on the public site or in the sitemap.
- Old `.html` URLs redirect permanently to the new clean routes.

## Deploy on Vercel

1. Push the repository to GitHub, then import it at [vercel.com/new](https://vercel.com/new).
   Vercel auto-detects Next.js — no build settings or `vercel.json` needed.
2. Add the four environment variables in *Project Settings → Environment Variables* for
   Production, Preview and Development:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only, keep secret)
   - `NEXT_PUBLIC_SITE_URL` (e.g. `https://www.geoland-kosova.com`)

   `NEXT_PUBLIC_*` values are inlined at build time, so set them before the first deploy.
   Never prefix the service-role key with `NEXT_PUBLIC_` or expose it to client code.
3. Deploy. Every push to the production branch redeploys; other branches and PRs get preview URLs.
4. In Supabase, add your production domain to *Authentication → URL configuration*
   (Site URL and redirect URLs) so admin sign-in cookies work on the live domain.

### Secret handling

Real `.env` files are gitignored; `.env.local.example` contains placeholders only.
The Supabase anon key is intended for public use and relies on the schema's row-level-security
policies; never use the service-role key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
If a private credential is ever exposed, rotate it in the Supabase dashboard and update the
Vercel environment variable before redeploying — deleting a commit does not revoke old keys.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run seed` | Seed content from `data/` into Supabase (`--force` to replace) |
| `npm run admin:create -- <email> <password>` | Create or reset the admin login |
