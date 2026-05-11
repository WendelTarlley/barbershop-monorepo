'use server';

import { api } from '../../apps/web/lib/apiClient';

type BarberApiItem = {
  id: string;
  name: string;
  specialty: string | null;
  photoUrl: string | null;
  active: boolean;
  roleId: string;
  barbershopId: string;
};

export type BarberListItem = {
  id: string;
  name: string;
  specialty: string | null;
  avatarUrl: string | null;
  active: boolean;
};

export type GetBarbersResult = {
  barbers: BarberListItem[];
  totalBarbers: number;
};

type GetBarbersOptions = {
  token?: string;
};

export async function getBarbers(
  options: GetBarbersOptions = {},
): Promise<GetBarbersResult> {
  const response = await api.get<BarberApiItem[]>('/user/barbers', {
    token: options.token,
  });

  const barbers = response.map((barber) => ({
    id: barber.id,
    name: barber.name,
    specialty: barber.specialty,
    avatarUrl: barber.photoUrl,
    active: barber.active,
  }));

  return {
    barbers,
    totalBarbers: barbers.length,
  };
}

