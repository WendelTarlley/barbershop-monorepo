"use client"

import { useEffect, useState } from "react"

import { apiFetch, clearCustomerTokens } from "@/lib/api"

type CustomerProfile = {
  id: string
  name: string
  phone: string
  email: string | null
  firstAccess: boolean
  active: boolean
}

export default function AccountPage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await apiFetch("/customer-auth/me", { auth: true })
        setProfile(data)
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Nao foi possivel carregar o perfil.",
        )
      }
    }

    void loadProfile()
  }, [])

  return (
    <main className="shell page-grid single">
      <section className="page-card compact stack-lg">
        <div>
          <span className="eyebrow">Minha conta</span>
          <h1 className="title">Perfil publico do cliente.</h1>
          <p className="subtitle">
            Esta tela tambem passa a seguir o mesmo padrao de cards e feedbacks
            usado no app principal.
          </p>
        </div>

        {profile ? (
          <div className="detail-list">
            <div className="detail-item">
              <strong>Nome</strong>
              {profile.name}
            </div>
            <div className="detail-item">
              <strong>Telefone</strong>
              {profile.phone}
            </div>
            <div className="detail-item">
              <strong>E-mail</strong>
              {profile.email ?? "Nao informado"}
            </div>
            <div className="detail-item">
              <strong>Status</strong>
              {profile.active ? "Ativo" : "Inativo"}
            </div>
          </div>
        ) : null}

        {!profile && !error ? (
          <div className="message">Carregando perfil do cliente...</div>
        ) : null}

        {error ? <div className="error">{error}</div> : null}

        <div className="actions-row">
          <button
            className="secondary-btn"
            onClick={() => {
              clearCustomerTokens()
              window.location.href = "/auth/login"
            }}
            type="button"
          >
            Sair
          </button>
        </div>
      </section>
    </main>
  )
}
