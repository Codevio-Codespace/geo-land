export function formatTs(ts: string | null | undefined): string {
  if (!ts) return '';
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return ts;
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

export function formatDate(ts: string | null | undefined): string {
  return (ts || '').slice(0, 10);
}

export function mediaLabel(media: { alt: string; original_name: string; base: string }): string {
  return media.alt || media.original_name || media.base.split('/').pop() || '';
}
