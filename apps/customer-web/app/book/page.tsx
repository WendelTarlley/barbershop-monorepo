"use client"

import Link from "next/link"
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

export default function BookPage() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [createAccount, setCreateAccount] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [errors, setErrors] = useState<FieldErrors>({})

  function validateForm() {
    const nextErrors: FieldErrors = {}

    if (!name.trim()) {
      nextErrors.name = "Informe seu nome."
    }

    if (!phone.trim()) {
      nextErrors.phone = "Informe seu telefone."
    }

    if (email && !validateEmail(email)) {
      nextErrors.email = "Informe um e-mail valido."
    }

    if (createAccount) {
      if (!email) {
        nextErrors.email = "Informe um e-mail para criar a conta."
      } else if (!validateEmail(email)) {
        nextErrors.email = "Informe um e-mail valido."
      }

      if (password.length < 6) {
        nextErrors.password = "A senha precisa ter pelo menos 6 caracteres."
      }
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
    setMessage(null)
    setErrors({})

    try {
      if (createAccount) {
        const data = await apiFetch("/customer-auth/register", {
          method: "POST",
          body: JSON.stringify({ name, phone, email, password }),
        })

        saveCustomerTokens(data.accessToken, data.refreshToken)
        setMessage(
          "Conta criada. A proxima etapa e conectar este fluxo ao endpoint de appointment para concluir a reserva.",
        )
      } else {
        await apiFetch("/customers", {
          method: "POST",
          body: JSON.stringify({ name, phone, email: email || undefined }),
        })

        setMessage(
          "Cliente criado sem conta. O backend ja aceita nome e telefone para iniciar o agendamento.",
        )
      }
    } catch (submitError) {
      setErrors({
        api:
          submitError instanceof Error
            ? submitError.message
            : "Nao foi possivel continuar.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="shell page-grid">
      <section className="page-card stack-lg">
        <div>
          <span className="eyebrow">Agendamento</span>
          <h1 className="title">Comece sem conta e ative o acesso se quiser voltar depois.</h1>
          <p className="subtitle">
            O fluxo de entrada continua leve, mas agora usa o mesmo padrao de
            formularios do restante do produto.
          </p>
        </div>

        <form className="stack-md" onSubmit={handleSubmit}>
          <section className="section-card">
            <p className="section-label">Dados iniciais</p>

            <div className="form-grid">
              <div className="field-group">
                <label className="field-label" htmlFor="name">
                  Nome
                </label>
                <div className={`input-wrap ${errors.name ? "has-error" : ""}`}>
                  <input
                    className="field-input"
                    id="name"
                    placeholder="Seu nome"
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
                  E-mail opcional
                </label>
                <div className={`input-wrap ${errors.email ? "has-error" : ""}`}>
                  <input
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
            </div>
          </section>

          <section className="section-card">
            <p className="section-label">Conta opcional</p>

            <div className="stack-md">
              <label className="toggle-card">
                <input
                  checked={createAccount}
                  type="checkbox"
                  onChange={(event) => setCreateAccount(event.target.checked)}
                />
                <span>
                  <strong>Criar conta agora</strong>
                  <span>Ative um login de cliente para retornar mais rapido nas proximas reservas.</span>
                </span>
              </label>

              {createAccount ? (
                <div className="field-group">
                  <label className="field-label" htmlFor="password">
                    Senha
                  </label>
                  <div className={`input-wrap ${errors.password ? "has-error" : ""}`}>
                    <input
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
              ) : null}
            </div>
          </section>

          {message ? <div className="success">{message}</div> : null}
          {errors.api ? <div className="error">{errors.api}</div> : null}

          <button className="primary-btn" disabled={loading} type="submit">
            {loading ? "Salvando..." : "Continuar"}
          </button>
        </form>
      </section>

      <aside className="page-card stack-md">
        <span className="eyebrow">Atalhos</span>
        <div className="info-box">
          <strong>Ja tenho conta</strong>
          <p>Entre para consultar seus dados e pular a etapa de criacao de acesso.</p>
        </div>
        <div className="info-box">
          <strong>Perfil do cliente</strong>
          <p>Depois do login, o cliente pode revisar os dados salvos no portal.</p>
        </div>
        <div className="actions-row">
          <Link className="secondary-btn" href="/auth/login">
            Ja tenho conta
          </Link>
          <Link className="secondary-btn" href="/account">
            Ver meu perfil
          </Link>
        </div>
      </aside>
    </main>
  )
}
