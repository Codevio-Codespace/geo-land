import Link from 'next/link';
import { Notice } from '@/components/admin/Notice';
import { saveMediaAltAction, uploadMediaAction } from '@/app/admin/actions';
import { allMedia, mediaUsage } from '@/lib/content';
import { mediaWidths } from '@/lib/render';

export const dynamic = 'force-dynamic';

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const { ok, err } = await searchParams;
  const media = await allMedia();
  const usages = await Promise.all(media.map((m) => mediaUsage(m.id)));

  return (
    <>
      <h1>Media</h1>
      <Notice ok={ok} err={err} />
      <form className="upload-form" action={uploadMediaAction} encType="multipart/form-data">
        <label htmlFor="files">Upload images</label>
        <input id="files" name="files" type="file" accept="image/jpeg,image/png,image/webp" multiple required />
        <input name="alt" type="text" placeholder="Alt text (applied to all uploaded images, optional)" maxLength={200} />
        <div className="field-hint">JPG, PNG or WebP — up to 20 MB each. The site generates its own sizes automatically.</div>
        <button className="btn btn--orange" type="submit">
          Upload
        </button>
      </form>

      <div className="media-grid">
        {media.length ? (
          media.map((m, i) => {
            const widths = mediaWidths(m);
            const w = widths.length ? widths[widths.length - 1] : m.width || 640;
            const refs = usages[i];
            const used = refs.length ? `used in: ${refs.join(', ')}` : 'not used yet';
            return (
              <div className="media-tile" key={m.id}>
                <img src={`${m.base}-${w}.jpg`} alt="" loading="lazy" decoding="async" />
                <div className="media-tile__meta">
                  <span className="mono">{m.original_name || m.base.split('/').pop()}</span>
                  <span className="mono muted">
                    {m.width}×{m.height} · {m.is_upload ? 'uploaded' : 'site image'}
                  </span>
                </div>
                <form className="media-tile__alt" action={saveMediaAltAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <label className="mono" htmlFor={`alt-${m.id}`}>
                    Alt text
                  </label>
                  <input id={`alt-${m.id}`} type="text" name="alt" defaultValue={m.alt || ''} maxLength={200} />
                  <button className="linkish" type="submit">
                    Save alt
                  </button>
                </form>
                <p className="mono muted media-tile__usage">{used}</p>
                <div className="media-tile__actions">
                  {refs.length ? null : (
                    <Link className="danger" href={`/admin/confirm?action=delete_media&id=${m.id}`}>
                      Delete
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="muted">No images yet.</p>
        )}
      </div>
    </>
  );
}
