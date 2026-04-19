import { requireAuth } from "@/lib/serverAuth";

export default async function BarberLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAuth("/barbers");

  return children;
}

