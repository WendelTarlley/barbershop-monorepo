import { renderToStaticMarkup } from 'react-dom/server';

import ServiceFormView from './ServiceFormView';
import { EMPTY_SERVICE_FORM_VALUES } from './serviceFormUtils';

describe('ServiceFormView', () => {
  it('renders values, title and submit label', () => {
    const markup = renderToStaticMarkup(
      <ServiceFormView
        title="Editar servico"
        description="Atualize o servico"
        submitLabel="Salvar alteracoes"
        values={{
          ...EMPTY_SERVICE_FORM_VALUES,
          name: 'Corte premium',
          price: '55',
          durationMinutes: '45',
          description: 'Lavagem inclusa',
        }}
        errors={{}}
        statusMessage="Servico cadastrado com sucesso."
        onBack={() => undefined}
        onChange={() => undefined}
        onSubmit={() => undefined}
      />,
    );

    expect(markup).toContain('Editar servico');
    expect(markup).toContain('Servico cadastrado com sucesso.');
    expect(markup).toContain('Corte premium');
    expect(markup).toContain('Salvar alteracoes');
  });

  it('renders validation messages when provided', () => {
    const markup = renderToStaticMarkup(
      <ServiceFormView
        title="Novo servico"
        description="Cadastre um servico"
        submitLabel="Salvar servico"
        values={EMPTY_SERVICE_FORM_VALUES}
        errors={{
          name: 'Informe o nome do servico.',
          price: 'Informe um preco valido.',
          durationMinutes: 'Informe uma duracao valida em minutos.',
        }}
        onBack={() => undefined}
        onChange={() => undefined}
        onSubmit={() => undefined}
      />,
    );

    expect(markup).toContain('Informe o nome do servico.');
    expect(markup).toContain('Informe um preco valido.');
    expect(markup).toContain('Informe uma duracao valida em minutos.');
  });
});
