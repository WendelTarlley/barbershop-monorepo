"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { apiFetch, saveCustomerTokens } from "@/lib/api"

type FieldErrors = {
  name?: string
  phone?: string
  email?: string
  password?: string
  api?: string
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function CustomerRegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  function validateForm() {
    const nextErrors: FieldErrors = {}

    if (!name.trim()) {
      nextErrors.name = "Informe seu nome."
    }

    if (!phone.trim()) {
      nextErrors.phone = "Informe seu telefone."
    }

    if (!validateEmail(email)) {
      nextErrors.email = "Informe um e-mail valido."
    }

    if (password.length < 6) {
      nextErrors.password = "A senha precisa ter pelo menos 6 caracteres."
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
      const data = await apiFetch("/customer-auth/register", {
        method: "POST",
        body: JSON.stringify({ name, phone, email, password }),
      })

      saveCustomerTokens(data.accessToken, data.refreshToken)
      router.push("/account")
    } catch (submitError) {
      setErrors({
        api:
          submitError instanceof Error
            ? submitError.message
            : "Nao foi possivel criar a conta.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="shell">
      <section className="page-card compact stack-lg">
        <div>
          <span className="eyebrow">Cadastro</span>
          <h1 className="title">Crie seu acesso antes do proximo corte.</h1>
          <p className="subtitle">
            O login do cliente fica separado da autenticacao interna da equipe,
            mas agora segue o mesmo padrao visual do produto.
          </p>
        </div>

        <form className="stack-md" onSubmit={handleSubmit}>
          <section className="section-card">
            <p className="section-label">Dados de acesso</p>

            <div className="form-grid">
              <div className="field-group">
                <label className="field-label" htmlFor="name">
                  Nome
                </label>
                <div className={`input-wrap ${errors.name ? "has-error" : ""}`}>
                  <input
                    className="field-input"
                    id="name"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>
                {errors.name ? <p className="field-error">{errors.name}</p> : null}
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="phone">
                  Telefone
                </label>
                <div className={`input-wrap ${errors.phone ? "has-error" : ""}`}>
                  <input
                    className="field-input"
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </div>
                {errors.phone ? <p className="field-error">{errors.phone}</p> : null}
              </div>

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
                <label className="field-label" htmlFor="password">
                  Senha
                </label>
                <div className={`input-wrap ${errors.password ? "has-error" : ""}`}>
                  <input
                    autoComplete="new-password"
                    className="field-input"
                    id="password"
                    placeholder="Minimo de 6 caracteres"
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
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <div className="actions-row">
          <Link className="secondary-btn" href="/auth/login">
            Ja tenho login
          </Link>
        </div>
      </section>
    </main>
  )
}
