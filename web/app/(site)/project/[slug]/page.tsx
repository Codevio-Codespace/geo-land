import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Fragment, cache } from 'react';
import { CATS } from '@/lib/db-types';
import type { MediaRow } from '@/lib/db-types';
import { getMediaById, getProjectImages, getPublicProjectBySlug } from '@/lib/content';
import { Picture, mediaWidths, paragraphs } from '@/lib/render';
import { SITE_URL } from '@/lib/supabase/config';

export const revalidate = 60;

const loadProject = cache(async (slug: string) => getPublicProjectBySlug(slug));

function ogImageFor(media: MediaRow | null): string | null {
  if (!media) return null;
  const widths = mediaWidths(media);
  const w = widths.includes(900) ? 900 : widths.length ? Math.max(...widths) : null;
  if (!w) return null;
  const path = `${media.base}-${w}.jpg`;
  return path.startsWith('http') ? path : `${SITE_URL}${path}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await loadProject(slug);
  if (!project) return { title: { absolute: 'Not found — Geo&Land Kosova' } };
  const media = await getMediaById(project.image_media_id);
  const description = (project.description || '').trim();
  const metaDesc = description.split('\n')[0].slice(0, 160) || `${project.title} — a Geo&Land project.`;
  const ogImage = ogImageFor(media);
  return {
    title: { absolute: `${project.title} — Geo&Land Kosova` },
    description: metaDesc,
    alternates: { canonical: `/project/${project.slug}` },
    openGraph: {
      type: 'article',
      title: `${project.title} — Geo&Land Kosova`,
      description: metaDesc,
      url: `/project/${project.slug}`,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await loadProject(slug);
  if (!project) notFound();

  const media = await getMediaById(project.image_media_id);
  const gallery = await getProjectImages(project.id);
  const category = CATS[project.category] || project.category;
  const metaBits = [category];
  if (project.year) metaBits.push(String(project.year));
  if (project.org) metaBits.push(project.org);
  const metaLine = metaBits.join(' · ');
  const body = paragraphs(project.description);

  const crumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Projects', item: `${SITE_URL}/projects` },
      { '@type': 'ListItem', position: 3, name: project.title, item: `${SITE_URL}/project/${project.slug}` },
    ],
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumb) }} />
      <section className="page-hero page-hero--projects" aria-labelledby="page-title">
        <div className="container page-hero__inner">
          <p className="mono page-hero__crumb">
            <a href="/">Home</a> / <a href="/projects">Projects</a> / <span>{project.title}</span>
          </p>
          <h1 id="page-title">{project.title}</h1>
          <p className="mono muted">{metaLine}</p>
        </div>
      </section>

      <section className="section">
        <div className="container about-profile">
          {media ? (
            <figure className="about-profile__figure">
              <Picture media={media} sizes="(max-width: 1023px) 100vw, 45vw" loading="eager" />
            </figure>
          ) : null}
          <div className="about-profile__copy">
            {body.map((para, i) => (
              <p key={i}>
                {para.split('\n').map((line, j) => (
                  <Fragment key={j}>
                    {j > 0 ? <br /> : null}
                    {line}
                  </Fragment>
                ))}
              </p>
            ))}
            <p>
              <a className="link-arrow" href="/projects">
                Back to the register
              </a>
            </p>
          </div>
        </div>
      </section>

      {gallery.length ? (
        <section className="section section--paper2" aria-labelledby="gallery-title">
          <div className="container">
            <header className="section-head">
              <div className="section-head__row">
                <span className="mono section-head__index">[ 01 ]</span>
                <span className="mono eyebrow">Gallery</span>
                <span className="section-head__rule"></span>
              </div>
              <h2 id="gallery-title">{gallery.length} images from this project.</h2>
            </header>
            <div className="gallery-strip">
              {gallery.map((m) => {
                const label = m.alt || project.title;
                return (
                  <button
                    type="button"
                    data-lightbox="project-gallery"
                    data-caption={label}
                    aria-label={`Open image: ${label}`}
                    key={m.id}
                  >
                    <Picture media={m} sizes="(max-width: 719px) 70vw, 320px" />
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
