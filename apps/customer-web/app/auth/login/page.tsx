"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { apiFetch, saveCustomerTokens } from "@/lib/api"

type FieldErrors = {
  email?: string
  password?: string
  api?: string
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function CustomerLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  function validateForm() {
    const nextErrors: FieldErrors = {}

    if (!validateEmail(email)) {
      nextErrors.email = "Informe um e-mail valido."
    }

    if (password.length < 6) {
      nextErrors.password = "Informe uma senha com pelo menos 6 caracteres."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const data = await apiFetch("/customer-auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })

      saveCustomerTokens(data.accessToken, data.refreshToken)
      router.push("/account")
    } catch (submitError) {
      setErrors({
        api:
          submitError instanceof Error
            ? submitError.message
            : "Nao foi possivel entrar.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="shell">
      <section className="page-card compact stack-lg">
        <div>
          <span className="eyebrow">Acesso</span>
          <h1 className="title">Entre para acompanhar seu cadastro.</h1>
          <p className="subtitle">
            Use seu login de cliente para revisar os dados e seguir mais rapido
            nos proximos atendimentos.
          </p>
        </div>

        <form className="stack-md" onSubmit={handleSubmit}>
          <section className="section-card">
            <p className="section-label">Login do cliente</p>

            <div className="form-grid">
              <div className="field-group">
                <label className="field-label" htmlFor="email">
                  E-mail
                </label>
                <div className={`input-wrap ${errors.email ? "has-error" : ""}`}>
                  <input
                    autoComplete="email"
                    className="field-input"
                    id="email"
                    placeholder="voce@exemplo.com"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                {errors.email ? <p className="field-error">{errors.email}</p> : null}
              </div>

              <div className="field-group">
                <div className="label-row">
                  <label className="field-label" htmlFor="password">
                    Senha
                  </label>
                </div>
                <div className={`input-wrap ${errors.password ? "has-error" : ""}`}>
                  <input
                    autoComplete="current-password"
                    className="field-input"
                    id="password"
                    placeholder="Sua senha de acesso"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
                {errors.password ? (
                  <p className="field-error">{errors.password}</p>
                ) : null}
              </div>
            </div>
          </section>

          {errors.api ? <div className="error">{errors.api}</div> : null}

          <button className="primary-btn" disabled={loading} type="submit">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="actions-row">
          <Link className="secondary-btn" href="/auth/register">
            Criar conta
          </Link>
          <Link className="secondary-btn" href="/book">
            Seguir sem conta
          </Link>
        </div>
      </section>
    </main>
  )
}
