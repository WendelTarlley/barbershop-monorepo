import { requireAuth } from '@/lib/serverAuth';

export default async function ScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth('/schedule');

  return children;
}
