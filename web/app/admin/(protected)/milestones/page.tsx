import Link from 'next/link';
import { Notice } from '@/components/admin/Notice';
import { MilestoneForm } from '@/components/admin/MilestoneForm';
import { milestoneAction } from '@/app/admin/actions';
import { allMilestones, milestoneById } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function MilestonesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string; edit?: string }>;
}) {
  const { ok, err, edit } = await searchParams;
  const editing = edit && /^\d+$/.test(edit) ? await milestoneById(Number(edit)) : null;
  const milestones = await allMilestones();

  return (
    <>
      <h1>Milestones</h1>
      <Notice ok={ok} err={err} />
      <MilestoneForm
        heading={editing ? 'Edit milestone' : 'Add milestone'}
        milestoneId={editing?.id}
        initial={{
          year: editing ? String(editing.year) : '',
          text: editing?.text || '',
          sort: editing?.sort || 100,
          published: editing ? editing.published : 1,
        }}
        showCancel={Boolean(editing)}
      />
      <h2>All milestones</h2>
      <table className="tbl">
        <thead>
          <tr>
            <th>Year</th>
            <th>Entry</th>
            <th>Order</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {milestones.length ? (
            milestones.map((m) => (
              <tr key={m.id}>
                <td className="mono">{m.year}</td>
                <td>{m.text}</td>
                <td className="mono">{m.sort}</td>
                <td>
                  {m.published ? (
                    <span className="badge badge--live">Shown</span>
                  ) : (
                    <span className="badge badge--draft">Hidden</span>
                  )}
                </td>
                <td className="row-actions">
                  <Link href={`/admin/milestones?edit=${m.id}`}>Edit</Link>
                  <form action={milestoneAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="do" value={m.published ? 'unpublish' : 'publish'} />
                    <button className="linkish" type="submit">
                      {m.published ? 'Hide' : 'Show'}
                    </button>
                  </form>
                  <Link className="danger" href={`/admin/confirm?action=delete_milestone&id=${m.id}`}>
                    Delete
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="muted">
                No milestones yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
