import type { Metadata } from 'next';
import { Milestones } from '@/components/Milestones';

export const metadata: Metadata = {
  title: { absolute: 'Geo&Land Kosova — About' },
  description: 'Geo&Land is a certified Geoinformation company in Prishtina — ISO 9001:2008 by Bureau Veritas, licensed by the Kosovo Cadastral Agency and MAFRD. Meet our teams.',
  alternates: { canonical: '/about' },
  openGraph: {
    type: 'website',
    title: 'Geo&Land Kosova — About',
    description: 'Who we are, what we stand for, and the teams that deliver — the company behind the maps.',
    url: '/about',
    images: ['/assets/img/brand/og-about.jpg'],
  },
  twitter: { card: 'summary_large_image' },
};

export default function AboutPage() {
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
              { '@type': 'ListItem', position: 2, name: 'About', item: 'https://www.geoland-kosova.com/about' },
            ],
          }),
        }}
      />
      <section className="page-hero page-hero--about" aria-labelledby="page-title">
        <div className="container page-hero__inner">
          <p className="mono page-hero__crumb"><a href="/">Home</a> / <span>About</span></p>
          <h1 id="page-title">The company behind the maps.</h1>
          <p className="lead">Who we are, what we stand for, and the teams that deliver.</p>
        </div>
      </section>

      <section className="section" aria-labelledby="profile-title">
        <div className="container">
          <header className="section-head" data-reveal>
            <div className="section-head__row">
              <span className="mono section-head__index">[ 01 ]</span>
              <span className="mono eyebrow">Company profile</span>
              <span className="section-head__rule"></span>
            </div>
            <h2 id="profile-title">One of the largest Geoinformation companies in south east Europe.</h2>
          </header>
          <div className="about-profile">
            <div className="about-profile__copy">
              <p>Geo&amp;Land is specialized in Geoinformation disciplines — GIS, land administration, cadastre, agriculture and software development. Recently, Geo&amp;Land has implemented many national projects in Kosovo, few of them carried out for the first time in our country.</p>
              <p>We are trained and certified by prestigious and well-known standards and institutions to offer high quality services with a qualified and diverse staff — certified by ISO 9001:2008 for geodetic services, GIS and software development as well as project management, licensed by the Kosovo Cadastral Agency for cadastral and property rights services, and by MAFRD for compilation of forest management plans.</p>
              <p>Geo&amp;Land's current strategy is to realize large scale projects in the field of Geoinformation, including software development and Web-GIS systems in different commercial and open source platforms. The software development department is rising rapidly, taking into account trade development and INSPIRE directives. Geo&amp;Land intends to remain a leader in the field of GIS and land administration in Kosovo. Today, our activities extend into Albania and North Macedonia.</p>
              <blockquote>We believe that integrity, collaboration, commitment, and professionalism are the core values that enable us to create the best working environment, in which passion, open-mindedness, and creativity are fostered.</blockquote>
            </div>
            <figure className="about-profile__figure" data-reveal data-reveal-delay="120">
              <picture>
                <source type="image/webp" srcSet="assets/img/about/profile-1020.webp" />
                <img src="assets/img/about/profile-1020.jpg" width="1020" height="476" alt="Geo&amp;Land work montage — satellite mapping, a surveying total station and cadastral plans" loading="lazy" decoding="async" />
              </picture>
              <figcaption className="mono">GIS · surveying · cadastral work</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="section section--paper2" aria-labelledby="mission-title">
        <div className="container">
          <header className="section-head" data-reveal>
            <div className="section-head__row">
              <span className="mono section-head__index">[ 02 ]</span>
              <span className="mono eyebrow">Mission &amp; values</span>
              <span className="section-head__rule"></span>
            </div>
            <h2 id="mission-title">Innovative. Dedicated. Reliable.</h2>
            <p className="lead">Our mission is to provide the highest quality services in order to meet client needs — hiring and training our team so that we do not just complete projects, but form lasting relationships. Based on our experience, one of our business components lies in institutional development, training and knowledge transfer. All our business areas are supported by senior-level consultancy, research and development.</p>
          </header>
          <ul className="values">
            <li>
              <span className="mono">01 — Integrity</span>
              <h3>Lasting relationships</h3>
              <p>We aim to do business in a way that clients can always count on us — and keep counting on us.</p>
            </li>
            <li>
              <span className="mono">02 — Collaboration</span>
              <h3>Knowledge transfer</h3>
              <p>Institutional development and training so that customers benefit from our experience and capability.</p>
            </li>
            <li>
              <span className="mono">03 — Commitment</span>
              <h3>Beyond delivery</h3>
              <p>Driven not just to achieve goals and complete projects, but to go beyond and give the best possible service.</p>
            </li>
            <li>
              <span className="mono">04 — Professionalism</span>
              <h3>Best available techniques</h3>
              <p>Senior-level consultancy and R&amp;D ensure that services are realized with the best available techniques and standards.</p>
            </li>
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="teams-title">
        <div className="container">
          <header className="section-head" data-reveal>
            <div className="section-head__row">
              <span className="mono section-head__index">[ 03 ]</span>
              <span className="mono eyebrow">Teams</span>
              <span className="section-head__rule"></span>
              <span className="mono muted">04 teams</span>
            </div>
            <h2 id="teams-title">The key to our success is its staff.</h2>
            <p className="lead">The hiring process is a highly competitive one. The selected members of our staff are not only successful academically, but eager and passionate in what they do.</p>
          </header>
          <div className="teams-grid">
            <article className="team-card">
              <picture>
                <source type="image/webp" srcSet="assets/img/team/management-210.webp" />
                <img src="assets/img/team/management-210.jpg" width="210" height="247" alt="Geo&amp;Land management team working together" loading="lazy" decoding="async" />
              </picture>
              <div>
                <h3>Management Team</h3>
                <p>High professionals with prestigious educational backgrounds — selected by the board of the company.</p>
              </div>
            </article>
            <article className="team-card">
              <picture>
                <source type="image/webp" srcSet="assets/img/team/geodesy-210.webp" />
                <img src="assets/img/team/geodesy-210.jpg" width="210" height="247" alt="Geo&amp;Land geodesy team on site" loading="lazy" decoding="async" />
              </picture>
              <div>
                <h3>Geodesy Team</h3>
                <p>Specialized in GIS and land surveying, qualified and trained to provide quality services across our surveying projects.</p>
              </div>
            </article>
            <article className="team-card">
              <picture>
                <source type="image/webp" srcSet="assets/img/team/software-210.webp" />
                <img src="assets/img/team/software-210.jpg" width="210" height="247" alt="Geo&amp;Land software development team at work" loading="lazy" decoding="async" />
              </picture>
              <div>
                <h3>Software Development Team</h3>
                <p>Trained to solve problems with creative solutions; the applications we deliver are sophisticated, easy to use, and come with manuals and instructions.</p>
              </div>
            </article>
            <article className="team-card">
              <picture>
                <source type="image/webp" srcSet="assets/img/team/agriculture-696.webp" />
                <img src="assets/img/team/agriculture-696.jpg" width="696" height="464" alt="Agriculture and forestry work by Geo&amp;Land" loading="lazy" decoding="async" />
              </picture>
              <div>
                <h3>Agriculture Team</h3>
                <p>Working to improve the agricultural landscape of Kosovo — consulting farmers and helping ideas become businesses with access to grants.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section section--paper2" aria-labelledby="certs-title">
        <div className="container">
          <header className="section-head" data-reveal>
            <div className="section-head__row">
              <span className="mono section-head__index">[ 04 ]</span>
              <span className="mono eyebrow">Licences &amp; certificates</span>
              <span className="section-head__rule"></span>
            </div>
            <h2 id="certs-title">Certified and licensed.</h2>
            <p className="lead">After a successful completion of a review process by Bureau Veritas, Geo&amp;Land received its ISO 9001:2008 for GIS, geodetic, cadastre and project management — a token of the quality of services offered to our clients.</p>
          </header>
          <div className="certs-grid">
            <article className="cert-card">
              <button type="button" data-lightbox="certs" data-caption="ISO 9001:2008 — Bureau Veritas" aria-label="View ISO 9001:2008 certificate">
                <picture>
                  <source type="image/webp" srcSet="assets/img/certs/iso-9001-289.webp" />
                  <img src="assets/img/certs/iso-9001-289.jpg" width="289" height="124" alt="ISO 9001:2008 certificate issued to Geo&amp;Land by Bureau Veritas" loading="lazy" decoding="async" />
                </picture>
              </button>
              <h3>ISO 9001:2008</h3>
              <p>Bureau Veritas — for geodetic and cadastre services, GIS and software development, and project management.</p>
            </article>
            <article className="cert-card">
              <button type="button" data-lightbox="certs" data-caption="Forest management plans licence — MAFRD" aria-label="View MAFRD licence">
                <picture>
                  <source type="image/webp" srcSet="assets/img/certs/mafrd-forestry-352.webp" />
                  <img src="assets/img/certs/mafrd-forestry-352.jpg" width="352" height="124" alt="Licence for compilation of long-term forest management plans" loading="lazy" decoding="async" />
                </picture>
              </button>
              <h3>Forest management plans</h3>
              <p>Licensed for compilation of long-term forest management plans — Ministry of Agriculture and Forestry.</p>
            </article>
            <article className="cert-card">
              <button type="button" data-lightbox="certs" data-caption="Cadastral and property rights licence — KCA" aria-label="View Kosovo Cadastral Agency licence">
                <picture>
                  <source type="image/webp" srcSet="assets/img/certs/kca-cadastre-342.webp" />
                  <img src="assets/img/certs/kca-cadastre-342.jpg" width="342" height="124" alt="Licence for cadastral and property rights registration" loading="lazy" decoding="async" />
                </picture>
              </button>
              <h3>Cadastral &amp; property rights</h3>
              <p>Licensed for cadastral and property rights registration — Kosovo Cadastral Agency.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="clients-title">
        <div className="container">
          <header className="section-head" data-reveal>
            <div className="section-head__row">
              <span className="mono section-head__index">[ 05 ]</span>
              <span className="mono eyebrow">Clients &amp; milestones</span>
              <span className="section-head__rule"></span>
              <span className="mono muted">2011 → today</span>
            </div>
            <h2 id="clients-title">Trusted across industries and borders.</h2>
            <p className="lead">The list of our clients reflects the range of our projects and the professionalism with which we carry out the services — public and private, from different industries. Soon after our establishment we started to grow beyond our borders to include international organizations.</p>
          </header>
          <div className="clients-band">
            <p className="mono muted">Selected organizations Geo&amp;Land has worked with, as cited in project records</p>
            <ul className="clients-band__list">
              <li>FAO — Food and Agriculture Organization of the UN</li>
              <li>USAID</li>
              <li>Deloitte</li>
              <li>Ministry of Agriculture</li>
              <li>Kosovo Forest Agency</li>
              <li>Municipality of Peja</li>
              <li>Municipality of Rahovec</li>
              <li>Ministry of Environment and Spatial Planning</li>
              <li>New CO Ferronickel L.L.C</li>
              <li>Consult Engineering</li>
            </ul>
          </div>
          <ol className="timeline">
            <Milestones />
          </ol>
        </div>
      </section>

      <section className="section section--paper2" aria-labelledby="careers-title">
        <div className="container">
          <header className="section-head" data-reveal>
            <div className="section-head__row">
              <span className="mono section-head__index">[ 06 ]</span>
              <span className="mono eyebrow">Careers</span>
              <span className="section-head__rule"></span>
            </div>
            <h2 id="careers-title">Work with us.</h2>
            <p className="lead">We employ only the best. In our journey to achieve our mission, we ask future employees to be committed, team players, communicative, professional in their field, and respectful of work ethic. If that is you, send us your application — note that we read applications when a vacancy is open.</p>
          </header>
          <p><a className="btn btn--ghost" href="https://www.geoland-kosova.com/images/jobapp/jobapp.docx" rel="noopener">Download the application form</a></p>
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
