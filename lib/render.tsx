import type { MediaRow } from './db-types';

interface PictureProps {
  media: MediaRow | null | undefined;
  alt?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  className?: string;
}

export function mediaWidths(media: MediaRow | null | undefined): number[] {
  if (!media) return [];
  return (media.widths || '')
    .split(',')
    .map((w) => w.trim())
    .filter((w) => /^\d+$/.test(w))
    .map(Number);
}

export function largestWidth(media: MediaRow | null | undefined): number | null {
  const widths = mediaWidths(media).sort((a, b) => b - a);
  return widths.length ? widths[0] : null;
}

export function Picture({ media, alt, sizes = '100vw', loading = 'lazy', className }: PictureProps) {
  if (!media) return null;
  const widths = mediaWidths(media).sort((a, b) => b - a);
  if (!widths.length) return null;
  const webpSet = widths.map((w) => `${media.base}-${w}.webp ${w}w`).join(', ');
  const jpgSet = widths.map((w) => `${media.base}-${w}.jpg ${w}w`).join(', ');
  const largest = widths[0];
  const altText = alt !== undefined ? alt : media.alt || '';
  return (
    <picture>
      <source type="image/webp" srcSet={webpSet} sizes={sizes} />
      <img
        className={className}
        src={`${media.base}-${largest}.jpg`}
        srcSet={jpgSet}
        sizes={sizes}
        width={media.width || largest}
        height={media.height || largest}
        alt={altText}
        loading={loading}
        decoding="async"
      />
    </picture>
  );
}

export function paragraphs(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .trim()
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function splitLines(text: string | null | undefined): string[] {
  return (text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}
