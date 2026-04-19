"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/apiClient"

type Role = {
  id: string
  name: string
  description?: string
}

type FormData = {
  name: string
  cpf: string
  email: string
  specialty: string
  active: boolean
  roleId: string
}

type FormErrors = Partial<Record<"name" | "email" | "specialty" | "roleId" | "cpf", string>>

const DEFAULT_AVATAR_SRC = "/images/default-user-avatar.svg"

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)

  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

// Valida o CPF pelo algoritmo dos dígitos verificadores
function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "")

  if (digits.length !== 11) return false

  // Rejeita sequências repetidas (ex: 000.000.000-00)
  if (/^(\d)\1{10}$/.test(digits)) return false

  const calcDigit = (slice: string, factor: number): number => {
    const sum = slice
      .split("")
      .reduce((acc, d, i) => acc + Number(d) * (factor - i), 0)
    const remainder = (sum * 10) % 11
    return remainder === 10 || remainder === 11 ? 0 : remainder
  }

  const first = calcDigit(digits.slice(0, 9), 10)
  const second = calcDigit(digits.slice(0, 10), 11)

  return first === Number(digits[9]) && second === Number(digits[10])
}

export default function FormRegisterBarber() {
  const router = useRouter()

  const [roles, setRoles] = useState<Role[]>([])
  const [rolesLoading, setRolesLoading] = useState(true)
  const [errors, setErrors] = useState<FormErrors>({})

  const [form, setForm] = useState<FormData>({
    name: "",
    cpf: "",
    email: "",
    specialty: "",
    active: true,
    roleId: "",
  })

  useEffect(() => {
    apiClient("/roles")
      .then((data) => {
        setRoles(data)

        const defaultRole = data.find((role: Role) => role.name === "Barbeiro") ?? data[0]

        if (!defaultRole) {
          return
        }

        setForm((prev) => ({ ...prev, roleId: defaultRole.id }))
        setErrors((prev) => {
          const next = { ...prev }
          delete next.roleId
          return next
        })
      })
      .catch(console.error)
      .finally(() => setRolesLoading(false))
  }, [])

  function clearFieldError(field: keyof FormErrors) {
    setErrors((prev) => {
      if (!prev[field]) {
        return prev
      }

      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function handleChange(field: keyof FormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))

    if (field === "name" || field === "email" || field === "specialty" || field === "roleId") {
      clearFieldError(field)
    }
  }

  function handleSelectRole(roleId: string) {
    setForm((prev) => ({
      ...prev,
      roleId,
    }))
    clearFieldError("roleId")
  }

  function validateForm() {
    const nextErrors: FormErrors = {}
    const email = form.email.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!form.name.trim()) {
      nextErrors.name = "Informe o nome completo."
    }

    if (!email) {
      nextErrors.email = "Informe o e-mail de acesso."
    } else if (!emailRegex.test(email)) {
      nextErrors.email = "Informe um e-mail válido."
    }

       if (!form.cpf.trim()) {
      nextErrors.cpf = "Informe o CPF."
    } else if (!isValidCpf(form.cpf)) {
      nextErrors.cpf = "Informe um CPF válido."
    }

    if (!form.specialty.trim()) {
      nextErrors.specialty = "Informe a especialidade do barbeiro."
    }

    if (!form.roleId) {
      nextErrors.roleId = "Selecione um perfil de acesso."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    console.log("Sending:", {
      ...form,
      photo: DEFAULT_AVATAR_SRC,
    })

    apiClient("/user", {
      method: "POST",
      body: JSON.stringify({...form}),
    })
      .then(() => {
        router.push("/barbers")
      })
      .catch((err) => {
        console.error(err)
        alert("Ocorreu um erro ao cadastrar o barbeiro. Tente novamente.")
      })

  }

  const fieldClassName = (hasError: boolean) =>
    `flex items-center gap-3 rounded-xl px-4 h-12 border ${
      hasError ? "border-red-400 bg-red-500/10" : "border-transparent bg-zinc-800"
    }`

  return (
    <form onSubmit={handleSubmit} className="min-h-full bg-zinc-950 flex flex-col max-w-sm mx-auto">
      <div className="flex items-center justify-between px-5 py-4">
        <button type="button" onClick={() => router.back()} className="text-zinc-400">
          ←
        </button>
        <h1 className="text-white font-medium text-base">Novo Barbeiro</h1>
        <div className="w-6" />
      </div>

      <div className="flex flex-col items-center gap-2 py-6">
        <div className="w-24 h-24 rounded-full border-2 border-amber-400/40 bg-zinc-900 overflow-hidden">
          <Image
            src={DEFAULT_AVATAR_SRC}
            alt="Default barber photo"
            width={96}
            height={96}
            className="w-full h-full object-cover"
            priority
          />
        </div>
        <span className="text-zinc-400 text-sm">Foto padrão aplicada automaticamente</span>
      </div>

      <div className="flex flex-col gap-6 px-5">
        <section>
          <p className="text-amber-400 text-xs font-medium mb-3">Dados Pessoais</p>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">Nome Completo</label>
              <div className={fieldClassName(Boolean(errors.name))}>
                <span className="text-amber-400">👤</span>
                <input
                  type="text"
                  placeholder="Ex: Rodrigo Silva"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  className="bg-transparent text-white text-sm outline-none w-full placeholder:text-zinc-500"
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
            </div>

            <div>
              <label className="text-zinc-400 text-xs mb-1 block">E-mail de Acesso</label>
              <div className={fieldClassName(Boolean(errors.email))}>
                <span className="text-amber-400">✉️</span>
                <input
                  type="email"
                  placeholder="rodrigo.silva@email.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  className="bg-transparent text-white text-sm outline-none w-full placeholder:text-zinc-500"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>
             <div>
              <label className="text-zinc-400 text-xs mb-1 block">CPF</label>
              <div className={fieldClassName(Boolean(errors.cpf))}>
                <span className="text-amber-400">🪪</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={(e) => handleChange("cpf", e.target.value)}
                  aria-invalid={Boolean(errors.cpf)}
                  maxLength={14}
                  className="bg-transparent text-white text-sm outline-none w-full placeholder:text-zinc-500"
                />
              </div>
              {errors.cpf && <p className="mt-1 text-xs text-red-400">{errors.cpf}</p>}
            </div>
          </div>
        </section>

        <section>
          <p className="text-amber-400 text-xs font-medium mb-3">Configurações</p>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">Especialidade</label>
              <div className={fieldClassName(Boolean(errors.specialty))}>
                <span className="text-amber-400">⭐</span>
                <input
                  type="text"
                  placeholder="Corte Masculino e Barba"
                  value={form.specialty}
                  onChange={(e) => handleChange("specialty", e.target.value)}
                  aria-invalid={Boolean(errors.specialty)}
                  className="bg-transparent text-white text-sm outline-none w-full placeholder:text-zinc-500"
                />
              </div>
              {errors.specialty && <p className="mt-1 text-xs text-red-400">{errors.specialty}</p>}
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-zinc-300 text-sm">Ativo para Agendamentos</span>
              <button
                type="button"
                onClick={() => handleChange("active", !form.active)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  form.active ? "bg-amber-400" : "bg-zinc-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${
                    form.active ? "right-0.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        <section>
          <p className="text-amber-400 text-xs font-medium mb-3">Acesso e Permissões</p>

          {rolesLoading ? (
            <div className="flex gap-2">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-7 w-24 rounded-full bg-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 mb-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleSelectRole(role.id)}
                  className={`px-5 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                    form.roleId === role.id
                      ? "bg-amber-400/20 border-amber-400 text-amber-400"
                      : "border-zinc-600 text-zinc-400 hover:border-zinc-400 hover:text-zinc-300"
                  }`}
                >
                  {role.name}
                </button>
              ))}
            </div>
          )}

          {errors.roleId && <p className="mt-1 text-xs text-red-400">{errors.roleId}</p>}
        </section>
      </div>

      <div className="mt-auto px-5 py-6">
        <button
          type="submit"
          className="w-full bg-amber-400 text-zinc-900 font-medium rounded-xl h-12 hover:bg-amber-300 transition-colors"
        >
          Adicionar à Equipe
        </button>
      </div>
    </form>
  )
}
