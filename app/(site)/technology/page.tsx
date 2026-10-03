import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Geo&Land Kosova — Technology & Capabilities' },
  description: 'UAV surveying at up to 1 cm/pixel, AIRBUS satellite imagery partnership since 2013, orthophotos and the GIS software systems Geo&Land builds for Kosovo.',
  alternates: { canonical: '/technology' },
  openGraph: {
    type: 'website',
    title: 'Geo&Land Kosova — Technology & Capabilities',
    description: 'Technology with a job to do — UAV surveying, satellite data and the systems we build.',
    url: '/technology',
    images: ['/assets/img/brand/og-technology.jpg'],
  },
  twitter: { card: 'summary_large_image' },
};

export default function TechnologyPage() {
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
              { '@type': 'ListItem', position: 2, name: 'Technology', item: '/technology' },
            ],
          }),
        }}
      />
      <section className="page-hero page-hero--technology" aria-labelledby="page-title">
        <div className="container page-hero__inner">
          <p className="mono page-hero__crumb"><a href="/">Home</a> / <span>Technology</span></p>
          <h1 id="page-title">Technology with a job to do.</h1>
          <p className="lead">UAV surveying, satellite data and the systems we build — chosen for the work, not for show.</p>
        </div>
      </section>

      <section className="section" aria-labelledby="uav-title">
        <div className="container">
          <header className="section-head" data-reveal>
            <div className="section-head__row">
              <span className="mono section-head__index">[ 01 ]</span>
              <span className="mono eyebrow">Aerial data collection</span>
              <span className="section-head__rule"></span>
            </div>
            <h2 id="uav-title">Up to 1 cm/pixel from the air.</h2>
          </header>
          <div className="uav-grid">
            <div className="uav-grid__copy">
              <p>Geo&amp;Land is a drone data collection provider. Our certified UAV operators control the process of data capture, analysis, archival and distribution — delivering aerial data quickly and more cost-effectively than ever before, using web map services. Whether the project is mapping, agriculture and forestry, mining and volume calculation, vegetation and crop diagnosis, oil and gas, infrastructure and utilities, or emergency and disaster response — our team can quickly and safely provide a UAV LiDAR survey at 1 cm/pixel resolution.</p>
              <dl className="tech-specs">
                <div><dt>Surveying</dt><dd>Field control and mapping support for volume and progress work.</dd></div>
                <div><dt>Orthophoto</dt><dd>Georeferenced, mosaic-ready aerial imagery.</dd></div>
                <div><dt>Point cloud</dt><dd>High-density 3D capture from UAV LiDAR.</dd></div>
                <div><dt>DEM</dt><dd>Digital elevation and surface models from the same flight.</dd></div>
              </dl>
            </div>
            <figure className="uav-grid__figure" data-reveal data-reveal-delay="120">
              <picture>
                <source type="image/webp" srcSet="assets/img/uav/field-1-900.webp" />
                <img src="assets/img/uav/field-1-900.jpg" width="900" height="1200" alt="Geo&amp;Land UAV controller displaying a live vineyard flight over Rahovec" loading="lazy" decoding="async" />
              </picture>
              <figcaption className="mono">Live flight control — vineyard mapping, Rahovec</figcaption>
            </figure>
          </div>
          <div className="gallery-strip" data-reveal>
            <button type="button" data-lightbox="uav-surveying" data-caption="UAV deliverable — surveying" aria-label="Open image: UAV surveying">
              <picture>
                <source type="image/webp" srcSet="assets/img/uav/surveying-1-640.webp" />
                <img src="assets/img/uav/surveying-1-640.jpg" width="640" height="480" alt="UAV surveying in the field" loading="lazy" decoding="async" />
              </picture>
            </button>
            <button type="button" data-lightbox="uav-ortho" data-full="assets/img/uav/ortho-3-1215.jpg" data-caption="UAV deliverable — orthophoto" aria-label="Open image: UAV orthophoto">
              <picture>
                <source type="image/webp" srcSet="assets/img/uav/ortho-3-640.webp" />
                <img src="assets/img/uav/ortho-3-640.jpg" width="640" height="478" alt="Orthophoto mosaic produced from UAV imagery" loading="lazy" decoding="async" />
              </picture>
            </button>
            <button type="button" data-lightbox="uav-pointcloud" data-full="assets/img/uav/pointcloud-1600.jpg" data-caption="UAV deliverable — point cloud" aria-label="Open image: UAV point cloud">
              <picture>
                <source type="image/webp" srcSet="assets/img/uav/pointcloud-640.webp" />
                <img src="assets/img/uav/pointcloud-640.jpg" width="640" height="355" alt="High-density point cloud from UAV LiDAR" loading="lazy" decoding="async" />
              </picture>
            </button>
            <button type="button" data-lightbox="uav-dem" data-full="assets/img/uav/dem-2-1463.jpg" data-caption="UAV deliverable — digital elevation model" aria-label="Open image: digital elevation model">
              <picture>
                <source type="image/webp" srcSet="assets/img/uav/dem-2-640.webp" />
                <img src="assets/img/uav/dem-2-640.jpg" width="640" height="355" alt="Digital elevation model from UAV survey" loading="lazy" decoding="async" />
              </picture>
            </button>
            <button type="button" data-lightbox="uav-ortho" data-full="assets/img/uav/ortho-5-1443.jpg" data-caption="UAV deliverable — orthophoto, parcel detail" aria-label="Open image: orthophoto parcel detail">
              <picture>
                <source type="image/webp" srcSet="assets/img/uav/ortho-5-640.webp" />
                <img src="assets/img/uav/ortho-5-640.jpg" width="640" height="479" alt="Orthophoto parcel detail from UAV survey" loading="lazy" decoding="async" />
              </picture>
            </button>
          </div>
        </div>
      </section>

      <section className="section section--paper2" aria-labelledby="ortho-title">
        <div className="container">
          <header className="section-head" data-reveal>
            <div className="section-head__row">
              <span className="mono section-head__index">[ 02 ]</span>
              <span className="mono eyebrow">Orthophotos</span>
              <span className="section-head__rule"></span>
            </div>
            <h2 id="ortho-title">Imagery for planning that has to hold up.</h2>
            <p className="lead">For the purpose of urban-spatial planning, Geo&amp;Land offers aerial images and orthophotos for Kosovo, Albania and North Macedonia. To manage urban, development and legalization plans, we provide a GIS municipal portal — imagery and registers in the same system.</p>
          </header>
          <p><a className="link-arrow" href="/services#ortho">Orthophotos as a service</a></p>
        </div>
      </section>

      <section className="section section--ink" aria-labelledby="airbus-title">
        <div className="container airbus-band">
          <header className="section-head" data-reveal>
            <div className="section-head__row">
              <span className="mono section-head__index">[ 03 ]</span>
              <span className="mono eyebrow">Satellite data</span>
              <span className="section-head__rule"></span>
              <span className="mono muted">AIRBUS partner since 2013</span>
            </div>
            <h2 id="airbus-title">The only AIRBUS partner for the region.</h2>
          </header>
          <div className="airbus-band__head">
            <p>Geo&amp;Land proudly holds a partnership agreement with AIRBUS, covering cooperation in promoting, distributing and using AIRBUS products and services — from satellite optical and radar imagery to Agriculture Satellite Monitoring Services and OneAtlas. The agreement dates back to 2013, and Geo&amp;Land continues to be the only AIRBUS partner for the Republic of Kosovo, Croatia, Albania and North Macedonia.</p>
            <p className="mono">Territories — Kosovo · Croatia · Albania · North Macedonia</p>
          </div>
          <div className="table-scroll" tabIndex={0} role="region" aria-label="AIRBUS satellite imagery products">
            <table>
              <thead>
                <tr><th scope="col">Imagery</th><th scope="col">Swath</th><th scope="col">Revisit capacity</th><th scope="col">Resolution</th><th scope="col">Daily capacity</th></tr>
              </thead>
              <tbody>
                <tr><td>Pléiades Neo</td><td>14 km</td><td>Twice daily, anywhere</td><td>30 cm pan / 1.2 m MS</td><td>2,000,000 km²</td></tr>
                <tr><td>Pléiades</td><td>20 km</td><td>Twice daily, anywhere</td><td>50 cm pan / 2 m MS</td><td>700,000 km²</td></tr>
                <tr><td>Vision-1</td><td>20.8 km</td><td>Daily to 8 days</td><td>0.9 m pan / 3.5 m MS</td><td>20,000 km²</td></tr>
                <tr><td>SPOT 6/7</td><td>60 km</td><td>Twice daily, anywhere</td><td>1.5 m pan / 6 m MS</td><td>6,000,000 km²</td></tr>
                <tr><td>Radar Constellation</td><td>4–270 km</td><td>Daily for most latitudes</td><td>25 cm to 40 m</td><td>5,400,000 km²</td></tr>
                <tr><td>DMC Constellation</td><td>640 km</td><td>Daily to every 2 days</td><td>22 m</td><td>22,000,000 km²</td></tr>
                <tr><td>KazEOSat-1 (3rd party)</td><td>20 km</td><td>2–3 days</td><td>1 m</td><td>220,000 km²</td></tr>
              </tbody>
            </table>
          </div>
          <p className="airbus-band__caption">Source: Airbus Defence and Space product documentation, as published on geoland-kosova.com.</p>
          <dl className="monitor-list">
            <div>
              <dt>Verde</dt>
              <dd>Crop analytics built on satellite and UAV imagery.</dd>
            </div>
            <div>
              <dt>AgNeo</dt>
              <dd>Decision support platform for precision farming.</dd>
            </div>
            <div>
              <dt>Farmstar</dt>
              <dd>Satellite and UAV agronomic advice through the crop cycle.</dd>
            </div>
            <div>
              <dt>Starling</dt>
              <dd>Monitoring for deforestation-free commodity production.</dd>
            </div>
            <div>
              <dt>Grassland Index</dt>
              <dd>Continuous grass growth monitoring for insurers and breeders.</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section" aria-labelledby="products-title">
        <div className="container">
          <header className="section-head" data-reveal>
            <div className="section-head__row">
              <span className="mono section-head__index">[ 04 ]</span>
              <span className="mono eyebrow">Software</span>
              <span className="section-head__rule"></span>
            </div>
            <h2 id="products-title">Software in national service.</h2>
            <p className="lead">Geo&amp;Land's software development department builds Web-GIS systems and registers on commercial and open source platforms — taking trade development and INSPIRE directives into account.</p>
          </header>
          <ol className="systems">
            <li className="system-row">
              <span className="mono system-row__index">01</span>
              <div className="system-row__main">
                <h3>Kosovo Forest Information System (KFIS)</h3>
                <p>A system application that aims to enhance the strategy and policies in forestry in Kosovo — established as a permanent IT system for the sector.</p>
              </div>
              <dl className="system-row__meta">
                <div><dt>Client</dt><dd>FAO</dd></div>
                <div><dt>Scope</dt><dd>National forestry system</dd></div>
              </dl>
            </li>
            <li className="system-row">
              <span className="mono system-row__index">02</span>
              <div className="system-row__main">
                <h3>Vineyard Cadastre &amp; Wine Quality Control (SVV v1.3)</h3>
                <p>Unique application for vineyards and wines, built from the vineyard register project with the Ministry of Agriculture.</p>
              </div>
              <dl className="system-row__meta">
                <div><dt>Client</dt><dd>Ministry of Agriculture</dd></div>
                <div><dt>Scope</dt><dd>Vineyard cadastre · wine quality</dd></div>
              </dl>
            </li>
            <li className="system-row">
              <span className="mono system-row__index">03</span>
              <div className="system-row__main">
                <h3>National Farmer and Payment System (SPFN)</h3>
                <p>Web-based farmer register and grant management, responsive across browsers and devices, with an Ajax-based interface.</p>
              </div>
              <dl className="system-row__meta">
                <div><dt>Platform</dt><dd>HTML5 · jQuery · jQuery UI · jqGrid</dd></div>
              </dl>
            </li>
            <li className="system-row">
              <span className="mono system-row__index">04</span>
              <div className="system-row__main">
                <h3>Municipal GIS System</h3>
                <p>One of the first municipal GIS systems in Kosovo — geospatial and textual data presented together in one system.</p>
              </div>
              <dl className="system-row__meta">
                <div><dt>Client</dt><dd>Municipality of Peja</dd></div>
              </dl>
            </li>
            <li className="system-row">
              <span className="mono system-row__index">05</span>
              <div className="system-row__main">
                <h3>Addressing System</h3>
                <p>Addressing system developed by Geo&amp;Land, part of our register work for public institutions.</p>
              </div>
              <dl className="system-row__meta">
                <div><dt>Since</dt><dd>2011</dd></div>
              </dl>
            </li>
          </ol>
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
            <p className="mono cta-band__coord">N 42.6629° · E 21.1655°<br />Prishtina · Kosovo</p>
          </div>
        </div>
      </section>
    </main>
  );
}
