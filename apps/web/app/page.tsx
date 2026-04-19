import GestaoCard from "@/components/GestãoCard";
import { requireAuth } from "@/lib/serverAuth";

const menuItems = [
  {
    icon: "👤",
    label: "Barbeiros",
    sub: "3 Profissionais",
    href: "/barbers",
  },
  {
    icon: "✂️",
    label: "Serviços",
    sub: "8 Opções",
    href: "/service",
  },
  {
    icon: "👥",
    label: "Clientes",
    sub: "120 Registrados",
    href: "/clients",
  },
  {
    icon: "⚙️",
    label: "Configurações",
    sub: "Unidade Imperial",
    href: "/configuration",
  },
];

export default async function Home() {
  await requireAuth("/");

  return (
    <main className="flex items-center justify-center bg-zinc-950">
      <GestaoCard items={menuItems} />
    </main>
  );
}

