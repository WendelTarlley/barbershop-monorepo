import Link from "next/link"

export default function HomePage() {
  return (
    <main className="shell page-grid">
      <section className="page-card stack-lg">
        <div>
          <span className="eyebrow">Portal do cliente</span>
          <h1 className="title">Agende rapido e crie acesso so quando fizer sentido.</h1>
          <p className="subtitle">
            O primeiro contato continua leve, mas o fluxo agora fica dentro da
            mesma linguagem visual do produto principal.
          </p>
        </div>

        <div className="stack-md">
          <div className="info-box">
            <strong>Primeiro agendamento sem atrito</strong>
            <p>Nome e telefone sao suficientes para iniciar a reserva.</p>
          </div>
          <div className="info-box">
            <strong>Conta opcional</strong>
            <p>O cliente pode criar login antes ou depois para acompanhar o cadastro.</p>
          </div>
          <div className="info-box">
            <strong>Auth isolada da equipe</strong>
            <p>O acesso do cliente segue separado do painel interno da barbearia.</p>
          </div>
        </div>

        <div className="actions-row">
          <Link className="nav-link-primary" href="/book">
            Iniciar agendamento
          </Link>
          <Link className="nav-link" href="/auth/register">
            Criar conta
          </Link>
        </div>
      </section>

      <aside className="page-card stack-md">
        <span className="eyebrow">Fluxo</span>
        <div className="meta-list">
          <div className="meta-item">
            <strong>1. Entrada rapida</strong>
            Cliente informa dados minimos para nao perder conversao.
          </div>
          <div className="meta-item">
            <strong>2. Ativacao opcional</strong>
            O login pode ser criado durante ou depois do primeiro atendimento.
          </div>
          <div className="meta-item">
            <strong>3. Retorno com autenticacao propria</strong>
            As proximas consultas usam o fluxo `customer-auth`.
          </div>
        </div>
      </aside>
    </main>
  )
}
