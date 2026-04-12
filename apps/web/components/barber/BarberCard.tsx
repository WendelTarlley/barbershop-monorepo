import Link from "next/link";

export default function BarberCard({ barbeiro }: { barbeiro: any }) {
  return (
    <Link
      key={barbeiro.id}
      href={barbeiro.href}
      className="flex items-center gap-4 bg-zinc-800 rounded-xl px-4 py-4 hover:bg-zinc-700 transition-colors"
    >
      <div className="text-amber-400 text-2xl w-8 text-center">
        {barbeiro.icone}
      </div>
      <div className="flex-1">
        <p className="text-white text-sm font-medium">{barbeiro.titulo}</p>
        <p className="text-amber-400 text-xs">{barbeiro.subtitulo}</p>
      </div>
      <span className="text-zinc-400">›</span>
    </Link>
  );
}