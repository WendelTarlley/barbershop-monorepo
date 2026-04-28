import Link from 'next/link';

import { formatServicePrice } from './serviceFormUtils';
import { ServiceRecord } from './types';

type ServiceCardProps = {
  service: ServiceRecord;
  onDelete: (serviceId: string) => void;
};

export default function ServiceCard({
  service,
  onDelete,
}: ServiceCardProps) {
  return (
    <article className="rounded-2xl bg-zinc-800 p-4 shadow-sm shadow-black/20">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {service.name}
          </p>
          {service.description ? (
            <p className="mt-1 text-xs text-zinc-400">{service.description}</p>
          ) : (
            <p className="mt-1 text-xs text-zinc-500">
              Servico sem descricao complementar
            </p>
          )}
        </div>

        <span
          className={`rounded-full px-3 py-1 text-[11px] font-medium ${
            service.active
              ? 'bg-emerald-500/15 text-emerald-300'
              : 'bg-zinc-700 text-zinc-400'
          }`}
        >
          {service.active ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs text-zinc-500">
            {service.durationMinutes} min
          </p>
          <p className="text-base font-semibold text-amber-400">
            {formatServicePrice(service.price)}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/service/${service.id}/edit`}
            className="rounded-xl border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-100 transition-colors hover:border-zinc-400 hover:bg-zinc-700"
          >
            Editar
          </Link>
          <button
            type="button"
            onClick={() => onDelete(service.id)}
            className="rounded-xl border border-red-500/50 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10"
          >
            Excluir
          </button>
        </div>
      </div>
    </article>
  );
}
