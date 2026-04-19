import { ServiceFormErrors, ServiceFormValues, ServiceRecord } from './types';

export const EMPTY_SERVICE_FORM_VALUES: ServiceFormValues = {
  name: '',
  description: '',
  durationMinutes: '',
  price: '',
  active: true,
};

export function validateServiceForm(
  values: ServiceFormValues,
): ServiceFormErrors {
  const errors: ServiceFormErrors = {};
  const duration = Number(values.durationMinutes);
  const price = Number(values.price);

  if (!values.name.trim()) {
    errors.name = 'Informe o nome do servico.';
  }

  if (!Number.isInteger(duration) || duration <= 0) {
    errors.durationMinutes = 'Informe uma duracao valida em minutos.';
  }

  if (!Number.isFinite(price) || price < 0) {
    errors.price = 'Informe um preco valido.';
  }

  return errors;
}

export function buildServicePayload(values: ServiceFormValues) {
  return {
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    durationMinutes: Number(values.durationMinutes),
    price: Number(values.price),
    active: values.active,
  };
}

export function getServiceFormValues(
  service: ServiceRecord,
): ServiceFormValues {
  return {
    name: service.name,
    description: service.description ?? '',
    durationMinutes: String(service.durationMinutes),
    price: String(service.price),
    active: service.active,
  };
}

export function formatServicePrice(price: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
}
