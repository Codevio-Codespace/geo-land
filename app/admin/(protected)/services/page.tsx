import Link from 'next/link';
import { Notice } from '@/components/admin/Notice';
import { allServices } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const { ok, err } = await searchParams;
  const services = await allServices();
  return (
    <>
      <h1>Services</h1>
      <Notice ok={ok} err={err} />
      <div className="filter-row">
        <Link className="btn btn--orange btn--sm" href="/admin/services/new">
          New service
        </Link>
      </div>
      <p className="note">
        Services keep their anchor (#gis, #surveying…) because the site links to them. Hide a service instead of deleting
        it.
      </p>
      <table className="tbl">
        <thead>
          <tr>
            <th>Service</th>
            <th>Anchor</th>
            <th>Order</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {services.length ? (
            services.map((s) => (
              <tr key={s.id}>
                <td>
                  <Link href={`/admin/services/${s.id}`}>{s.name}</Link>
                </td>
                <td className="mono muted">#{s.anchor}</td>
                <td className="mono">{s.sort}</td>
                <td>
                  {s.published ? (
                    <span className="badge badge--live">Shown</span>
                  ) : (
                    <span className="badge badge--draft">Hidden</span>
                  )}
                </td>
                <td className="row-actions">
                  <Link href={`/admin/services/${s.id}`}>Edit</Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="muted">
                No services.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
