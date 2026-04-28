import GestaoCard from "@/components/GestãoCard"
import { BARBERSHOP_HEADER } from "@/lib/auth"
import { requireAuth } from "@/lib/serverAuth"

type HomeStats = {
  barbers: number
  services: number
}

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api"
}

function getBarbershopIdFromToken(token: string) {
  try {
    const [, payload = ""] = token.split(".")
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")
    const decodedPayload = Buffer.from(padded, "base64").toString("utf-8")
    const parsedPayload = JSON.parse(decodedPayload) as {
      barbershopId?: string
    }

    return parsedPayload.barbershopId ?? null
  } catch {
    return null
  }
}

async function getHomeStats(token: string): Promise<HomeStats> {
  const apiBaseUrl = getApiBaseUrl()
  const headers = new Headers({
    Authorization: `Bearer ${token}`,
  })
  const barbershopId = getBarbershopIdFromToken(token)

  if (barbershopId) {
    headers.set(BARBERSHOP_HEADER, barbershopId)
  }

  try {
    const [barbersResponse, servicesResponse] = await Promise.all([
      fetch(`${apiBaseUrl}/user/barbers`, {
        headers,
        cache: "no-store",
      }),
      fetch(`${apiBaseUrl}/barbershop-service`, {
        headers,
        cache: "no-store",
      }),
    ])

    const [barbers, services] = await Promise.all([
      barbersResponse.ok ? ((await barbersResponse.json()) as unknown[]) : [],
      servicesResponse.ok ? ((await servicesResponse.json()) as unknown[]) : [],
    ])

    return {
      barbers: barbers.length,
      services: services.length,
    }
  } catch {
    return {
      barbers: 0,
      services: 0,
    }
  }
}

export default async function Home() {
  const token = await requireAuth("/")
  const stats = await getHomeStats(token)

  const menuItems = [
    {
      icon: <BarbersIcon />,
      label: "Barbeiros",
      sub: `${stats.barbers} ${stats.barbers === 1 ? "Profissional" : "Profissionais"}`,
      href: "/barbers",
    },
    {
      icon: <ScissorsIcon />,
      label: "Servicos",
      sub: `${stats.services} ${stats.services === 1 ? "Opcao" : "Opcoes"}`,
      href: "/service",
    },
    {
      icon: <UsersIcon />,
      label: "Clientes",
      sub: "120 Registrados",
      href: "/clients",
    },
    {
      icon: <SettingsIcon />,
      label: "Configuracoes",
      sub: "Unidade Imperial",
      href: "/configuration",
    },
  ]

  return (
    <main className="flex items-center justify-center bg-zinc-950">
      <GestaoCard items={menuItems} />
    </main>
  )
}

function BarbersIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M4 19a5 5 0 0 1 10 0" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M14.5 19a4 4 0 0 1 5-3.87A4 4 0 0 1 21 19" />
    </svg>
  )
}

function ScissorsIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <path d="M20 4 8.12 15.88" />
      <path d="m14.5 14.5 5.5 5.5" />
      <path d="M8.12 8.12 12 12" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="3" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a3 3 0 0 1 0 5.74" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01A1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}
