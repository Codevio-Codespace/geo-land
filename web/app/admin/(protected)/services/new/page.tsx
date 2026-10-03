import { ServiceForm } from '@/components/admin/ServiceForm';
import { allMedia } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function NewServicePage() {
  const media = await allMedia();
  return (
    <ServiceForm
      heading="New service"
      initial={{
        name: '',
        anchor: '',
        short_scope: '',
        scope_items: '',
        scope_paragraph: '',
        deliverables: '',
        sort: 100,
        published: 1,
        image_media_id: null,
      }}
      media={media}
    />
  );
}
