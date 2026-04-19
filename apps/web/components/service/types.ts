export type ServiceRecord = {
  id: string;
  name: string;
  description?: string | null;
  durationMinutes: number;
  price: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ServiceFormValues = {
  name: string;
  description: string;
  durationMinutes: string;
  price: string;
  active: boolean;
};

export type ServiceFormErrors = Partial<
  Record<'name' | 'price' | 'durationMinutes', string>
>;
