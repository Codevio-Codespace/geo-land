export function slugify(title: string): string {
  const t = (title || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return (t.slice(0, 80) || 'project').replace(/^-+|-+$/g, '');
}
