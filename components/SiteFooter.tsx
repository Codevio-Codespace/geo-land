'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const PAGES = [
  { key: 'home', href: '/', label: 'Home' },
  { key: 'about', href: '/about', label: 'About' },
  { key: 'services', href: '/services', label: 'Services' },
  { key: 'projects', href: '/projects', label: 'Projects' },
  { key: 'technology', href: '/technology', label: 'Technology' },
  { key: 'contact', href: '/contact', label: 'Contact' },
];

const SERVICE_LINKS = [
  { href: '/services#gis', label: 'GIS & Software Development' },
  { href: '/services#surveying', label: 'Surveying' },
  { href: '/services#mapping', label: 'Mapping & Remote Sensing' },
  { href: '/services#agri', label: 'Agriculture & Forestry' },
  { href: '/services#ortho', label: 'Orthophotos' },
  { href: '/services#uav', label: 'Aerial Data Collection — UAV' },
];

export function SiteFooter() {
  const pathname = usePathname();
  const active = pathname === '/' ? 'home' : pathname.split('/')[1] || 'home';
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <Link className="brand" href="/" aria-label="Geo&Land — home">
              <svg width="30" height="33" viewBox="0 0 30 33" fill="none" aria-hidden="true">
                <path d="M15 1.5 28 8.25v16.5L15 31.5 2 24.75V8.25L15 1.5Z" stroke="#e4eef0" strokeWidth="2" />
                <circle cx="15" cy="16.5" r="6.5" stroke="#9fb2b8" strokeWidth="1.5" />
                <path
                  d="M15 10c2.6 1.8 2.6 11.2 0 13M15 10c-2.6 1.8-2.6 11.2 0 13M8.7 14.5h12.6"
                  stroke="#9fb2b8"
                  strokeWidth="1.5"
                />
                <circle cx="23" cy="8.5" r="2.4" fill="#ff5b04" />
              </svg>
              <span className="brand__text">
                GEO&amp;<em>LAND</em>
              </span>
            </Link>
            <p>
              One of the largest companies in south east Europe specialized in Geoinformation disciplines — GIS, land
              administration, cadastre, agriculture and software development.
            </p>
          </div>
          <div className="site-footer__col">
            <h3>Pages</h3>
            <ul>
              {PAGES.map((page) => (
                <li key={page.key}>
                  <Link
                    href={page.href}
                    aria-current={active !== 'home' && page.key === active ? 'page' : undefined}
                  >
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="site-footer__col">
            <h3>Services</h3>
            <ul>
              {SERVICE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="site-footer__col">
            <h3>Contact</h3>
            <address>
              Bardhyl Çaushi, Ob. C15/11 No. 07
              <br />
              10000 Prishtina, Kosovo
            </address>
            <address>
              Qamil Hoxha No. 5
              <br />
              10000 Prishtina, Kosovo
            </address>
            <address>
              <a href="tel:+38338739193">+383 38 739 193</a>
              <br />
              <a href="tel:+38344224853">+383 44 224 853</a>
              <br />
              <a href="mailto:info@geoland-kosova.com">info@geoland-kosova.com</a>
            </address>
          </div>
        </div>
        <div className="site-footer__bottom">
          <p>
            © <span data-year>2026</span> Geo&amp;Land — Kosova. All rights reserved.
          </p>
          <p className="mono">ISO 9001:2008 · Licensed by KCA · Licensed by MAFRD</p>
          <div className="site-footer__social">
            <a
              href="https://www.facebook.com/pages/GeoLand/127476490650224"
              aria-label="Geo&amp;Land on Facebook"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.3-1.5 1.6-1.5h1.7V4.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.3H7.6V14h2.8v8h3.1Z" />
              </svg>
            </a>
            <a href="https://twitter.com/geoandland" aria-label="Geo&amp;Land on Twitter">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.5 3h3.1l-6.8 7.8L21.8 21h-6.3l-4.9-6.4L5 21H1.9l7.3-8.3L2.2 3h6.4l4.4 5.9L17.5 3Zm-1.1 16.1h1.7L7.7 4.8H5.9l10.5 14.3Z" />
              </svg>
            </a>
            <a href="https://www.linkedin.com/company/geo%26land" aria-label="Geo&amp;Land on LinkedIn">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4.98 3.5C4.98 4.6 4.1 5.5 3 5.5S1 4.6 1 3.5 1.9 1.5 3 1.5s1.98.9 1.98 2ZM1.2 21.5h3.6V7.7H1.2v13.8ZM7.7 7.7h3.5v1.9h.1c.5-.9 1.7-1.9 3.5-1.9 3.7 0 4.4 2.4 4.4 5.6v8.2h-3.6v-7.3c0-1.7 0-3.9-2.4-3.9s-2.8 1.9-2.8 3.8v7.4H7.7V7.7Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
