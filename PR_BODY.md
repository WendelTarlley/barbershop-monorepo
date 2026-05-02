## why

Este PR implementa o MVP da agenda de agendamentos no painel interno da barbearia (`apps/web`), com suporte backend em `apps/api` para leitura da agenda, consulta de disponibilidade e criação de agendamentos.

O objetivo foi colocar a agenda em funcionamento no fluxo de gestão interna, sem depender do `customer-web`, permitindo validar a experiência principal de:
- visualizar agendamentos por barbeiro
- alternar entre dia, semana e mês
- respeitar buffer entre atendimentos
- criar agendamentos a partir de um fluxo guiado

Também houve um ajuste de direção de UX durante a implementação para manter a tela aderente ao padrão do projeto, priorizando mobile first.

## how and what

### API

Foi criado um novo módulo `schedule` e ele foi registrado no `AppModule`.

Esse módulo passou a expor:
- `GET /schedule`
  - retorna a agenda da barbearia logada
  - organiza os dados por barbeiro
  - entrega visualizações compatíveis com `day`, `week` e `month`
  - inclui cliente, serviços, barbeiro e metadados de buffer
- `GET /schedule/booking-options`
  - retorna datas e horários disponíveis para um serviço
  - considera duração do serviço, buffer, bloqueios e agenda existente
- `GET /schedule/availability`
  - retorna os barbeiros disponíveis para um serviço em um horário específico
- `POST /schedule/appointments`
  - cria o agendamento
  - aceita nome e telefone do cliente diretamente no fluxo, criando o cliente inline quando necessário

A lógica de disponibilidade considera:
- duração do serviço
- buffer entre atendimentos
- bloqueios do barbeiro
- agendamentos já existentes
- vínculo `barbeiro x serviço` quando houver registro em `barber_service`

Para o MVP, foi mantido um fallback operacional:
- se não houver `WorkingDay`, assume `09:00` às `18:00`
- a janela de datas disponíveis cobre os próximos 14 dias
- os horários são gerados em intervalos de 30 minutos

### Web

Foi criada a rota autenticada `/schedule` no painel interno.

A tela passou a incluir:
- visualização inicial em `Dia`
- alternância entre `Dia`, `Semana` e `Mes`
- layout por barbeiro
- cards com cliente, serviço e barbeiro
- foto pequena do barbeiro no card
- buffer visual discreto
- exibição apenas de barbeiros com agendamento no período visível

Também foi adicionado um atalho `Schedule` na home do painel para facilitar o acesso.

### Fluxo de novo agendamento

O fluxo foi ajustado para seguir a ordem definida pelo produto:
1. escolher o serviço
2. escolher uma data disponível
3. escolher um horário disponível
4. visualizar os barbeiros disponíveis para aquele recorte
5. informar nome e telefone do cliente
6. confirmar o agendamento

Durante os ajustes, foram removidos comportamentos que fugiam da proposta inicial:
- não há mais carga inicial de clientes
- data e horário deixaram de ser inputs livres
- cliente é informado diretamente no final do fluxo

### Mobile first

A tela da agenda foi reestruturada para seguir melhor o padrão mobile first do projeto:
- header mais compacto
- CTA principal mais evidente
- controles reorganizados para telas pequenas
- modal de agendamento com comportamento próximo de bottom sheet
- ajustes para a área útil da tela ocupar corretamente o container vertical

### Ajustes complementares

Também foram feitos alguns acertos de comportamento:
- semana e mês passaram a iniciar a partir da data selecionada, em vez de voltar automaticamente para o início da semana ou para o grid completo do mês
- a exibição de horários foi corrigida para não deslocar horários selecionados como `09:00` para `06:00`, alinhando a renderização com o referencial UTC usado no fluxo atual
- foram adicionados `AGENTS.md` em camadas para consolidar padrões do monorepo, da API, do `web` e do `customer-web`

## comments

Validação executada:
- `apps/api`: `npx tsc --noEmit`
- `apps/api`: `npx eslint` nos arquivos do módulo `schedule`
- `apps/web`: `npx eslint app/schedule/page.tsx`

Observações:
- permanece apenas o warning conhecido do uso de `<img>` no avatar da agenda
- ainda não existe uma gestão visual completa de `WorkingDay`, `Availability` e vínculo `barbeiro x serviço`; o backend já respeita esses dados quando existirem, com fallback para o MVP quando não existirem
- o tratamento de timezone foi estabilizado para o fluxo atual, mas ainda vale uma revisão futura para modelar explicitamente o fuso da barbearia de ponta a ponta
