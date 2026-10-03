import Link from 'next/link';
import { CATS } from '@/lib/db-types';
import { getFeaturedProjects, getMediaByIds } from '@/lib/content';
import { Picture } from '@/lib/render';

export async function FeaturedProjects() {
  const projects = await getFeaturedProjects();
  if (!projects.length) return null;
  const media = await getMediaByIds(projects.map((p) => p.image_media_id).filter((id): id is number => Boolean(id)));
  const large = projects.slice(0, 2);
  const compact = projects.slice(2, 4);

  return (
    <>
      <div className="feat-grid">
        {large.map((p) => {
          const rowMedia = p.image_media_id ? media.get(p.image_media_id) : null;
          const meta = CATS[p.category] || p.category;
          const desc = (p.description || '').split('\n')[0].slice(0, 160);
          return (
            <Link className="feat-card" href={`/project/${p.slug}`} key={p.id}>
              <figure>
                <Picture media={rowMedia} sizes="(max-width: 1023px) 100vw, 50vw" />
              </figure>
              <p className="mono feat-card__meta">
                <span>{meta}</span>
                <span>{p.year || ''}</span>
              </p>
              <h3>{p.title}</h3>
              {desc ? <p className="muted">{desc}</p> : null}
            </Link>
          );
        })}
      </div>
      {compact.length ? (
        <div className="feat-rows">
          {compact.map((p) => {
            let meta = CATS[p.category] || p.category;
            if (p.org) meta = `${meta} · ${p.org}`;
            return (
              <Link className="feat-row" href={`/project/${p.slug}`} key={p.id}>
                <h3>{p.title}</h3>
                <span>{meta}</span>
                <span className="mono">{p.year || ''} →</span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
