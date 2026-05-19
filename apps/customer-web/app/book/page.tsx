"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"

import { apiFetch } from "@/lib/api"

type Barbershop = {
  id: string
  name: string
  slug: string
  phone: string | null
  address: string | null
  active: boolean
}

type ServiceOption = {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  price: number
  active: boolean
}

type AvailableDateOption = {
  date: string
  label: string
}

type AvailableTimeOption = {
  value: string
  label: string
}

type AvailableBarberOption = {
  id: string
  name: string
  specialty: string | null
  photoUrl: string | null
}

type BookingOptionsResponse = {
  service: {
    id: string
    name: string
    durationMinutes: number
  }
  selectedDate: string
  dates: AvailableDateOption[]
  times: AvailableTimeOption[]
}

type AvailabilityResponse = {
  service: {
    id: string
    name: string
    durationMinutes: number
  }
  startDatetime: string
  endDatetime: string
  bufferMinutes: number
  barbers: AvailableBarberOption[]
}

type CustomerProfile = {
  id: string
  name: string
  phone: string
  email: string | null
}

type AppointmentResponse = {
  id: string
  startDatetime: string
  endDatetime: string
}

type BookingFormState = {
  customerName: string
  customerPhone: string
  customerEmail: string
  serviceId: string
  date: string
  time: string
  barberId: string
}

type BookingConfirmation = {
  barbershopName: string
  serviceName: string
  dateLabel: string
  timeLabel: string
  barberName: string
}

