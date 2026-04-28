import ServiceForm from '@/components/service/ServiceForm';

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ServiceForm mode="edit" serviceId={id} />;
}
