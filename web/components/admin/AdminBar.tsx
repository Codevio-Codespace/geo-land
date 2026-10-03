'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/admin/actions';

const LINKS = [
  { key: 'dashboard', href: '/admin', label: 'Dashboard' },
  { key: 'projects', href: '/admin/projects', label: 'Projects' },
  { key: 'services', href: '/admin/services', label: 'Services' },
  { key: 'milestones', href: '/admin/milestones', label: 'Milestones' },
  { key: 'media', href: '/admin/media', label: 'Media' },
];

export function AdminBar({ username }: { username: string }) {
  const pathname = usePathname();
  const active = pathname.startsWith('/admin/projects')
    ? 'projects'
    : pathname.startsWith('/admin/services')
      ? 'services'
      : pathname.startsWith('/admin/milestones')
        ? 'milestones'
        : pathname.startsWith('/admin/media')
          ? 'media'
          : pathname.startsWith('/admin/confirm')
            ? 'dashboard'
            : 'dashboard';

  return (
    <header className="admin-bar">
      <div className="admin-bar__inner">
        <Link className="admin-brand" href="/admin">
          <span className="brand__text">
            GEO&amp;<em>LAND</em>
          </span>
          <span className="mono admin-brand__tag">Admin</span>
        </Link>
        <nav className="admin-nav" aria-label="Admin">
          {LINKS.map((link) => (
            <Link key={link.key} href={link.href} className={link.key === active ? 'is-active' : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="admin-bar__meta">
          <a href="/" target="_blank" rel="noopener">
            View site ↗
          </a>
          <span className="mono">{username}</span>
          <form action={logoutAction}>
            <button className="linkish" type="submit">
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
