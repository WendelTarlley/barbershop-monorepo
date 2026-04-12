// components/barbeiros/FormNovoBarbeiro.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type FormData = {
  nome: string
  email: string
  especialidade: string
  ativo: boolean
  foto: File | null
}

export default function FormRegisterBarber() {
  const router = useRouter()

  const [form, setForm] = useState<FormData>({
    nome: "",
    email: "",
    especialidade: "",
    ativo: true,
    foto: null,
  })

  function handleChange(campo: keyof FormData, valor: string | boolean) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0] ?? null
    setForm((prev) => ({ ...prev, foto: arquivo }))
  }

  async function handleSubmit() {
    console.log("Enviando:", form)
    // aqui você chama sua API
    // await api.post("/barbeiros", form)
    router.push("/barbeiros")
  }

  return (
    <div className="min-h-full bg-zinc-950 flex flex-col max-w-sm mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <button onClick={() => router.back()} className="text-zinc-400">
          ← 
        </button>
        <h1 className="text-white font-medium text-base">Novo Barbeiro</h1>
        <div className="w-6" />
      </div>

      {/* Foto */}
      <div className="flex flex-col items-center gap-2 py-6">
        <label className="w-24 h-24 rounded-full border-2 border-dashed border-amber-400 flex items-center justify-center cursor-pointer">
          {form.foto ? (
            <img
              src={URL.createObjectURL(form.foto)}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-amber-400 text-3xl">+</span>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleFoto} />
        </label>
        <span className="text-zinc-400 text-sm">Adicionar Foto do Barbeiro</span>
      </div>

      <div className="flex flex-col gap-6 px-5">

        {/* Dados Pessoais */}
        <section>
          <p className="text-amber-400 text-xs font-medium mb-3">Dados Pessoais</p>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">Nome Completo</label>
              <div className="flex items-center gap-3 bg-zinc-800 rounded-xl px-4 h-12">
                <span className="text-amber-400">👤</span>
                <input
                  type="text"
                  placeholder="Ex: Rodrigo Silva"
                  value={form.nome}
                  onChange={(e) => handleChange("nome", e.target.value)}
                  className="bg-transparent text-white text-sm outline-none w-full placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div>
              <label className="text-zinc-400 text-xs mb-1 block">E-mail de Acesso</label>
              <div className="flex items-center gap-3 bg-zinc-800 rounded-xl px-4 h-12">
                <span className="text-amber-400">✉️</span>
                <input
                  type="email"
                  placeholder="rodrigo.silva@email.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="bg-transparent text-white text-sm outline-none w-full placeholder:text-zinc-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Configurações */}
        <section>
          <p className="text-amber-400 text-xs font-medium mb-3">Configurações</p>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">Especialidade</label>
              <div className="flex items-center gap-3 bg-zinc-800 rounded-xl px-4 h-12">
                <span className="text-amber-400">⭐</span>
                <input
                  type="text"
                  placeholder="Corte Masculino e Barba"
                  value={form.especialidade}
                  onChange={(e) => handleChange("especialidade", e.target.value)}
                  className="bg-transparent text-white text-sm outline-none w-full placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-zinc-300 text-sm">Ativo para Agendamentos</span>
              <button
                onClick={() => handleChange("ativo", !form.ativo)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  form.ativo ? "bg-amber-400" : "bg-zinc-600"
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${
                  form.ativo ? "right-0.5" : "left-0.5"
                }`} />
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* Botão */}
      <div className="mt-auto px-5 py-6">
        <button
          onClick={handleSubmit}
          className="w-full bg-amber-400 text-zinc-900 font-medium rounded-xl h-12 hover:bg-amber-300 transition-colors"
        >
          Adicionar à Equipe
        </button>
      </div>

    </div>
  )
}