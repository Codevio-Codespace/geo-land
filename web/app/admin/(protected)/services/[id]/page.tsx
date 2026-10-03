import { redirect } from 'next/navigation';
import { ServiceForm } from '@/components/admin/ServiceForm';
import { allMedia, serviceById } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) redirect('/admin/services?err=Service+not+found');
  const service = await serviceById(Number(id));
  if (!service) redirect('/admin/services?err=Service+not+found');
  const media = await allMedia();

  return (
    <ServiceForm
      heading="Edit service"
      serviceId={service.id}
      initial={{
        name: service.name,
        anchor: service.anchor,
        short_scope: service.short_scope || '',
        scope_items: service.scope_items || '',
        scope_paragraph: service.scope_paragraph || '',
        deliverables: service.deliverables || '',
        sort: service.sort,
        published: service.published,
        image_media_id: service.image_media_id,
      }}
      media={media}
    />
  );
}
