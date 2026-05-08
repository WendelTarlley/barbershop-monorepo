"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import { apiFetch } from "@/lib/api"

type Barbershop = {
  id: string
  name: string
  slug: string
  phone: string | null
  address: string | null
  active: boolean
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

export default function BookPage() {
  const searchParams = useSearchParams()
  const [barbershops, setBarbershops] = useState<Barbershop[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locationState, setLocationState] = useState<string>(
    "Ative sua localizacao para ajudar a encontrar uma unidade mais conveniente.",
  )

  useEffect(() => {
    async function loadBarbershops() {
      try {
        const data = await apiFetch("/barbershops")
        setBarbershops(Array.isArray(data) ? data : [])
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Nao foi possivel carregar as barbearias.",
        )
      } finally {
        setLoading(false)
      }
    }

    void loadBarbershops()
  }, [])

  async function handleDetectLocation() {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setLocationState("Seu navegador nao oferece localizacao neste dispositivo.")
      return
    }

    setLocationState("Detectando sua localizacao...")

    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationState(
          "Localizacao recebida. Assim que as unidades tiverem coordenadas cadastradas, a ordenacao por proximidade sera automatica.",
        )
      },
      () => {
        setLocationState(
          "Nao foi possivel usar sua localizacao. Voce ainda pode escolher pela lista abaixo.",
        )
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
      },
    )
  }

  const filteredBarbershops = useMemo(() => {
    const normalizedSearch = normalizeText(search.trim())

    if (!normalizedSearch) {
      return barbershops
    }

    return barbershops.filter((barbershop) => {
      const haystack = normalizeText(
        `${barbershop.name} ${barbershop.address ?? ""} ${barbershop.phone ?? ""}`,
      )

      return haystack.includes(normalizedSearch)
    })
  }, [barbershops, search])

  const selectedBarbershop = useMemo(() => {
    const selectedSlug = searchParams.get("barbershop")

    if (!selectedSlug) {
      return null
    }

    return (
      barbershops.find((barbershop) => barbershop.slug === selectedSlug) ?? null
    )
  }, [barbershops, searchParams])

  return (
    <main className="shell page-grid">
      <section className="page-card stack-lg">
        <div>
          <span className="eyebrow">Acesso sem conta</span>
          <h1 className="title">Entre como visitante e veja as barbearias disponiveis.</h1>
          <p className="subtitle">
            O login do cliente continua opcional. Primeiro escolha a unidade que
            faz sentido para voce e depois decida se quer criar acesso.
          </p>
        </div>

        <section className="section-card">
          <p className="section-label">Buscar unidade</p>

          <div className="stack-md">
            <div className="field-group">
              <label className="field-label" htmlFor="search">
                Nome, endereco ou telefone
              </label>
              <div className="input-wrap">
                <input
                  className="field-input"
                  id="search"
                  placeholder="Ex.: Centro, Paulista ou nome da barbearia"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="location-box">
              <div>
                <strong>Barbearias proximas</strong>
                <p>{locationState}</p>
              </div>
              <button className="secondary-btn" type="button" onClick={handleDetectLocation}>
                Usar localizacao
              </button>
            </div>
          </div>
        </section>

        {loading ? <div className="message">Carregando barbearias...</div> : null}
        {error ? <div className="error">{error}</div> : null}
        {selectedBarbershop ? (
          <div className="success">
            <strong>{selectedBarbershop.name}</strong>
            <div>
              Unidade escolhida para seguir como visitante. O proximo passo pode
              conectar essa escolha ao fluxo de agendamento.
            </div>
          </div>
        ) : null}

        {!loading && !error ? (
          <div className="barbershop-list">
            {filteredBarbershops.length ? (
              filteredBarbershops.map((barbershop) => (
                <article key={barbershop.id} className="barbershop-card">
                  <div className="stack-md">
                    <div>
                      <h2 className="card-title">{barbershop.name}</h2>
                      <p className="card-copy">
                        {barbershop.address ?? "Endereco ainda nao informado."}
                      </p>
                    </div>

                    <div className="meta-list compact">
                      <div className="meta-item">
                        <strong>Contato</strong>
                        {barbershop.phone ?? "Telefone indisponivel"}
                      </div>
                      <div className="meta-item">
                        <strong>Acesso</strong>
                        Atendimento disponivel sem criar conta
                      </div>
                    </div>
                  </div>

                  <div className="actions-row">
                    <Link className="nav-link-primary" href={`/book?barbershop=${barbershop.slug}`}>
                      Escolher unidade
                    </Link>
                    <Link className="nav-link" href="/auth/register">
                      Criar conta depois
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="message">
                Nenhuma barbearia encontrada com esse filtro no momento.
              </div>
            )}
          </div>
        ) : null}
      </section>

      <aside className="page-card stack-md">
        <div className="info-box">
          <strong>Acesso opcional</strong>
          <p>Escolha a unidade primeiro. A conta pode ser criada depois.</p>
        </div>
        <div className="actions-row">
          <Link className="secondary-btn" href="/auth/login">
            Ja tenho conta
          </Link>
          <Link className="secondary-btn" href="/auth/register">
            Criar conta
          </Link>
        </div>
      </aside>
    </main>
  )
}
