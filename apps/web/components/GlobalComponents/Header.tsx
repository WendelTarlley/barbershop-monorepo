// components/Header.tsx
"use client"

import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"

type HeaderProps = {
  unitName?: string
  userName?: string
  hasNotification?: boolean
}

export default function Header({
  unitName = "Imperial Unit",
  userName = "RS",
  hasNotification = true,
}: HeaderProps) {
  const router = useRouter()

  return (
    <header className="bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-5 py-4">

      {/* Logo + unit */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-400 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#1a1a1a">
            <path d="M12.5 3C9.46 3 7 5.46 7 8.5c0 1.75.81 3.3 2.07 4.35L3.05 18.88l1.06 1.06 6.05-6.05A5.45 5.45 0 0012.5 14c3.04 0 5.5-2.46 5.5-5.5S15.54 3 12.5 3zm0 9C10.01 12 8 9.99 8 7.5S10.01 3 12.5 3 17 5.01 17 7.5 14.99 12 12.5 12zm-5 4l-4 4 1 1 4-4-1-1z"/>
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-white text-sm font-medium leading-tight">BarberShop</span>
          <span className="text-zinc-500 text-xs">{unitName}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">

        {/* Notification bell */}
        <button
          onClick={() => router.push("/notifications")}
          className="relative w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center"
        >
          <Bell size={16} className="text-zinc-400" strokeWidth={2} />
          {hasNotification && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 border-2 border-zinc-900" />
          )}
        </button>

        {/* Avatar */}
        <button
          onClick={() => router.push("/profile")}
          className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-zinc-900 text-xs font-medium"
        >
          {userName}
        </button>

      </div>
    </header>
  )
}