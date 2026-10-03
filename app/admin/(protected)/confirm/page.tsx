import Link from 'next/link';
import { deleteEntityAction } from '@/app/admin/actions';
import { milestoneById, projectById, allMedia } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; id?: string }>;
}) {
  const { action = '', id } = await searchParams;
  if (!id || !/^\d+$/.test(id)) {
    return (
      <>
        <h1>Item not found</h1>
        <p>
          <Link href="/admin/projects">Back to projects</Link>
        </p>
      </>
    );
  }
  const itemId = Number(id);
  let name = '';
  let details = '';
  let cancelTarget = '/admin/projects';

  if (action === 'delete_project') {
    const project = await projectById(itemId);
    if (project) {
      name = project.title;
      details = project.published ? 'Published on the site.' : 'Draft.';
    }
  } else if (action === 'delete_milestone') {
    const milestone = await milestoneById(itemId);
    if (milestone) {
      name = `${milestone.year} — ${milestone.text.slice(0, 60)}`;
      cancelTarget = '/admin/milestones';
    }
  } else if (action === 'delete_media') {
    const media = await allMedia();
    const row = media.find((m) => m.id === itemId);
    if (row) {
      name = row.original_name || row.base.split('/').pop() || '';
      cancelTarget = '/admin/media';
    }
  }

  if (!name) {
    return (
      <>
        <h1>Item not found</h1>
        <p>
          <Link href="/admin/projects">Back to projects</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1>Delete “{name}”?</h1>
      <p className="note">{details} This cannot be undone.</p>
      <form action={deleteEntityAction}>
        <input type="hidden" name="action" value={action} />
        <input type="hidden" name="id" value={itemId} />
        <input type="hidden" name="do" value="delete" />
        <div className="form-actions">
          <button className="btn" type="submit">
            Yes, delete permanently
          </button>
          <Link className="btn btn--ghost" href={cancelTarget}>
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
