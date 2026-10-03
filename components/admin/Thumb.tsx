import type { MediaRow } from '@/lib/db-types';
import { mediaWidths } from '@/lib/render';

export function Thumb({
  media,
  cls = 'thumb',
  alt = '',
}: {
  media: Pick<MediaRow, 'base' | 'widths' | 'width'> | null | undefined;
  cls?: string;
  alt?: string;
}) {
  if (!media) return <span className="thumb thumb--empty mono">no image</span>;
  const widths = mediaWidths(media as MediaRow);
  const w = widths.length ? widths[widths.length - 1] : media.width || 640;
  return <img className={cls} src={`${media.base}-${w}.jpg`} alt={alt} loading="lazy" decoding="async" />;
}

export function thumbSrc(media: Pick<MediaRow, 'base' | 'widths' | 'width'>): string {
  const widths = mediaWidths(media as MediaRow);
  const w = widths.length ? widths[widths.length - 1] : media.width || 640;
  return `${media.base}-${w}.jpg`;
}
