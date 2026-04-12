type MenuItem = {
  icon: string
  label: string
  sub: string
  href: string
}

type GestaoCardProps = {
  title?: string
  items: MenuItem[]
}

export default function GestaoCard({ title = "Gestão da Barbearia", items }: GestaoCardProps) {
  return (
    <div className="bg-zinc-900 rounded-xl p-4 max-w-sm mx-auto">
      <h2 className="text-amber-400 font-semibold text-base mb-4">
       {title}
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="bg-zinc-800 rounded-xl p-5 flex flex-col items-center gap-2 hover:bg-zinc-700 transition-colors"
          >
            <span className="text-3xl">{item.icon}</span>
            <span className="text-amber-400 font-semibold text-sm text-center">
              {item.label}
            </span>
            <span className="text-zinc-400 text-xs text-center">{item.sub}</span>
          </a>
        ))}
      </div>
    </div>
  );
}