import Link from "next/link";

type BarberCardProps = {
  barber: {
    id: string;
    name: string;
    specialty?: string;
    icone?: string;
  };
};

export default function BarberCard({ barber }: BarberCardProps) {
  return (
    <Link
      href={barber.id}
      className="flex items-center gap-4 rounded-xl bg-zinc-800 px-4 py-4 transition-colors hover:bg-zinc-700"
    >
      <div className="w-8 text-center text-2xl text-amber-400">{barber.icone}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{barber.name}</p>
        <p className="text-xs text-amber-400">{barber.specialty}</p>
      </div>
      <span className="text-zinc-400">{">"}</span>
    </Link>
  );
}
