import Link from 'next/link';
import { getPublicServices } from '@/lib/content';

export async function ServicesIndex() {
  const services = await getPublicServices();
  return (
    <>
      {services.map((s, i) => (
        <Link className="svc-index__row" href={`/services#${s.anchor}`} key={s.id}>
          <span className="mono svc-index__index">{String(i + 1).padStart(2, '0')}</span>
          <span className="svc-index__name">{s.name}</span>
          <span className="svc-index__scope">{s.short_scope || s.deliverables || ''}</span>
          <span className="svc-index__arrow" aria-hidden="true">
            →
          </span>
        </Link>
      ))}
    </>
  );
}
