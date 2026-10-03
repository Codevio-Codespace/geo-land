import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Lightbox } from '@/components/Lightbox';
import { SiteScripts } from '@/components/SiteScripts';

export const revalidate = 60;

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&family=Schibsted+Grotesk:wght@600;700&display=swap"
        rel="stylesheet"
        precedence="font"
      />
      <link rel="stylesheet" href="/assets/css/base.css" precedence="site" />
      <link rel="stylesheet" href="/assets/css/components.css" precedence="site" />
      <link rel="stylesheet" href="/assets/css/pages.css" precedence="site" />
      <SiteHeader />
      {children}
      <Lightbox />
      <SiteFooter />
      <SiteScripts />
    </>
  );
}
