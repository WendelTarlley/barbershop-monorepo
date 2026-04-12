"use client"
import Link from "next/link"
import React from "react"

type ListaGenericaProps = {
  title: string
  total: number
  buttonLabel: string
  searchPlaceholder?: string
  onClick: () => void
  onSearch?: (text: string) => void
  children: React.ReactNode   
}

export default function GenericList({
  title: titulo,
  total,
  buttonLabel,
  onClick,
  children,
  onSearch,
  searchPlaceholder = "Buscar...",
}: ListaGenericaProps) {
  return (
    <div className="flex flex-col h-full bg-zinc-950 max-w-sm mx-auto relative">

      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-white font-semibold text-lg">{titulo}</h1>
        <p className="text-zinc-400 text-sm">{total} cadastrados</p>
      </div>

      {/* Busca */}
      {onSearch && (
        <div className="px-4 mb-4">
          <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-4 py-3">
            <span className="text-zinc-400">🔍</span>
            <input
              type="text"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch(e.target.value)}
              className="bg-transparent text-white text-sm outline-none w-full placeholder:text-zinc-500"
            />
          </div>
        </div>
      )}

      {children}

      {/* Botão fixo */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <button
          onClick={onClick}
          className="w-full flex items-center justify-center gap-2 bg-zinc-800 text-white rounded-xl py-4 hover:bg-zinc-700 transition-colors"
        >
          <span className="text-xl">+</span>
          <span className="text-sm font-medium">{buttonLabel}</span>
        </button>
      </div>

    </div>
  )
}