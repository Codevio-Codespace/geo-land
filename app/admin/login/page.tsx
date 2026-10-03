import { loginAction } from '@/app/admin/actions';
import { hasServiceRole } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  const { err } = await searchParams;
  const configured = isSupabaseConfigured() && hasServiceRole();

  if (!configured) {
    return (
      <div className="auth-page">
        <div className="auth-box">
          <p className="mono">Geo&Land Kosova — Supabase setup</p>
          <h1>Connect Supabase to enable the admin panel</h1>
          <p className="note">
            Add the following variables to <code>.env.local</code>, then restart the server:
          </p>
          <p className="mono" style={{ display: 'grid', gap: '.35rem', marginBottom: 'var(--s-4)' }}>
            <span>NEXT_PUBLIC_SUPABASE_URL</span>
            <span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
            <span>SUPABASE_SERVICE_ROLE_KEY</span>
          </p>
          <p className="note">
            Run <code>supabase/schema.sql</code> in the Supabase SQL editor, create an admin user with{' '}
            <code>npm run admin:create -- you@example.com your-password</code>, optionally load the site content with{' '}
            <code>npm run seed</code>. Full steps are in <code>README.md</code>.
          </p>
          <a className="btn btn--ghost" href="/">
            Back to the website
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <p className="mono">Geo&Land Kosova — Admin</p>
        <h1>Sign in</h1>
        {err ? (
          <p className="notice notice--err" role="alert">
            {err}
          </p>
        ) : null}
        <form action={loginAction}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="username" required autoFocus />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          <button className="btn btn--orange" type="submit">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
