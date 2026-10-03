import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: { absolute: 'Admin · Geo&Land' },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&family=Schibsted+Grotesk:wght@600;700&display=swap"
        rel="stylesheet"
        precedence="font"
      />
      <link rel="stylesheet" href="/assets/css/base.css" precedence="admin" />
      <link rel="stylesheet" href="/admin/admin.css" precedence="admin" />
      <style precedence="admin">{'body{background:var(--paper);font-size:.95rem}'}</style>
      {children}
    </>
  );
}
