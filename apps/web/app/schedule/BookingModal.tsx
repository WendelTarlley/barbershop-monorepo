'use client';

import { Avatar } from "./Avatar";
import { BookingFormValues, ServiceOption, AvailableDateOption, AvailableTimeOption, AvailableBarberOption } from "./schedule";
import { SelectField } from "./SelectField";



type BookingModalProps = {
  bookingForm: BookingFormValues;
  bookingMessage: string | null;
  services: ServiceOption[];
  availableDates: AvailableDateOption[];
  availableTimes: AvailableTimeOption[];
  availableBarbers: AvailableBarberOption[];
  isLoading: boolean;
  isDateOptionsLoading: boolean;
  isAvailabilityLoading: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onChange: (field: keyof BookingFormValues, value: string) => void;
  onSubmit: () => Promise<void>;
};

export function BookingModal({
  bookingForm,
  bookingMessage,
  services,
  availableDates,
  availableTimes,
  availableBarbers,
  isLoading,
  isDateOptionsLoading,
  isAvailabilityLoading,
  isSubmitting,
  onClose,
  onChange,
  onSubmit,
}: BookingModalProps) {
  const canSubmit =
    bookingForm.serviceId &&
    bookingForm.date &&
    bookingForm.time &&
    bookingForm.barberId &&
    bookingForm.customerName.trim() &&
    bookingForm.customerPhone.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:p-4 sm:items-center">
      <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] border border-zinc-800 bg-zinc-900 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:max-w-xl sm:rounded-[28px] sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-amber-400/80">
              Novo agendamento
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Realizar agendamento
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Use este formulario para testar a exibicao da agenda.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white"
          >
            Fechar
          </button>
        </div>

        {bookingMessage ? (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {bookingMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-5 space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-12 animate-pulse rounded-2xl bg-zinc-800" />
            ))}
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            {/* Etapa 1 — Servico */}
            <section className="grid gap-3 rounded-[24px] border border-zinc-800 bg-zinc-950/50 p-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-amber-400/80">Etapa 1</p>
                <h3 className="mt-1 text-sm font-semibold text-white">Escolha o servico</h3>
              </div>

              <label className="grid gap-2 text-sm">
                <span className="text-zinc-300">Servico</span>
                <select
                  value={bookingForm.serviceId}
                  onChange={(event) => onChange('serviceId', event.target.value)}
                  className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
                >
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} • {service.durationMinutes} min
                    </option>
                  ))}
                </select>
              </label>
            </section>

            {/* Etapa 2 — Data e horario */}
            <section className="grid gap-3 rounded-[24px] border border-zinc-800 bg-zinc-950/50 p-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-amber-400/80">Etapa 2</p>
                <h3 className="mt-1 text-sm font-semibold text-white">Defina data e horario</h3>
              </div>

              <div className="grid gap-3">
                <div className="grid gap-2 text-sm">
                  <span className="text-zinc-300">Datas disponiveis</span>
                  {isDateOptionsLoading ? (
                    <div className="h-12 animate-pulse rounded-2xl bg-zinc-800" />
                  ) : availableDates.length > 0 ? (
                    <SelectField
                      value={bookingForm.date}
                      onChange={(event) => onChange('date', event.target.value)}
                      options={availableDates.map((d) => ({ value: d.date, label: d.label }))}
                    />
                  ) : (
                    <EmptyOption label="Nenhuma data disponivel para este servico." />
                  )}
                </div>

                <div className="grid gap-2 text-sm">
                  <span className="text-zinc-300">Horarios disponiveis</span>
                  {isDateOptionsLoading ? (
                    <div className="h-12 animate-pulse rounded-2xl bg-zinc-800" />
                  ) : availableTimes.length > 0 ? (
                    <SelectField
                      value={bookingForm.time}
                      onChange={(event) => onChange('time', event.target.value)}
                      options={availableTimes.map((t) => ({ value: t.value, label: t.label }))}
                    />
                  ) : (
                    <EmptyOption label="Nenhum horario disponivel para a data selecionada." />
                  )}
                </div>
              </div>
            </section>

            {/* Etapa 3 — Barbeiro */}
            <section className="grid gap-3 rounded-[24px] border border-zinc-800 bg-zinc-950/50 p-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-amber-400/80">Etapa 3</p>
                <h3 className="mt-1 text-sm font-semibold text-white">
                  Escolha um barbeiro disponivel
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  A lista considera a duracao do servico e a agenda disponivel.
                </p>
              </div>

              {isAvailabilityLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((item) => (
                    <div key={item} className="h-16 animate-pulse rounded-2xl bg-zinc-800" />
                  ))}
                </div>
              ) : availableBarbers.length > 0 ? (
                <div className="grid gap-2">
                  {availableBarbers.map((barber) => {
                    const isSelected = barber.id === bookingForm.barberId;

                    return (
                      <button
                        key={barber.id}
                        type="button"
                        onClick={() => onChange('barberId', barber.id)}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                          isSelected
                            ? 'border-amber-400 bg-amber-400/10'
                            : 'border-zinc-700 bg-zinc-950 hover:border-zinc-500'
                        }`}
                      >
                        <Avatar photoUrl={barber.photoUrl} name={barber.name} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">{barber.name}</p>
                          <p className="truncate text-xs text-zinc-500">
                            {barber.specialty ?? 'Disponivel para o servico'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-800 px-4 py-6 text-center">
                  <p className="text-sm font-medium text-zinc-300">Nenhum barbeiro disponivel</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Ajuste o horario ou escolha outro servico para continuar.
                  </p>
                </div>
              )}
            </section>

            {/* Etapa 4 — Cliente */}
            <section className="grid gap-3 rounded-[24px] border border-zinc-800 bg-zinc-950/50 p-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-amber-400/80">Etapa 4</p>
                <h3 className="mt-1 text-sm font-semibold text-white">Identifique o cliente</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Para este fluxo inicial, basta nome e telefone.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm md:col-span-2">
                  <span className="text-zinc-300">Nome do cliente</span>
                  <input
                    value={bookingForm.customerName}
                    onChange={(event) => onChange('customerName', event.target.value)}
                    className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  <span className="text-zinc-300">Telefone</span>
                  <input
                    value={bookingForm.customerPhone}
                    onChange={(event) => onChange('customerPhone', event.target.value)}
                    className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  <span className="text-zinc-300">Email opcional</span>
                  <input
                    value={bookingForm.customerEmail}
                    onChange={(event) => onChange('customerEmail', event.target.value)}
                    className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
                  />
                </label>
              </div>
            </section>

            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting || !canSubmit}
              className="mt-2 rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Agendando...' : 'Confirmar agendamento'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyOption({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-800 px-4 py-6 text-center text-xs text-zinc-500">
      {label}
    </div>
  );
}
