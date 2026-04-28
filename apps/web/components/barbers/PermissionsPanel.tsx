// components/barbeiros/PermissionsPanel.tsx
"use client"

import { apiClient } from "@/lib/apiClient"
import { useEffect, useState } from "react"

// ── Tipos ────────────────────────────────────────────────────────────────────

type Permission = {
  id: string
  key: string
  module: string
  description: string
}

type PermissionState = "on-role" | "on-custom" | "revoked" | "off"

type Props = {
  roleId: string
  overrides: Record<string, boolean> // permissionId -> granted
  onChange: (overrides: Record<string, boolean>) => void
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const MODULE_LABELS: Record<string, string> = {
  schedule:   "Agenda",
  clients:    "Clientes",
  services:   "Serviços",
  barbers:    "Barbeiros",
  financials: "Financeiro",
}

function getState(
  permId: string,
  rolePermIds: Set<string>,
  overrides: Record<string, boolean>
): PermissionState {
  const fromRole = rolePermIds.has(permId)

  if (permId in overrides) {
    if (overrides[permId] === true)  return "on-custom"
    if (overrides[permId] === false) return fromRole ? "revoked" : "off"
  }

  return fromRole ? "on-role" : "off"
}

function nextState(
  permId: string,
  rolePermIds: Set<string>,
  overrides: Record<string, boolean>
): Record<string, boolean> {
  const current  = getState(permId, rolePermIds, overrides)
  const fromRole = rolePermIds.has(permId)
  const next     = { ...overrides }

  if (current === "on-role")    next[permId] = false        // revoga
  else if (current === "revoked") delete next[permId]       // restaura
  else if (current === "off")   next[permId] = true         // força on
  else if (current === "on-custom") delete next[permId]     // remove override

  return next
}

function groupByModule(permissions: Permission[]) {
  return permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    if (!acc[p.module]) acc[p.module] = []
    acc[p.module].push(p)
    return acc
  }, {})
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function StateBadge({ state }: { state: PermissionState }) {
  if (state === "on-role")
    return (
      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-900/30 text-green-400">
        role
      </span>
    )
  if (state === "on-custom")
    return (
      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-900/40 text-blue-400">
        override
      </span>
    )
  if (state === "revoked")
    return (
      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-900/30 text-red-400">
        revogado
      </span>
    )
  return null
}

function PermToggle({
  state,
  onToggle,
}: {
  state: PermissionState
  onToggle: () => void
}) {
  const isOn = state === "on-role" || state === "on-custom"

  const trackColor =
    state === "on-role"
      ? "bg-green-500/40"
      : state === "on-custom"
      ? "bg-amber-400"
      : state === "revoked"
      ? "bg-red-500/40"
      : "bg-zinc-600"

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative w-8 h-[18px] rounded-full transition-colors ${trackColor}`}
    >
      <span
        className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all ${
          isOn ? "right-0.5" : "left-0.5"
        }`}
      />
    </button>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function PermissionsPanel({ roleId, overrides, onChange }: Props) {
  const [allPermissions, setAllPermissions]   = useState<Permission[]>([])
  const [rolePermIds, setRolePermIds]         = useState<Set<string>>(new Set())
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState<string | null>(null)

  // Busca permissões do role selecionado
  useEffect(() => {
    if (!roleId) return

    setLoading(true)
    setError(null)

    apiClient(`/roles/${roleId}/permissions`)
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar permissões")
        return res.json()
      })
      .then((data: { allPermissions: Permission[]; rolePermissionIds: string[] }) => {
        setAllPermissions(data.allPermissions)
        setRolePermIds(new Set(data.rolePermissionIds))
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [roleId])

  function handleToggle(permId: string) {
    onChange(nextState(permId, rolePermIds, overrides))
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading)
    return (
      <div className="mt-2 bg-zinc-900 rounded-xl px-4 py-6 flex items-center justify-center">
        <span className="text-zinc-500 text-xs">Carregando permissões...</span>
      </div>
    )

  if (error)
    return (
      <div className="mt-2 bg-zinc-900 rounded-xl px-4 py-4">
        <span className="text-red-400 text-xs">{error}</span>
      </div>
    )

  if (allPermissions.length === 0) return null

  const grouped = groupByModule(allPermissions)

  return (
    <div className="mt-2 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">

      {/* Legenda */}
      <div className="flex gap-4 px-4 py-3 border-b border-zinc-800 flex-wrap">
        <LegendItem color="bg-green-500/40"  label="herdado do role" />
        <LegendItem color="bg-amber-400"     label="override ativo"  />
        <LegendItem color="bg-red-500/40"    label="revogado"        />
        <LegendItem color="bg-zinc-600"      label="inativo"         />
      </div>

      {/* Permissões por módulo */}
      {Object.entries(grouped).map(([module, perms]) => (
        <div key={module}>
          <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-widest px-4 pt-3 pb-1">
            {MODULE_LABELS[module] ?? module}
          </p>

          {perms.map((perm, i) => {
            const state = getState(perm.id, rolePermIds, overrides)
            return (
              <div
                key={perm.id}
                className={`flex items-center justify-between px-4 py-2.5 ${
                  i < perms.length - 1 ? "border-b border-zinc-800/60" : ""
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-zinc-300 text-[11px] font-mono">{perm.key}</span>
                  <span className="text-zinc-500 text-[10px]">{perm.description}</span>
                </div>

                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <StateBadge state={state} />
                  <PermToggle state={state} onToggle={() => handleToggle(perm.id)} />
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-[10px] text-zinc-500">{label}</span>
    </div>
  )
}