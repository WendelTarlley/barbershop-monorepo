// components/Footer.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, Users, User } from "lucide-react"

const navItems = [
  { label: "Home",     href: "/",          icon: Home     },
  { label: "Schedule", href: "/schedule",  icon: Calendar },
  { label: "Barbers",  href: "/barbers",   icon: Users    },
  { label: "Profile",  href: "/profile",   icon: User     },
]

export default function Footer() {
  const pathname = usePathname()

  return (
    <footer className="bg-zinc-900 border-t border-zinc-800 flex justify-around items-center py-3 pb-6">
      {navItems.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href

        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1"
          >
            <Icon
              size={22}
              className={isActive ? "text-amber-400" : "text-zinc-500"}
              strokeWidth={2}
            />
            <span className={`text-xs ${isActive ? "text-amber-400" : "text-zinc-500"}`}>
              {label}
            </span>
          </Link>
        )
      })}
    </footer>
  )
}