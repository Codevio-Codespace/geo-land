# Geo&Land — Supabase setup (5 minutes)

The website already contains everything. You only fill in **`.env`**.

## 1. Create the database

1. Go to [supabase.com](https://supabase.com) → **New project** (free tier is fine).
2. Open **SQL Editor → New query**.
3. Paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.

This creates the `projects` table, security policies (public can only read published
projects; only signed-in admins can write), the `project-images` storage bucket,
and seeds the current 10 projects.

## 2. Create your admin login

**Authentication → Users → Add user → Create new user**

- Enter your email + a password, tick **Auto Confirm User**, save.
- That email/password is what you type into `admin.html`. To add more admins,
  repeat this step.

## 3. Fill in `.env`

Open `.env` in the project root. From **Project Settings → API** copy:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...        # "anon public" key
PORT=8080
```

The anon key is designed to be public — data access is enforced by the
Row Level Security policies installed in step 1.

## 4. Run the site

```bash
npm start          # or: node server.js
```

- Website → http://localhost:8080/
- Admin   → http://localhost:8080/admin.html

Sign in with the user from step 2, add/edit/delete projects — everything is
stored in Supabase and shows up on the public Projects section immediately.

---

## Deploying to a static host (Netlify, Vercel, GitHub Pages…)

Those hosts can't read `.env` at runtime. Run once after editing `.env`:

```bash
npm run sync-env
```

This bakes the values into `assets/js/env.js` — then deploy the folder as-is.

## Before you fill in `.env`

The site still works: it shows the published default projects and the admin
panel runs in **local mode** (passcode `geoland-admin`, data kept in your
browser only). Once `.env` is configured, it automatically switches to
Supabase auth + database.

## Changing the local-mode passcode

Edit `ACCESS_KEY` in `assets/js/admin.js`. (Irrelevant once Supabase is
configured — auth is then handled by Supabase users.)
