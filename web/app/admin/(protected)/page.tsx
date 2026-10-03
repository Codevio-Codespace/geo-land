import Link from 'next/link';
import { Notice } from '@/components/admin/Notice';
import { dashboardCounts, recentActivity } from '@/lib/content';
import { formatTs } from '@/lib/admin-format';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const { ok, err } = await searchParams;
  const [counts, activity] = await Promise.all([dashboardCounts(), recentActivity(10)]);

  return (
    <>
      <h1>Dashboard</h1>
      <Notice ok={ok} err={err} />
      <div className="quick-actions">
        <Link className="btn btn--orange" href="/admin/projects/new">
          New project
        </Link>
        <Link className="btn btn--ghost" href="/admin/media">
          Upload images
        </Link>
      </div>

      <h2>Content</h2>
      <nav className="counts" aria-label="Content counts">
        <Link href="/admin/projects">
          <span className="n">{counts.projects}</span>
          <span className="mono">Projects</span>
        </Link>
        <Link href="/admin/projects?status=published">
          <span className="n">{counts.published}</span>
          <span className="mono">Published</span>
        </Link>
        <Link href="/admin/projects?status=draft">
          <span className="n">{counts.drafts}</span>
          <span className="mono">Drafts</span>
        </Link>
        <Link href="/admin/services">
          <span className="n">{counts.services}</span>
          <span className="mono">Services</span>
        </Link>
        <Link href="/admin/milestones">
          <span className="n">{counts.milestones}</span>
          <span className="mono">Milestones</span>
        </Link>
        <Link href="/admin/media">
          <span className="n">{counts.media}</span>
          <span className="mono">Images</span>
        </Link>
      </nav>

      <h2>Recent changes</h2>
      <table className="tbl">
        <thead>
          <tr>
            <th>When</th>
            <th>What</th>
            <th>By</th>
          </tr>
        </thead>
        <tbody>
          {activity.length ? (
            activity.map((row) => (
              <tr key={row.id}>
                <td className="mono">{formatTs(row.ts)}</td>
                <td>{row.summary}</td>
                <td className="muted">{row.actor}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="muted">
                Nothing yet — create your first project.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
