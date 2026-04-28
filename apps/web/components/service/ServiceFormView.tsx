import { ServiceFormErrors, ServiceFormValues } from './types';

type ServiceFormViewProps = {
  title: string;
  description: string;
  submitLabel: string;
  values: ServiceFormValues;
  errors: ServiceFormErrors;
  isLoading?: boolean;
  isSubmitting?: boolean;
  statusMessage?: string | null;
  onBack: () => void;
  onChange: (
    field: keyof ServiceFormValues,
    value: string | boolean,
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function ServiceFormView({
  title,
  description,
  submitLabel,
  values,
  errors,
  isLoading = false,
  isSubmitting = false,
  statusMessage,
  onBack,
  onChange,
  onSubmit,
}: ServiceFormViewProps) {
  const fieldClassName = (hasError: boolean) =>
    `flex items-center gap-3 rounded-xl border px-4 h-12 ${
      hasError
        ? 'border-red-400 bg-red-500/10'
        : 'border-transparent bg-zinc-800'
    }`;

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto flex min-h-full max-w-sm flex-col bg-zinc-950"
    >
      <div className="flex items-center justify-between px-5 py-4">
        <button type="button" onClick={onBack} className="text-zinc-400">
          {'<'}
        </button>
        <h1 className="text-base font-medium text-white">{title}</h1>
        <div className="w-6" />
      </div>

      <div className="px-5 pb-4">
        <div className="rounded-2xl border border-amber-400/20 bg-zinc-900 px-4 py-4">
          <p className="text-sm font-medium text-amber-400">{description}</p>
          <p className="mt-1 text-xs text-zinc-400">
            Nome, preco e duracao sempre vinculados a unidade atual.
          </p>
        </div>
      </div>

      {statusMessage ? (
        <div className="px-5 pb-3">
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {statusMessage}
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-6 px-5">
        <section>
          <p className="mb-3 text-xs font-medium text-amber-400">
            Dados do servico
          </p>

          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-xs text-zinc-400">
                Nome do servico
              </label>
              <div className={fieldClassName(Boolean(errors.name))}>
                <input
                  type="text"
                  placeholder="Ex: Corte + barba"
                  value={values.name}
                  onChange={(event) => onChange('name', event.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                />
              </div>
              {errors.name ? (
                <p className="mt-1 text-xs text-red-400">{errors.name}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-xs text-zinc-400">
                Preco
              </label>
              <div className={fieldClassName(Boolean(errors.price))}>
                <span className="text-sm font-medium text-amber-400">R$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="45.00"
                  value={values.price}
                  onChange={(event) => onChange('price', event.target.value)}
                  aria-invalid={Boolean(errors.price)}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                />
              </div>
              {errors.price ? (
                <p className="mt-1 text-xs text-red-400">{errors.price}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-xs text-zinc-400">
                Duracao em minutos
              </label>
              <div className={fieldClassName(Boolean(errors.durationMinutes))}>
                <span className="text-xs font-medium uppercase text-amber-400">
                  min
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="30"
                  value={values.durationMinutes}
                  onChange={(event) =>
                    onChange('durationMinutes', event.target.value)
                  }
                  aria-invalid={Boolean(errors.durationMinutes)}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                />
              </div>
              {errors.durationMinutes ? (
                <p className="mt-1 text-xs text-red-400">
                  {errors.durationMinutes}
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-xs text-zinc-400">
                Descricao opcional
              </label>
              <div className="rounded-xl border border-transparent bg-zinc-800 px-4 py-3">
                <textarea
                  rows={4}
                  placeholder="Adicione detalhes rapidos para a equipe."
                  value={values.description}
                  onChange={(event) =>
                    onChange('description', event.target.value)
                  }
                  className="w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <p className="mb-3 text-xs font-medium text-amber-400">Status</p>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-300">Disponivel para agenda</span>
            <button
              type="button"
              onClick={() => onChange('active', !values.active)}
              className={`relative h-6 w-12 rounded-full transition-colors ${
                values.active ? 'bg-amber-400' : 'bg-zinc-600'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                  values.active ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </section>
      </div>

      {isLoading ? (
        <div className="px-5 pt-6 text-sm text-zinc-400">
          Carregando dados do servico...
        </div>
      ) : null}

      <div className="mt-auto px-5 py-6">
        <button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="h-12 w-full rounded-xl bg-amber-400 font-medium text-zinc-900 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-amber-400/60"
        >
          {isSubmitting ? 'Salvando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
