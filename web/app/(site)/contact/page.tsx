import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Geo&Land Kosova — Contact' },
  description:
    'Contact Geo&Land in Prishtina, Kosovo — phone +383 38 739 193, email info@geoland-kosova.com. Two offices on Bardhyl Çaushi and Qamil Hoxha streets.',
  alternates: { canonical: '/contact' },
  openGraph: {
    type: 'website',
    title: 'Geo&Land Kosova — Contact',
    description: 'Let us map your project — tell us what you need surveyed, mapped or built.',
    url: '/contact',
    images: ['/assets/img/brand/og-contact.jpg'],
  },
  twitter: { card: 'summary_large_image' },
};

export default function ContactPage() {
  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Geo&Land',
            url: 'https://www.geoland-kosova.com/',
            email: 'info@geoland-kosova.com',
            telephone: '+383 38 739 193',
            address: [
              {
                '@type': 'PostalAddress',
                streetAddress: 'Bardhyl Çaushi, Ob. C15/11 No. 07',
                postalCode: '10000',
                addressLocality: 'Prishtina',
                addressCountry: 'XK',
              },
              {
                '@type': 'PostalAddress',
                streetAddress: 'Qamil Hoxha No. 5',
                postalCode: '10000',
                addressLocality: 'Prishtina',
                addressCountry: 'XK',
              },
            ],
          }),
        }}
      />
      <section className="page-hero page-hero--contact" aria-labelledby="page-title">
        <div className="container page-hero__inner">
          <p className="mono page-hero__crumb">
            <a href="/">Home</a> / <span>Contact</span>
          </p>
          <h1 id="page-title">Let us map your project.</h1>
          <p className="lead">Tell us what you need surveyed, mapped or built — we will reply from Prishtina.</p>
        </div>
      </section>

      <section className="section" aria-labelledby="contact-title">
        <div className="container contact-layout">
          <div>
            <header className="section-head" data-reveal>
              <div className="section-head__row">
                <span className="mono section-head__index">[ 01 ]</span>
                <span className="mono eyebrow">Offices &amp; contact</span>
                <span className="section-head__rule"></span>
              </div>
              <h2 id="contact-title">Reach us directly.</h2>
            </header>
            <div className="contact-cards">
              <div className="contact-card">
                <span className="mono">Office 1</span>
                <address>
                  Street “Bardhyl Çaushi”<br />Ob. C15/11 No. 07<br />10000 Prishtina, Kosovo
                </address>
                <p>
                  <a
                    href="https://www.google.com/maps?q=Bardhyl%20%C3%87aushi%2C%20Prishtina%2C%20Kosovo"
                    rel="noopener"
                  >
                    Open in maps →
                  </a>
                </p>
              </div>
              <div className="contact-card">
                <span className="mono">Office 2</span>
                <address>
                  Street “Qamil Hoxha” No. 5<br />10000 Prishtina, Kosovo
                </address>
                <p>
                  <a
                    href="https://www.google.com/maps?q=Qamil%20Hoxha%2C%20Prishtina%2C%20Kosovo"
                    rel="noopener"
                  >
                    Open in maps →
                  </a>
                </p>
              </div>
              <div className="contact-card">
                <span className="mono">Phone</span>
                <p>
                  <a href="tel:+38338739193">+383 38 739 193</a>
                </p>
                <span className="mono">Mobile</span>
                <p>
                  <a href="tel:+38344224853">+383 44 224 853</a>
                </p>
              </div>
              <div className="contact-card">
                <span className="mono">Email</span>
                <p>
                  <a href="mailto:info@geoland-kosova.com">info@geoland-kosova.com</a>
                </p>
                <span className="mono">Follow</span>
                <p>
                  <a
                    href="https://www.facebook.com/pages/GeoLand/127476490650224"
                    rel="noopener"
                  >
                    Facebook
                  </a>{' '}
                  ·{' '}
                  <a href="https://twitter.com/geoandland" rel="noopener">
                    Twitter
                  </a>{' '}
                  ·{' '}
                  <a href="https://www.linkedin.com/company/geo%26land" rel="noopener">
                    LinkedIn
                  </a>
                </p>
              </div>
            </div>
            <div className="map-embed">
              <iframe
                src="https://www.google.com/maps?q=Bardhyl%20%C3%87aushi%2C%20Prishtina%2C%20Kosovo&output=embed"
                title="Map of the Geo&amp;Land office in Prishtina"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
              <p className="map-embed__link">
                <span>Office 1 — Bardhyl Çaushi, Prishtina</span>
                <a
                  href="https://www.google.com/maps?q=Bardhyl%20%C3%87aushi%2C%20Prishtina%2C%20Kosovo"
                  rel="noopener"
                >
                  Google Maps →
                </a>
              </p>
            </div>
          </div>

          <div>
            <header className="section-head" data-reveal>
              <div className="section-head__row">
                <span className="mono section-head__index">[ 02 ]</span>
                <span className="mono eyebrow">Message</span>
                <span className="section-head__rule"></span>
              </div>
              <h2>Send a message.</h2>
            </header>
            <form
              id="contact-form"
              className="contact-form"
              action="mailto:info@geoland-kosova.com"
              method="post"
              encType="text/plain"
              noValidate
            >
              <div className="field">
                <label htmlFor="cf-name">Name *</label>
                <input id="cf-name" name="name" type="text" autoComplete="name" required />
                <span className="field-error" aria-live="polite"></span>
              </div>
              <div className="field">
                <label htmlFor="cf-email">Email *</label>
                <input id="cf-email" name="email" type="email" autoComplete="email" required />
                <span className="field-error" aria-live="polite"></span>
              </div>
              <div className="field">
                <label htmlFor="cf-subject">Subject *</label>
                <input id="cf-subject" name="subject" type="text" required />
                <span className="field-error" aria-live="polite"></span>
              </div>
              <div className="field">
                <label htmlFor="cf-message">Message *</label>
                <textarea id="cf-message" name="message" rows={6} required></textarea>
                <span className="field-error" aria-live="polite"></span>
              </div>
              <button className="btn btn--orange" type="submit">
                Send message
              </button>
              <p className="form-note">
                This form composes an email in your mail client — or write to{' '}
                <a href="mailto:info@geoland-kosova.com">info@geoland-kosova.com</a> directly. All
                fields marked * are required.
              </p>
              <p className="form-success" id="form-success" hidden>
                Your email client should now open with the message ready to send.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
