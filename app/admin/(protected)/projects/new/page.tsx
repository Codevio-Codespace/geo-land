import { ProjectForm } from '@/components/admin/ProjectForm';
import { allMedia } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function NewProjectPage() {
  const media = await allMedia();
  return (
    <ProjectForm
      heading="New project"
      initial={{
        title: '',
        slug: '',
        category: 'gis-agri',
        year: '',
        org: '',
        description: '',
        featured: 0,
        featured_rank: 100,
        published: 0,
        image_media_id: null,
        additional_ids: [],
      }}
      media={media}
    />
  );
}
