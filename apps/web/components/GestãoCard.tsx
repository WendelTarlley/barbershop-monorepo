import { ReactNode } from "react"

type MenuItem = {
  icon: ReactNode
  label: string
  sub: string
  href: string
}

type GestaoCardProps = {
  title?: string
  items: MenuItem[]
}

export default function GestaoCard({
  title = "Gestao da Barbearia",
  items,
}: GestaoCardProps) {
  return (
    <div className="mx-auto max-w-sm rounded-xl bg-zinc-900 p-4">
      <h2 className="mb-4 text-base font-semibold text-amber-400">
        {title}
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-2 rounded-xl bg-zinc-800 p-5 transition-colors hover:bg-zinc-700"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-amber-400">
              {item.icon}
            </span>
            <span className="text-center text-sm font-semibold text-amber-400">
              {item.label}
            </span>
            <span className="text-center text-xs text-zinc-400">
              {item.sub}
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
