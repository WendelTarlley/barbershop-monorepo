'use server';

import { api } from '../../apps/web/lib/apiClient';
import type { ServiceRecord } from '../../apps/web/components/service/types';

export type GetServicesResult = {
  services: ServiceRecord[];
  totalServices: number;
};

type GetServicesOptions = {
  token?: string;
};

export async function getServices(
  options: GetServicesOptions = {},
): Promise<GetServicesResult> {
  const services = await api.get<ServiceRecord[]>('/barbershop-service', {
    token: options.token,
  });

  return {
    services,
    totalServices: services.length,
  };
}
