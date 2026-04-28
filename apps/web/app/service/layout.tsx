import { requireAuth } from '@/lib/serverAuth';

export default async function ServiceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAuth('/service');

  return children;
}
