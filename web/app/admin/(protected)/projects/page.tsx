import Link from 'next/link';
import { Notice } from '@/components/admin/Notice';
import { projectAction } from '@/app/admin/actions';
import { adminProjects } from '@/lib/content';
import { CATS } from '@/lib/db-types';
import { formatDate } from '@/lib/admin-format';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string; status?: string }>;
}) {
  const { ok, err, status } = await searchParams;
  const view = status === 'published' || status === 'draft' ? status : '';
  const projects = await adminProjects(view || undefined);

  return (
    <>
      <h1>Projects</h1>
      <Notice ok={ok} err={err} />
      <div className="filter-row">
        <Link href="/admin/projects" className={!view ? 'is-active' : undefined}>
          All
        </Link>
        <Link href="/admin/projects?status=published" className={view === 'published' ? 'is-active' : undefined}>
          Published
        </Link>
        <Link href="/admin/projects?status=draft" className={view === 'draft' ? 'is-active' : undefined}>
          Drafts
        </Link>
        <Link className="btn btn--orange btn--sm" href="/admin/projects/new">
          New project
        </Link>
      </div>
      <table className="tbl">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Year</th>
            <th></th>
            <th>Status</th>
            <th>Updated</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {projects.length ? (
            projects.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/admin/projects/${p.id}`}>{p.title}</Link>
                </td>
                <td className="muted">{CATS[p.category] || p.category}</td>
                <td className="mono">{p.year || ''}</td>
                <td>{p.featured ? <span className="mono" title="Featured">★</span> : null}</td>
                <td>
                  {p.published ? (
                    <span className="badge badge--live">Published</span>
                  ) : (
                    <span className="badge badge--draft">Draft</span>
                  )}
                </td>
                <td className="mono muted">{formatDate(p.updated_at)}</td>
                <td className="row-actions">
                  <Link href={`/admin/projects/${p.id}`}>Edit</Link>
                  <form action={projectAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="do" value={p.published ? 'unpublish' : 'publish'} />
                    <button className="linkish" type="submit">
                      {p.published ? 'Unpublish' : 'Publish'}
                    </button>
                  </form>
                  <Link className="danger" href={`/admin/confirm?action=delete_project&id=${p.id}`}>
                    Delete
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="muted">
                No projects in this view.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
