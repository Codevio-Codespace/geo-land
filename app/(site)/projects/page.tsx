import type { Metadata } from 'next';
import { ProjectsExplorer } from '@/components/ProjectsExplorer';

export const metadata: Metadata = {
  title: { absolute: 'Geo&Land Kosova — Projects' },
  description: 'Documented projects by Geo&Land across GIS and agriculture, software development, geodetic and cadastral surveying, and forestry in Kosovo and the region.',
  alternates: { canonical: '/projects' },
  openGraph: {
    type: 'website',
    title: 'Geo&Land Kosova — Projects',
    description: 'Work that speaks for itself — GIS, software, cadastre and forestry projects across Kosovo since 2011.',
    url: '/projects',
    images: ['/assets/img/brand/og-projects.jpg'],
  },
  twitter: { card: 'summary_large_image' },
};

export default function ProjectsPage() {
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
              { '@type': 'ListItem', position: 2, name: 'Projects', item: 'https://www.geoland-kosova.com/projects' },
            ],
          }),
        }}
      />
      <section className="page-hero page-hero--projects" aria-labelledby="page-title">
        <div className="container page-hero__inner">
          <p className="mono page-hero__crumb"><a href="/">Home</a> / <span>Projects</span></p>
          <h1 id="page-title">Every project on the record.</h1>
          <p className="lead">A selection of documented projects across GIS and agriculture, software development, geodetic and cadastral surveying, and forestry.</p>
        </div>
      </section>

      <section className="section" aria-labelledby="register-title">
        <div className="container">
          <header className="section-head" data-reveal>
            <div className="section-head__row">
              <span className="mono section-head__index">[ 01 ]</span>
              <span className="mono eyebrow">Project register</span>
              <span className="section-head__rule"></span>
              <span className="mono muted">2011 → today</span>
            </div>
            <h2 id="register-title">The register.</h2>
            <p className="lead">Every entry below corresponds to work recorded on Geo&amp;Land's project pages — filter by discipline or open a project for its details.</p>
          </header>
          <ProjectsExplorer />
        </div>
      </section>

      <section className="cta-band" aria-labelledby="cta-title">
        <div className="container">
          <div className="cta-band__inner">
            <div>
              <h2 id="cta-title">Tell us what you need surveyed, mapped or built.</h2>
              <div className="cta-band__actions">
                <a className="btn btn--orange" href="/contact">Contact Geo&amp;Land</a>
                <a className="btn btn--ghost-light" href="/technology">See technology</a>
              </div>
            </div>
            <p className="mono cta-band__coord">N 42.6629° · E 21.1655°<br />Prishtina · Kosovo</p>
          </div>
        </div>
      </section>
    </main>
  );
}
