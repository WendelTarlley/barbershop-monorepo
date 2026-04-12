import GestaoCard from "@/components/GestãoCard";

const menuItems = [
  {
    icon: "👤",
    label: "Barbeiros",
    sub: "3 Profissionais",
    href: "/barber",
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

export default function Home() {
  return (
    <main className="flex items-center justify-center bg-zinc-950">
      <GestaoCard items={menuItems} />
    </main>
  );
}
