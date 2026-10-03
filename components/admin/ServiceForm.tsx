'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { saveServiceAction } from '@/app/admin/actions';
import { ErrorBlock } from './Notice';
import { Thumb } from './Thumb';
import type { MediaRow } from '@/lib/db-types';

export function ServiceForm({
  heading,
  serviceId,
  initial,
  media,
}: {
  heading: string;
  serviceId?: number;
  initial: {
    name: string;
    anchor: string;
    short_scope: string;
    scope_items: string;
    scope_paragraph: string;
    deliverables: string;
    sort: number;
    published: number;
    image_media_id: number | null;
  };
  media: MediaRow[];
}) {
  const [state, action] = useActionState(saveServiceAction, {});
  const image = media.find((m) => m.id === initial.image_media_id) || null;

  return (
    <>
      <h1>{heading}</h1>
      <ErrorBlock errors={state.errors} />
      <form action={action} encType="multipart/form-data">
        <input type="hidden" name="id" value={serviceId || ''} />
        <div className="form-grid">
          <div>
            <div className="field">
              <label htmlFor="name">Service name</label>
              <input id="name" name="name" type="text" defaultValue={initial.name} maxLength={120} required />
            </div>
            <div className="field">
              <label htmlFor="anchor">Anchor</label>
              <input
                id="anchor"
                name="anchor"
                type="text"
                defaultValue={initial.anchor}
                maxLength={60}
                pattern="[a-z0-9\-]*"
              />
              <span className="field-hint">Used by links like /services#{initial.anchor || 'anchor'} — keep it short, lowercase.</span>
            </div>
            <div className="field">
              <label htmlFor="short_scope">One-line scope (home page + register)</label>
              <input
                id="short_scope"
                name="short_scope"
                type="text"
                defaultValue={initial.short_scope}
                maxLength={200}
              />
            </div>
            <div className="field">
              <label htmlFor="scope_items">Scope items</label>
              <textarea id="scope_items" name="scope_items" maxLength={2600} defaultValue={initial.scope_items}></textarea>
              <span className="field-hint">One item per line, max 12 — shown as the accordion list.</span>
            </div>
            <div className="field">
              <label htmlFor="scope_paragraph">Intro paragraph (used instead of the list when no items)</label>
              <textarea
                id="scope_paragraph"
                name="scope_paragraph"
                maxLength={1200}
                defaultValue={initial.scope_paragraph}
              ></textarea>
            </div>
            <div className="field">
              <label htmlFor="deliverables">Deliverables caption</label>
              <input
                id="deliverables"
                name="deliverables"
                type="text"
                defaultValue={initial.deliverables}
                maxLength={300}
              />
            </div>
          </div>
          <div>
            <div className="field">
              <span className="field-label">Service image</span>
              <div className="current-thumb">
                <Thumb media={image} />
              </div>
              <select name="image_media_id" defaultValue={initial.image_media_id ?? ''}>
                <option value="">— none —</option>
                {media.map((m) => (
                  <option value={m.id} key={m.id}>
                    {m.alt || m.original_name || m.base.split('/').pop()} {m.width ? `${m.width}×${m.height}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="image_upload">— or upload a new image</label>
              <input id="image_upload" name="image_upload" type="file" accept="image/jpeg,image/png,image/webp" />
            </div>
            <div className="field">
              <label htmlFor="sort">Order (lower shows first)</label>
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
          <Link className="btn btn--ghost" href="/admin/services">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
