'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import GenericList from '@/components/GenericList';
import ServiceCard from '@/components/service/ServiceCard';
import { ServiceRecord } from '@/components/service/types';
import { apiClient } from '@/lib/apiClient';

export default function ServicePage() {
  const router = useRouter();
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function loadServices() {
    setIsLoading(true);

    try {
      const response = await apiClient('/barbershop-service');
      setServices(response);
      setStatusMessage(null);
    } catch (error) {
      console.error(error);
      setStatusMessage('Nao foi possivel carregar os servicos cadastrados.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  const filteredServices = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return services;
    }

    return services.filter((service) => {
      const content = `${service.name} ${service.description ?? ''}`.toLowerCase();
      return content.includes(normalizedSearch);
    });
  }, [search, services]);

  async function handleDelete(serviceId: string) {
    if (!window.confirm('Deseja excluir este servico?')) {
      return;
    }

    try {
      await apiClient(`/barbershop-service/${serviceId}`, {
        method: 'DELETE',
      });
      await loadServices();
    } catch (error) {
      console.error(error);
      setStatusMessage('Nao foi possivel excluir este servico.');
    }
  }

  return (
    <GenericList
      title="Servicos"
      total={services.length}
      buttonLabel="Adicionar servico"
      onClick={() => router.push('/service/register')}
      onSearch={setSearch}
      searchPlaceholder="Buscar servico..."
    >
      <div className="flex-1 overflow-y-auto px-4 pb-28">
        {statusMessage ? (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {statusMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl bg-zinc-800"
              />
            ))}
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="space-y-3">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/70 px-4 py-8 text-center">
            <p className="text-sm font-medium text-white">
              Nenhum servico encontrado
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Cadastre o primeiro servico ou ajuste a busca.
            </p>
          </div>
        )}
      </div>
    </GenericList>
  );
}
