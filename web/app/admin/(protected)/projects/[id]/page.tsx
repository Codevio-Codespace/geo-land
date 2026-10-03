import { redirect } from 'next/navigation';
import { ProjectForm } from '@/components/admin/ProjectForm';
import { allMedia, projectById, projectImageIds } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) redirect('/admin/projects?err=Project+not+found');
  const project = await projectById(Number(id));
  if (!project) redirect('/admin/projects?err=Project+not+found');
  const [media, additionalIds] = await Promise.all([allMedia(), projectImageIds(project.id)]);

  return (
    <ProjectForm
      heading="Edit project"
      projectId={project.id}
      initial={{
        title: project.title,
        slug: project.slug,
        category: project.category,
        year: project.year ? String(project.year) : '',
        org: project.org || '',
        description: project.description || '',
        featured: project.featured,
        featured_rank: project.featured_rank,
        published: project.published,
        image_media_id: project.image_media_id,
        additional_ids: additionalIds,
      }}
      media={media}
    />
  );
}
