'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { saveMilestoneAction } from '@/app/admin/actions';
import { ErrorBlock } from './Notice';

export function MilestoneForm({
  heading,
  milestoneId,
  initial,
  showCancel,
}: {
  heading: string;
  milestoneId?: number;
  initial: { year: string; text: string; sort: number; published: number };
  showCancel: boolean;
}) {
  const [state, action] = useActionState(saveMilestoneAction, {});
  return (
    <>
      <h2>{heading}</h2>
      <ErrorBlock errors={state.errors} />
      <form action={action}>
        <input type="hidden" name="id" value={milestoneId || ''} />
        <div className="form-grid">
          <div className="field">
            <label htmlFor="text">Entry</label>
            <textarea id="text" name="text" maxLength={500} defaultValue={initial.text} required></textarea>
            <span className="field-hint">The company timeline on the About page.</span>
          </div>
          <div>
            <div className="field">
              <label htmlFor="year">Year</label>
              <input id="year" name="year" type="number" min={1900} max={2100} defaultValue={initial.year} required />
            </div>
            <div className="field">
              <label htmlFor="sort">Order within the year</label>
              <input id="sort" name="sort" type="number" min={1} max={999} defaultValue={initial.sort || 100} />
            </div>
            <div className="checkbox-row">
              <label>
                <input type="checkbox" name="published" value="1" defaultChecked={Boolean(initial.published)} /> Shown on
                the website
              </label>
            </div>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn--orange" type="submit">
            Save
          </button>
          {showCancel ? (
            <Link className="btn btn--ghost" href="/admin/milestones">
              Cancel
            </Link>
          ) : null}
        </div>
      </form>
    </>
  );
}
