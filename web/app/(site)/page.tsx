import type { Metadata } from 'next';
import { FeaturedProjects } from '@/components/FeaturedProjects';
import { ServicesIndex } from '@/components/ServicesIndex';

export const metadata: Metadata = {
  title: { absolute: 'Geo&Land Kosova — Geoinformation, Surveying & GIS' },
  description:
    'Geo&Land is one of the largest companies in south east Europe specialized in Geoinformation — GIS, land administration, cadastre, agriculture, surveying and software development. ISO 9001:2008 certified. Prishtina, Kosovo.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    title: 'Geo&Land Kosova — Geoinformation, Surveying & GIS',
    description:
      'Geoinformation, land administration, cadastre, surveying and software development — from Prishtina, across south east Europe.',
    url: '/',
    images: ['/assets/img/brand/og-home.jpg'],
  },
  twitter: { card: 'summary_large_image' },
};

export default function HomePage() {
  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Geo&Land',
            url: 'https://www.geoland-kosova.com/',
            email: 'info@geoland-kosova.com',
            telephone: '+383 38 739 193',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Bardhyl Çaushi, Ob. C15/11 No. 07',
              postalCode: '10000',
              addressLocality: 'Prishtina',
              addressCountry: 'XK',
            },
            sameAs: [
              'https://www.facebook.com/pages/GeoLand/127476490650224',
              'https://twitter.com/geoandland',
              'https://www.linkedin.com/company/geo&land',
            ],
          }),
        }}
      />
      <section className="hero-home" id="hero">
        <svg className="hero-home__contour" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path d="M-60 600 C 180 500, 360 640, 620 560 S 1060 420, 1500 500" />
          <path d="M-60 690 C 220 620, 420 750, 700 670 S 1120 550, 1500 630" />
          <path d="M960 250 c 80 -62 220 -62 300 0 c 62 48 62 132 0 180 c -80 62 -220 62 -300 0 c -62 -48 -62 -132 0 -180 z" />
        </svg>
        <div className="container hero-home__grid">
          <div className="hero-home__copy">
            <p className="mono hero-home__kicker">Geoinformation · Land administration · Cadastre — Prishtina, Kosovo</p>
            <h1>Ground truth, measured precisely.</h1>
            <p className="lead hero-home__lead">Geo&amp;Land is one of the largest companies in south east Europe specialized in Geoinformation disciplines — GIS, land administration, cadastre, agriculture and software development. Since our early national projects, we have carried out work in Kosovo that had never been done here before.</p>
            <div className="hero-home__actions">
              <a className="btn" href="/services">Explore services</a>
              <a className="btn btn--ghost" href="/contact">Talk to our team</a>
            </div>
            <p className="mono hero-home__coords">
              <span>N 42.6629°</span><span>E 21.1655°</span><span>Grid zone 34T</span>
            </p>
          </div>
          <figure className="hero-figure">
            <picture>
              <source type="image/webp" srcSet="assets/img/uav/ortho-1-995.webp" />
              <img src="assets/img/uav/ortho-1-995.jpg" width="995" height="742" alt="Orthophoto of vineyard parcels near Rahovec, captured by Geo&amp;Land UAV survey" fetchPriority="high" decoding="async" />
            </picture>
            <figcaption className="hero-figure__tag">Orthophoto — Rahovec vineyards</figcaption>
          </figure>
        </div>
      </section>
      <section className="creds" aria-label="Certifications, licences and partnerships">
        <div className="container">
          <div className="creds__grid">
            <div className="creds__item">
              <span className="mono">Certified</span>
              <p>ISO 9001:2008 by Bureau Veritas — GIS, geodetic, cadastre and project management.</p>
            </div>
            <div className="creds__item">
              <span className="mono">Licensed</span>
              <p>Kosovo Cadastral Agency — cadastral and property rights registration.</p>
            </div>
            <div className="creds__item">
              <span className="mono">Licensed</span>
              <p>MAFRD — compilation of long-term forest management plans.</p>
            </div>
            <div className="creds__item">
              <span className="mono">Partner</span>
              <p>AIRBUS since 2013 — Kosovo, Croatia, Albania and North Macedonia.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="services-title">
        <div className="container">
          <header className="section-head" data-reveal>
            <div className="section-head__row">
              <span className="mono section-head__index">[ 01 ]</span>
              <span className="mono eyebrow">Services</span>
              <span className="section-head__rule"></span>
              <span className="mono muted">06 disciplines</span>
            </div>
            <h2 id="services-title">Six disciplines. One standard.</h2>
            <p className="lead">From geodetic control networks to Web-GIS platforms — what Geo&amp;Land practises, precisely as it is scoped in our projects.</p>
          </header>
          <div className="svc-index">
            <ServicesIndex />
          </div>
        </div>
      </section>
      <section className="section section--paper2" aria-labelledby="projects-title">
        <div className="container">
          <header className="section-head" data-reveal>
            <div className="section-head__row">
              <span className="mono section-head__index">[ 02 ]</span>
              <span className="mono eyebrow">Projects</span>
              <span className="section-head__rule"></span>
            </div>
            <h2 id="projects-title">Work that speaks for itself.</h2>
            <p className="lead">National projects in Kosovo — a few of them carried out here for the first time — and long-running partnerships with international organizations.</p>
          </header>
          <FeaturedProjects />
        </div>
      </section>
      <section className="section" aria-labelledby="company-title">
        <div className="container">
          <header className="section-head" data-reveal>
            <div className="section-head__row">
              <span className="mono section-head__index">[ 03 ]</span>
              <span className="mono eyebrow">Company</span>
              <span className="section-head__rule"></span>
            </div>
            <h2 id="company-title">The company behind the maps.</h2>
          </header>
          <div className="teaser">
            <div className="teaser__copy">
              <blockquote>If we were to describe Geo&amp;Land in three words it would be innovative, dedicated, and reliable.</blockquote>
              <p>Our staff continuously raise their education and professional level — and our growth reflects the seriousness with which we work. From a small company, Geo&amp;Land today serves public and private clients across different industries, and international organizations beyond our borders.</p>
              <p><a className="link-arrow" href="/about">About Geo&amp;Land</a></p>
            </div>
            <figure className="teaser__photo" data-reveal data-reveal-delay="120">
              <picture>
                <source type="image/webp" srcSet="assets/img/gallery/field-008-640.webp" />
                <img src="assets/img/gallery/field-008-640.jpg" width="640" height="480" alt="A Geo&amp;Land total station set up on an infrastructure construction site" loading="lazy" decoding="async" />
              </picture>
            </figure>
          </div>
          <div className="teaser__facts">
            <div className="fact"><span className="fact__value">06</span><span className="mono fact__label">Service disciplines</span></div>
            <div className="fact"><span className="fact__value">20<em>+</em></span><span className="mono fact__label">Documented projects</span></div>
            <div className="fact"><span className="fact__value">05</span><span className="mono fact__label">Software systems</span></div>
            <div className="fact"><span className="fact__value">ISO</span><span className="mono fact__label">9001:2008 certified</span></div>
          </div>
        </div>
      </section>

      <section className="section section--ink" aria-labelledby="tech-title">
        <div className="container">
          <header className="section-head" data-reveal>
            <div className="section-head__row">
              <span className="mono section-head__index">[ 04 ]</span>
              <span className="mono eyebrow">Technology</span>
              <span className="section-head__rule"></span>
            </div>
            <h2 id="tech-title">From field to map to decision.</h2>
          </header>
          <div className="tech-strip__grid">
            <div className="tech-strip__copy">
              <p>Certified UAV operators capture, analyse and archive aerial data — distributed through web map services. Since 2013 we are the only AIRBUS partner for Kosovo, Croatia, Albania and North Macedonia, bringing satellite imagery and agricultural monitoring into the same workflows.</p>
              <p><a className="link-arrow" href="/technology">See technology</a></p>
            </div>
            <div className="gallery-strip" data-reveal data-reveal-delay="120">
              <button type="button" data-lightbox="home-uav" data-caption="UAV fieldwork — vineyard flight control" aria-label="Open image: UAV fieldwork, vineyard flight control">
                <picture>
                  <source type="image/webp" srcSet="assets/img/uav/field-1-640.webp" />
                  <img src="assets/img/uav/field-1-640.jpg" width="640" height="853" alt="UAV controller displaying a live vineyard flight over Rahovec" loading="lazy" decoding="async" />
                </picture>
              </button>
              <button type="button" data-lightbox="home-uav" data-caption="UAV deliverable — digital elevation model" aria-label="Open image: digital elevation model">
                <picture>
                  <source type="image/webp" srcSet="assets/img/uav/dem-1-640.webp" />
                  <img src="assets/img/uav/dem-1-640.jpg" width="640" height="355" alt="Digital elevation model produced from UAV survey data" loading="lazy" decoding="async" />
                </picture>
              </button>
              <button type="button" data-lightbox="home-uav" data-caption="UAV deliverable — point cloud" aria-label="Open image: UAV point cloud">
                <picture>
                  <source type="image/webp" srcSet="assets/img/uav/pointcloud-640.webp" />
                  <img src="assets/img/uav/pointcloud-640.jpg" width="640" height="355" alt="High-density point cloud captured by UAV LiDAR" loading="lazy" decoding="async" />
                </picture>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band" aria-labelledby="cta-title">
        <div className="container">
          <div className="cta-band__inner">
            <div>
              <h2 id="cta-title">Tell us what you need surveyed, mapped or built.</h2>
              <div className="cta-band__actions">
                <a className="btn btn--orange" href="/contact">Contact Geo&amp;Land</a>
                <a className="btn btn--ghost-light" href="/services">Browse services</a>
              </div>
            </div>
            <p className="mono cta-band__coord">N 42.6629° · E 21.1655°<br />Prishtina · Kosovo</p>
          </div>
        </div>
      </section>
    </main>
  );
}
