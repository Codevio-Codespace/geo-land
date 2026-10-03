import { getMediaByIds, getPublicServices } from '@/lib/content';
import { Picture, splitLines } from '@/lib/render';

export async function ServicesAccordion() {
  const services = await getPublicServices();
  const media = await getMediaByIds(
    services.map((s) => s.image_media_id).filter((id): id is number => Boolean(id))
  );

  return (
    <>
      {services.map((s, i) => {
        const photo = s.image_media_id ? media.get(s.image_media_id) : null;
        const items = splitLines(s.scope_items);
        const first = i === 0;
        const caption = s.deliverables || '';
        return (
          <article className={first ? 'svc is-open' : 'svc'} id={s.anchor} key={s.id}>
            <h3>
              <button
                className="svc__head"
                type="button"
                aria-expanded={first ? 'true' : 'false'}
                aria-controls={`svc-panel-${s.anchor}`}
              >
                <span className="mono svc__index">{String(i + 1).padStart(2, '0')}</span>
                <span className="svc__name">{s.name}</span>
                <span className="svc__chev" aria-hidden="true"></span>
              </button>
            </h3>
            <div className="svc-panel" id={`svc-panel-${s.anchor}`} role="region" aria-label={`${s.name} scope`}>
              <div className="svc-panel__inner">
                <div className="svc-panel__grid">
                  <div>
                    <h4>Scope</h4>
                    {items.length ? (
                      <>
                        <ul>
                          {items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                        {s.scope_paragraph ? <p className="muted svc-note">{s.scope_paragraph}</p> : null}
                      </>
                    ) : (
                      <p>{s.scope_paragraph || s.short_scope}</p>
                    )}
                  </div>
                  {photo ? (
                    <figure>
                      <Picture media={photo} sizes="(max-width: 1023px) 100vw, 40vw" />
                      {caption ? <figcaption>{caption}</figcaption> : null}
                    </figure>
                  ) : (
                    <figure>
                      <figcaption>{caption}</figcaption>
                    </figure>
                  )}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </>
  );
}