const INITIAL_FORM: BookingFormState = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  serviceId: "",
  date: "",
  time: "",
  barberId: "",
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function BookPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedSlug = searchParams.get("barbershop") ?? ""

  const [barbershops, setBarbershops] = useState<Barbershop[]>([])
  const [search, setSearch] = useState("")
  const [loadingBarbershops, setLoadingBarbershops] = useState(true)
  const [barbershopError, setBarbershopError] = useState<string | null>(null)
  const [locationState, setLocationState] = useState(
    "Ative sua localizacao para ajudar a encontrar uma unidade mais conveniente.",
  )

  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [profileStatus, setProfileStatus] = useState<"idle" | "loading" | "ready">("idle")

  const [services, setServices] = useState<ServiceOption[]>([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [servicesError, setServicesError] = useState<string | null>(null)

  const [availableDates, setAvailableDates] = useState<AvailableDateOption[]>([])
  const [availableTimes, setAvailableTimes] = useState<AvailableTimeOption[]>([])
  const [availableBarbers, setAvailableBarbers] = useState<AvailableBarberOption[]>([])
  const [loadingSchedule, setLoadingSchedule] = useState(false)
  const [scheduleError, setScheduleError] = useState<string | null>(null)
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)

  const [form, setForm] = useState<BookingFormState>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null)

  useEffect(() => {
    async function loadBarbershops() {
      try {
        const data = await apiFetch<Barbershop[]>("/barbershops")
        setBarbershops(Array.isArray(data) ? data.filter((item) => item.active) : [])
        setBarbershopError(null)
      } catch (loadError) {
        setBarbershopError(
          loadError instanceof Error
            ? loadError.message
            : "Nao foi possivel carregar as barbearias.",
        )
      } finally {
        setLoadingBarbershops(false)
      }
    }

    void loadBarbershops()
  }, [])

  useEffect(() => {
    async function loadProfile() {
      setProfileStatus("loading")

      try {
        const data = await apiFetch<CustomerProfile>("/customer-auth/me", {
          auth: true,
        })

        setProfile(data)
        setForm((current) => ({
          ...current,
          customerName: data.name,
          customerPhone: data.phone,
          customerEmail: data.email ?? "",
        }))
      } catch {
        setProfile(null)
      } finally {
        setProfileStatus("ready")
      }
    }

    void loadProfile()
  }, [])

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

  const selectedBarbershop = useMemo(
    () => barbershops.find((barbershop) => barbershop.slug === selectedSlug) ?? null,
    [barbershops, selectedSlug],
  )

  const selectedService = useMemo(
    () => services.find((service) => service.id === form.serviceId) ?? null,
    [services, form.serviceId],
  )

  const selectedDateOption = useMemo(
    () => availableDates.find((option) => option.date === form.date) ?? null,
    [availableDates, form.date],
  )

  const selectedBarber = useMemo(
    () => availableBarbers.find((barber) => barber.id === form.barberId) ?? null,
    [availableBarbers, form.barberId],
  )

  useEffect(() => {
    if (!selectedBarbershop) {
      setServices([])
      setAvailableDates([])
      setAvailableTimes([])
      setAvailableBarbers([])
      setServicesError(null)
      setScheduleError(null)
      setAvailabilityError(null)
      setForm((current) => ({
        ...current,
        serviceId: "",
        date: "",
        time: "",
        barberId: "",
      }))
      return
    }

    const barbershopId = selectedBarbershop.id

    async function loadServices() {
      setLoadingServices(true)

      try {
        const data = await apiFetch<ServiceOption[]>("/barbershop-service", {
          barbershopId,
        })

        const activeServices = data.filter((service) => service.active)
        setServices(activeServices)
        setServicesError(null)
        setForm((current) => ({
          ...current,
          serviceId: activeServices.some((service) => service.id === current.serviceId)
            ? current.serviceId
            : "",
          date: "",
          time: "",
          barberId: "",
        }))
      } catch (loadError) {
        setServices([])
        setServicesError(
          loadError instanceof Error
            ? loadError.message
            : "Nao foi possivel carregar os servicos dessa unidade.",
        )
      } finally {
        setLoadingServices(false)
      }
    }

    void loadServices()
  }, [selectedBarbershop])

  useEffect(() => {
    if (!selectedBarbershop || !form.serviceId) {
      setAvailableDates([])
      setAvailableTimes([])
      setAvailableBarbers([])
      setScheduleError(null)
      setAvailabilityError(null)
      setForm((current) => ({
        ...current,
        date: "",
        time: "",
        barberId: "",
      }))
      return
    }

    const barbershopId = selectedBarbershop.id

    async function loadBookingOptions() {
      setLoadingSchedule(true)

      try {
        const query = new URLSearchParams({ serviceId: form.serviceId })

        if (form.date) {
          query.set("date", form.date)
        }

        const data = await apiFetch<BookingOptionsResponse>(
          `/schedule/booking-options?${query.toString()}`,
          { barbershopId },
        )

        setAvailableDates(data.dates)
        setAvailableTimes(data.times)
        setScheduleError(null)
        setAvailabilityError(null)
        setForm((current) => ({
          ...current,
          date: data.selectedDate,
          time: data.times.some((option) => option.value === current.time)
            ? current.time
            : data.times[0]?.value ?? "",
          barberId: "",
        }))
      } catch (loadError) {
        setAvailableDates([])
        setAvailableTimes([])
        setAvailableBarbers([])
        setScheduleError(
          loadError instanceof Error
            ? loadError.message
            : "Nao foi possivel consultar datas e horarios.",
        )
      } finally {
        setLoadingSchedule(false)
      }
    }

    void loadBookingOptions()
  }, [form.serviceId, form.date, selectedBarbershop])

  useEffect(() => {
    if (!selectedBarbershop || !form.serviceId || !form.date || !form.time) {
      setAvailableBarbers([])
      setAvailabilityError(null)
      setForm((current) => ({
        ...current,
        barberId: "",
      }))
      return
    }

    const barbershopId = selectedBarbershop.id

    async function loadAvailability() {
      setLoadingAvailability(true)

      try {
        const query = new URLSearchParams({
          serviceId: form.serviceId,
          startDatetime: `${form.date}T${form.time}:00.000Z`,
        })

        const data = await apiFetch<AvailabilityResponse>(
          `/schedule/availability?${query.toString()}`,
          { barbershopId },
        )

        setAvailableBarbers(data.barbers)
        setAvailabilityError(null)
        setForm((current) => ({
          ...current,
          barberId: data.barbers.some((barber) => barber.id === current.barberId)
            ? current.barberId
            : data.barbers[0]?.id ?? "",
        }))
      } catch (loadError) {
        setAvailableBarbers([])
        setAvailabilityError(
          loadError instanceof Error
            ? loadError.message
            : "Nao foi possivel consultar os barbeiros disponiveis.",
        )
      } finally {
        setLoadingAvailability(false)
      }
    }

    void loadAvailability()
  }, [form.serviceId, form.date, form.time, selectedBarbershop])

  function handleDetectLocation() {
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

  function handleSelectBarbershop(slug: string) {
    setConfirmation(null)
    setSubmitError(null)
    router.replace(`/book?barbershop=${slug}`)
  }

  function handleFieldChange<Key extends keyof BookingFormState>(
    field: Key,
    value: BookingFormState[Key],
  ) {
    setSubmitError(null)
    setConfirmation(null)
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmitBooking() {
    if (!selectedBarbershop) {
      setSubmitError("Escolha uma unidade antes de continuar.")
      return
    }

    if (!form.serviceId || !form.date || !form.time || !form.barberId) {
      setSubmitError("Preencha servico, data, horario e barbeiro.")
      return
    }

    if (!profile) {
      if (!form.customerName.trim()) {
        setSubmitError("Informe seu nome para concluir o agendamento.")
        return
      }

      if (!form.customerPhone.trim()) {
        setSubmitError("Informe seu telefone para concluir o agendamento.")
        return
      }

      if (form.customerEmail.trim() && !isValidEmail(form.customerEmail.trim())) {
        setSubmitError("Informe um e-mail valido ou deixe esse campo em branco.")
        return
      }
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      await apiFetch<AppointmentResponse>("/schedule/appointments", {
        method: "POST",
        barbershopId: selectedBarbershop.id,
        body: JSON.stringify({
          customerId: profile?.id,
          customerName: profile ? undefined : form.customerName.trim(),
          customerPhone: profile ? undefined : form.customerPhone.trim(),
          customerEmail: profile ? profile.email ?? undefined : form.customerEmail.trim() || undefined,
          userId: form.barberId,
          serviceIds: [form.serviceId],
          startDatetime: `${form.date}T${form.time}:00.000Z`,
        }),
      })

      setConfirmation({
        barbershopName: selectedBarbershop.name,
        serviceName: selectedService?.name ?? "Servico selecionado",
        dateLabel: selectedDateOption?.label ?? form.date,
        timeLabel: form.time,
        barberName: selectedBarber?.name ?? "Barbeiro selecionado",
      })
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Nao foi possivel concluir o agendamento.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  const currentStep = selectedBarbershop
    ? form.serviceId
      ? form.date && form.time
        ? form.barberId
          ? 4
          : 3
        : 2
      : 1
    : 0

  return (
    <main className="shell page-grid">
      <section className="page-card stack-lg">
        <div>
          <span className="eyebrow">Agendamento guiado</span>
          <h1 className="title">Escolha a unidade e feche o horario sem atrito.</h1>
          <p className="subtitle">
            O fluxo agora continua da descoberta da barbearia ate a confirmacao do
            agendamento, com conta opcional e disponibilidade real da agenda.
          </p>
        </div>

        <div className="booking-steps">
          {[
            "Unidade",
            "Servico",
            "Horario",
            "Barbeiro",
            "Confirmacao",
          ].map((step, index) => (
            <div
              key={step}
              className={`booking-step ${currentStep >= index ? "is-active" : ""}`}
            >
              <span>{index + 1}</span>
              <strong>{step}</strong>
            </div>
          ))}
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

        {loadingBarbershops ? <div className="message">Carregando barbearias...</div> : null}
        {barbershopError ? <div className="error">{barbershopError}</div> : null}

        {!loadingBarbershops && !barbershopError ? (
          <div className="barbershop-list">
            {filteredBarbershops.length ? (
              filteredBarbershops.map((barbershop) => {
                const isSelected = barbershop.slug === selectedSlug

                return (
                  <article
                    key={barbershop.id}
                    className={`barbershop-card ${isSelected ? "is-selected" : ""}`}
                  >
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
                          <strong>Jornada</strong>
                          Escolha a unidade, o servico e veja horarios reais disponiveis.
                        </div>
                      </div>
                    </div>

                    <div className="actions-row">
                      <button
                        className={isSelected ? "nav-link-primary" : "secondary-btn"}
                        type="button"
                        onClick={() => handleSelectBarbershop(barbershop.slug)}
                      >
                        {isSelected ? "Unidade selecionada" : "Escolher unidade"}
                      </button>
                    </div>
                  </article>
                )
              })
            ) : (
              <div className="message">
                Nenhuma barbearia encontrada com esse filtro no momento.
              </div>
            )}
          </div>
        ) : null}

        {selectedBarbershop ? (
          <section className="section-card">
            <p className="section-label">Montar agendamento</p>

            <div className="stack-md">
              <div className="selected-summary">
                <strong>{selectedBarbershop.name}</strong>
                <span>
                  {selectedBarbershop.address ?? "Endereco ainda nao informado."}
                </span>
              </div>

              {loadingServices ? <div className="message">Carregando servicos...</div> : null}
              {servicesError ? <div className="error">{servicesError}</div> : null}

              <div className="form-grid booking-grid">
                <div className="field-group">
                  <label className="field-label" htmlFor="service">
                    Servico
                  </label>
                  <div className="input-wrap">
                    <select
                      id="service"
                      className="field-select"
                      value={form.serviceId}
                      onChange={(event) => handleFieldChange("serviceId", event.target.value)}
                    >
                      <option value="">Selecione um servico</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} • {service.durationMinutes} min • {formatCurrency(service.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedService ? (
                    <p className="muted">
                      {selectedService.description || "Servico pronto para entrar na agenda."}
                    </p>
                  ) : null}
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="date">
                    Data
                  </label>
                  <div className="input-wrap">
                    <select
                      id="date"
                      className="field-select"
                      value={form.date}
                      onChange={(event) => handleFieldChange("date", event.target.value)}
                      disabled={!form.serviceId || loadingSchedule}
                    >
                      <option value="">
                        {loadingSchedule ? "Carregando datas..." : "Selecione uma data"}
                      </option>
                      {availableDates.map((option) => (
                        <option key={option.date} value={option.date}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="time">
                    Horario
                  </label>
                  <div className="input-wrap">
                    <select
                      id="time"
                      className="field-select"
                      value={form.time}
                      onChange={(event) => handleFieldChange("time", event.target.value)}
                      disabled={!form.date || loadingSchedule}
                    >
                      <option value="">
                        {loadingSchedule ? "Carregando horarios..." : "Selecione um horario"}
                      </option>
                      {availableTimes.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="barber">
                    Barbeiro disponivel
                  </label>
                  <div className="input-wrap">
                    <select
                      id="barber"
                      className="field-select"
                      value={form.barberId}
                      onChange={(event) => handleFieldChange("barberId", event.target.value)}
                      disabled={!form.time || loadingAvailability}
                    >
                      <option value="">
                        {loadingAvailability ? "Carregando barbeiros..." : "Selecione um barbeiro"}
                      </option>
                      {availableBarbers.map((barber) => (
                        <option key={barber.id} value={barber.id}>
                          {barber.name}
                          {barber.specialty ? ` • ${barber.specialty}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {scheduleError ? <div className="error">{scheduleError}</div> : null}
              {availabilityError ? <div className="error">{availabilityError}</div> : null}
            </div>
          </section>
        ) : null}

        {selectedBarbershop ? (
          <section className="section-card">
            <p className="section-label">Dados do cliente</p>

            {profile ? (
              <div className="account-summary">
                <div className="info-box">
                  <strong>Voce esta usando sua conta</strong>
                  <p>
                    O agendamento sera vinculado ao cadastro de {profile.name}. Se
                    preferir outra pessoa, saia da conta e refaca o fluxo como visitante.
                  </p>
                </div>
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
                </div>
              </div>
            ) : (
              <div className="form-grid booking-grid">
                <div className="field-group">
                  <label className="field-label" htmlFor="customerName">
                    Nome
                  </label>
                  <div className="input-wrap">
                    <input
                      id="customerName"
                      className="field-input"
                      placeholder="Seu nome completo"
                      value={form.customerName}
                      onChange={(event) => handleFieldChange("customerName", event.target.value)}
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="customerPhone">
                    Telefone
                  </label>
                  <div className="input-wrap">
                    <input
                      id="customerPhone"
                      className="field-input"
                      placeholder="(11) 99999-9999"
                      value={form.customerPhone}
                      onChange={(event) => handleFieldChange("customerPhone", event.target.value)}
                    />
                  </div>
                </div>

                <div className="field-group booking-grid-full">
                  <label className="field-label" htmlFor="customerEmail">
                    E-mail opcional
                  </label>
                  <div className="input-wrap">
                    <input
                      id="customerEmail"
                      className="field-input"
                      placeholder="voce@exemplo.com"
                      type="email"
                      value={form.customerEmail}
                      onChange={(event) => handleFieldChange("customerEmail", event.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {profileStatus === "loading" ? (
              <p className="muted">Verificando se existe um cadastro conectado neste navegador...</p>
            ) : null}
          </section>
        ) : null}

        {submitError ? <div className="error">{submitError}</div> : null}

        {confirmation ? (
          <div className="success booking-success">
            <strong>Agendamento confirmado.</strong>
            <div>
              {confirmation.serviceName} em {confirmation.barbershopName}, {confirmation.dateLabel}{" "}
              as {confirmation.timeLabel}, com {confirmation.barberName}.
            </div>
          </div>
        ) : null}

        {selectedBarbershop ? (
          <button
            className="primary-btn"
            disabled={submitting || !form.barberId}
            type="button"
            onClick={() => void handleSubmitBooking()}
          >
            {submitting ? "Confirmando..." : "Confirmar agendamento"}
          </button>
        ) : null}
      </section>

      <aside className="page-card stack-md">
        <div className="info-box">
          <strong>Como funciona</strong>
          <p>
            Primeiro voce escolhe a unidade. Depois o app consulta servicos,
            horarios e barbeiros em tempo real antes de confirmar o atendimento.
          </p>
        </div>

        <div className="info-box">
          <strong>Conta opcional</strong>
          <p>
            Se quiser acompanhar seus proximos atendimentos mais rapido, voce pode
            entrar ou criar conta depois do primeiro agendamento.
          </p>
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

function BookPageFallback() {
  return (
    <main className="shell page-grid">
      <section className="page-card stack-lg">
        <div>
          <span className="eyebrow">Agendamento guiado</span>
          <h1 className="title">Escolha a unidade e feche o horario sem atrito.</h1>
          <p className="subtitle">
            Estamos carregando os dados da agenda para voce continuar.
          </p>
        </div>

        <div className="message">Carregando jornada de agendamento...</div>
      </section>

      <aside className="page-card stack-md">
        <div className="info-box">
          <strong>Conta opcional</strong>
          <p>Voce pode seguir como visitante e decidir depois se quer criar login.</p>
        </div>
      </aside>
    </main>
  )
}

export default function BookPage() {
  return (
    <Suspense fallback={<BookPageFallback />}>
      <BookPageContent />
    </Suspense>
  )
}
