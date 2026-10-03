import { getMediaByIds, getPublicProjects } from '@/lib/content';
import { mediaWidths } from '@/lib/render';
import { ProjectsExplorerClient, type ExplorerProject } from './ProjectsExplorerClient';

export async function ProjectsExplorer() {
  const projects = await getPublicProjects();
  const media = await getMediaByIds(
    projects.map((p) => p.image_media_id).filter((id): id is number => Boolean(id))
  );
  const rows: ExplorerProject[] = projects.map((p) => {
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
  return <ProjectsExplorerClient projects={rows} />;
}
