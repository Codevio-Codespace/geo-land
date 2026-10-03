'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { saveProjectAction } from '@/app/admin/actions';
import { ErrorBlock } from './Notice';
import { Thumb, thumbSrc } from './Thumb';
import { CATS, type MediaRow } from '@/lib/db-types';

interface ProjectInitial {
  title: string;
  slug: string;
  category: string;
  year: string;
  org: string;
  description: string;
  featured: number;
  featured_rank: number;
  published: number;
  image_media_id: number | null;
  additional_ids: number[];
}

export function ProjectForm({
  heading,
  projectId,
  initial,
  media,
}: {
  heading: string;
  projectId?: number;
  initial: ProjectInitial;
  media: MediaRow[];
}) {
  const [state, action] = useActionState(saveProjectAction, {});
  const image = media.find((m) => m.id === initial.image_media_id) || null;

  return (
    <>
      <h1>{heading}</h1>
      <ErrorBlock errors={state.errors} />
      <form action={action} encType="multipart/form-data">
        <input type="hidden" name="id" value={projectId || ''} />
        <div className="form-grid">
          <div>
            <div className="field">
              <label htmlFor="title">Title</label>
              <input id="title" name="title" type="text" defaultValue={initial.title} maxLength={200} required />
            </div>
            <div className="field">
              <label htmlFor="slug">Web address (slug)</label>
              <input
                id="slug"
                name="slug"
                type="text"
                defaultValue={initial.slug}
                maxLength={80}
                pattern="[a-z0-9\-]*"
              />
              <span className="field-hint">
                Leave empty to generate from the title. The project page lives at /project/&lt;slug&gt;.
              </span>
            </div>
            <div className="field">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" defaultValue={initial.category} required>
                {Object.entries(CATS).map(([key, label]) => (
                  <option value={key} key={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="year">Year</label>
              <input id="year" name="year" type="number" min={1900} max={2100} defaultValue={initial.year || ''} />
            </div>
            <div className="field">
              <label htmlFor="org">Client / organization (optional)</label>
              <input id="org" name="org" type="text" defaultValue={initial.org} maxLength={120} />
            </div>
            <div className="field">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" maxLength={4000} defaultValue={initial.description}></textarea>
              <span className="field-hint">
                Plain text. Blank line starts a new paragraph. Links appear only in the register and project page.
              </span>
            </div>
          </div>
          <div>
            <div className="field">
              <span className="field-label">Main image (shown on cards and the project page)</span>
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
              <label htmlFor="image_upload">— or upload a new main image</label>
              <input id="image_upload" name="image_upload" type="file" accept="image/jpeg,image/png,image/webp" />
              <input name="image_alt" type="text" placeholder="Alt text (describe the photo)" maxLength={200} />
            </div>
            <div className="field">
              <span className="field-label">Additional images (project gallery)</span>
              <div className="media-picks">
                {media.length ? (
                  media.map((m) => (
                    <label className="media-pick" key={m.id}>
                      <input
                        type="checkbox"
                        name="additional_images"
                        value={m.id}
                        defaultChecked={initial.additional_ids.includes(m.id)}
                      />
                      <img src={thumbSrc(m)} alt="" loading="lazy" decoding="async" />
                      <span className="mono">{m.alt || m.original_name || m.base.split('/').pop()}</span>
                    </label>
                  ))
                ) : (
                  <p className="muted">No images uploaded yet.</p>
                )}
              </div>
              <label htmlFor="images_upload">— or upload more</label>
              <input
                id="images_upload"
                name="images_upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
              />
            </div>
            <div className="checkbox-row">
              <label>
                <input type="checkbox" name="featured" value="1" defaultChecked={Boolean(initial.featured)} /> Featured on
                the home page
              </label>
            </div>
            <div className="field">
              <label htmlFor="featured_rank">Featured order (1 first)</label>
              <input
                id="featured_rank"
                name="featured_rank"
                type="number"
                min={1}
                max={999}
                defaultValue={initial.featured_rank || 100}
              />
            </div>
            <div className="checkbox-row">
              <label>
                <input type="checkbox" name="published" value="1" defaultChecked={Boolean(initial.published)} /> Published
                on the website
              </label>
            </div>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn--orange" type="submit">
            Save
          </button>
          <Link className="btn btn--ghost" href="/admin/projects">
            Cancel
          </Link>
          {projectId ? (
            <Link className="danger" href={`/admin/confirm?action=delete_project&id=${projectId}`}>
              Delete this project
            </Link>
          ) : null}
          <span className="field-hint">
            Unchecked “Published” saves as draft — drafts never appear on the site.
          </span>
        </div>
      </form>
    </>
  );
}
