import type { Metadata } from 'next';
import { ServicesAccordion } from '@/components/ServicesAccordion';

export const metadata: Metadata = {
  title: { absolute: 'Geo&Land Kosova — Services' },
  description:
    'GIS and software development, surveying, mapping and remote sensing, agriculture and forestry, orthophotos and UAV aerial data collection — the six disciplines Geo&Land practises.',
  alternates: { canonical: '/services' },
  openGraph: {
    type: 'website',
    title: 'Geo&Land Kosova — Services',
    description:
      'Six disciplines. One standard — GIS, surveying, mapping, agriculture and forestry, orthophotos and UAV aerial data collection.',
    url: '/services',
    images: ['/assets/img/brand/og-services.jpg'],
  },
  twitter: { card: 'summary_large_image' },
};

export default function ServicesPage() {
  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.geoland-kosova.com/' },
              { '@type': 'ListItem', position: 2, name: 'Services', item: '/services' },
            ],
          }),
        }}
      />
      <section className="page-hero page-hero--services" aria-labelledby="page-title">
        <div className="container page-hero__inner">
          <p className="mono page-hero__crumb">
            <a href="/">Home</a> / <span>Services</span>
          </p>
          <h1 id="page-title">Six disciplines, scoped in detail.</h1>
          <p className="lead">
            What Geo&amp;Land does, scoped exactly as we practise it — from spatial data infrastructure to aerial
            surveying.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="services-title">
        <div className="container">
          <header className="section-head" data-reveal>
            <div className="section-head__row">
              <span className="mono section-head__index">[ 01 ]</span>
              <span className="mono eyebrow">Service scope</span>
              <span className="section-head__rule"></span>
            </div>
            <h2 id="services-title">What we deliver.</h2>
          </header>

          <div className="svc-list">
            <ServicesAccordion />
          </div>
        </div>
      </section>

      <section className="section section--paper2" aria-labelledby="caps-title">
        <div className="container">
          <header className="section-head" data-reveal>
            <div className="section-head__row">
              <span className="mono section-head__index">[ 02 ]</span>
              <span className="mono eyebrow">Capabilities</span>
              <span className="section-head__rule"></span>
            </div>
            <h2 id="caps-title">Built on standards.</h2>
          </header>
          <ul className="caps">
            <li>
              <span className="mono">01</span>
              <h3>Commercial &amp; open-source platforms</h3>
              <p>Large scale Geoinformation projects realized on different commercial and open source platforms, from desktop to server.</p>
            </li>
            <li>
              <span className="mono">02</span>
              <h3>Web-GIS</h3>
              <p>Web-based solutions for agriculture, forestry and local government — spatial and textual data in one system.</p>
            </li>
            <li>
              <span className="mono">03</span>
              <h3>Geo components</h3>
              <p>Desktop, mobile and server-side components; DBMS storage, geodata services and GDI components.</p>
            </li>
            <li>
              <span className="mono">04</span>
              <h3>INSPIRE-aligned development</h3>
              <p>Software development that takes trade development and INSPIRE directives into account.</p>
            </li>
            <li>
              <span className="mono">05</span>
              <h3>Certified processes</h3>
              <p>ISO 9001:2008 certified for GIS, geodetic and cadastre services, software development and project management.</p>
            </li>
            <li>
              <span className="mono">06</span>
              <h3>Training &amp; knowledge transfer</h3>
              <p>Institutional development and training so that clients can operate the systems we build.</p>
            </li>
          </ul>
        </div>
      </section>

      <section className="cta-band" aria-labelledby="cta-title">
        <div className="container">
          <div className="cta-band__inner">
            <div>
              <h2 id="cta-title">Tell us what you need surveyed, mapped or built.</h2>
              <div className="cta-band__actions">
                <a className="btn btn--orange" href="/contact">Contact Geo&amp;Land</a>
                <a className="btn btn--ghost-light" href="/projects">See projects</a>
              </div>
            </div>
            <p className="mono cta-band__coord">
              N 42.6629° · E 21.1655°<br />
              Prishtina · Kosovo
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
