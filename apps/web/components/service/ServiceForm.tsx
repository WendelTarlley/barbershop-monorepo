'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { apiClient } from '@/lib/apiClient';

import ServiceFormView from './ServiceFormView';
import {
  buildServicePayload,
  EMPTY_SERVICE_FORM_VALUES,
  getServiceFormValues,
  validateServiceForm,
} from './serviceFormUtils';
import { ServiceFormErrors, ServiceFormValues, ServiceRecord } from './types';

type ServiceFormProps = {
  mode: 'create' | 'edit';
  serviceId?: string;
};

export default function ServiceForm({ mode, serviceId }: ServiceFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [values, setValues] = useState<ServiceFormValues>(
    EMPTY_SERVICE_FORM_VALUES,
  );
  const [errors, setErrors] = useState<ServiceFormErrors>({});
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(
    mode === 'edit' && searchParams.get('created') === '1'
      ? 'Servico cadastrado. Agora voce pode revisar e ajustar os dados.'
      : null,
  );

  useEffect(() => {
    if (mode !== 'edit' || !serviceId) {
      return;
    }

    let isMounted = true;

    setIsLoading(true);

    apiClient(`/barbershop-service/${serviceId}`)
      .then((service: ServiceRecord) => {
        if (!isMounted) {
          return;
        }

        setValues(getServiceFormValues(service));
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setStatusMessage('Nao foi possivel carregar este servico.');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [mode, serviceId]);

  function handleChange(
    field: keyof ServiceFormValues,
    value: string | boolean,
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    if (field === 'name' || field === 'price' || field === 'durationMinutes') {
      setErrors((currentErrors) => {
        if (!currentErrors[field]) {
          return currentErrors;
        }

        const nextErrors = { ...currentErrors };
        delete nextErrors[field];
        return nextErrors;
      });
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateServiceForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const payload = buildServicePayload(values);

      if (mode === 'create') {
        const createdService = await apiClient('/barbershop-service', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        router.push(`/service/${createdService.id}/edit?created=1`);
        return;
      }

      await apiClient(`/barbershop-service/${serviceId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      router.push('/service');
      router.refresh();
    } catch (error) {
      console.error(error);
      setStatusMessage('Nao foi possivel salvar o servico. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ServiceFormView
      title={mode === 'create' ? 'Novo servico' : 'Editar servico'}
      description={
        mode === 'create'
          ? 'Cadastre um novo servico para a barbearia.'
          : 'Atualize as informacoes do servico selecionado.'
      }
      submitLabel={mode === 'create' ? 'Salvar servico' : 'Salvar alteracoes'}
      values={values}
      errors={errors}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      statusMessage={statusMessage}
      onBack={() => router.back()}
      onChange={handleChange}
      onSubmit={handleSubmit}
    />
  );
}
