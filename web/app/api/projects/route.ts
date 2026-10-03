import { NextResponse } from 'next/server';
import { CATS } from '@/lib/db-types';
import { getMediaByIds, getPublicProjects } from '@/lib/content';
import { mediaWidths } from '@/lib/render';

export const revalidate = 60;

export async function GET() {
  const projects = await getPublicProjects();
  const media = await getMediaByIds(
    projects.map((p) => p.image_media_id).filter((id): id is number => Boolean(id))
  );
  const rows = projects.map((p) => {
    const m = p.image_media_id ? media.get(p.image_media_id) : null;
    let img = '';
    if (m) {
      const widths = mediaWidths(m);
      const w = widths.includes(900) ? 900 : widths.length ? Math.max(...widths) : null;
      img = w ? `${m.base}-${w}` : m.base;
    }
    return {
      id: p.slug,
      title: p.title,
      cat: p.category,
      year: p.year || '',
      org: p.org || '',
      desc: p.description || '',
      img,
    };
  });
  return NextResponse.json(
    { cats: CATS, projects: rows, count: rows.length },
    { headers: { 'Cache-Control': 'no-cache' } }
  );
}
