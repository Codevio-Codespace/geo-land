'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { key: 'home', href: '/', label: 'Home' },
  { key: 'about', href: '/about', label: 'About' },
  { key: 'services', href: '/services', label: 'Services' },
  { key: 'projects', href: '/projects', label: 'Projects' },
  { key: 'technology', href: '/technology', label: 'Technology' },
  { key: 'contact', href: '/contact', label: 'Contact' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const active = pathname === '/' ? 'home' : pathname.split('/')[1] || 'home';
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-nav">
        <div className="container">
          <div className="site-nav__inner">
            <Link className="brand" href="/" aria-label="Geo&Land — home">
              <svg width="30" height="33" viewBox="0 0 30 33" fill="none" aria-hidden="true">
                <path d="M15 1.5 28 8.25v16.5L15 31.5 2 24.75V8.25L15 1.5Z" stroke="#16232a" strokeWidth="2" />
                <circle cx="15" cy="16.5" r="6.5" stroke="#075056" strokeWidth="1.5" />
                <path
                  d="M15 10c2.6 1.8 2.6 11.2 0 13M15 10c-2.6 1.8-2.6 11.2 0 13M8.7 14.5h12.6"
                  stroke="#075056"
                  strokeWidth="1.5"
                />
                <circle cx="23" cy="8.5" r="2.4" fill="#ff5b04" />
              </svg>
              <span className="brand__text">
                GEO&amp;<em>LAND</em>
              </span>
            </Link>
            <nav className="site-nav__links" aria-label="Primary">
              {LINKS.map((link) => (
                <Link key={link.key} href={link.href} aria-current={link.key === active ? 'page' : undefined}>
                  {link.label}
                </Link>
              ))}
            </nav>
            <Link className="btn btn--orange btn--sm site-nav__cta" href="/contact">
              Start a project
            </Link>
            <button
              className="nav-toggle"
              type="button"
              aria-expanded="false"
              aria-controls="nav-drawer"
              aria-label="Open menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      <div className="nav-drawer" id="nav-drawer">
        <nav className="nav-drawer__links" aria-label="Mobile">
          {LINKS.map((link) => (
            <Link key={link.key} href={link.href} aria-current={link.key === active ? 'page' : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="nav-drawer__meta">
          <span className="mono">Contact</span>
          <a href="tel:+38338739193">+383 38 739 193</a>
          <a href="mailto:info@geoland-kosova.com">info@geoland-kosova.com</a>
        </div>
      </div>
    </>
  );
}
