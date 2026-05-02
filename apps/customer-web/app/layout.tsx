import "./globals.css"
import Link from "next/link"

export const metadata = {
  title: "Barbershop Customer Portal",
  description: "Portal externo para clientes agendarem sem conta ou com login.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="app-header">
          <div className="shell">
            <div className="topbar">
              <div className="brand">
                <div className="brand-mark">S</div>
                <div className="brand-copy">
                  <strong>Studio Schedule</strong>
                  <span>Reserva do cliente com acesso separado do painel interno.</span>
                </div>
              </div>

              <nav className="nav-links">
                <Link className="nav-link" href="/">
                  Inicio
                </Link>
                <Link className="nav-link" href="/book">
                  Agendar
                </Link>
                <Link className="nav-link-primary" href="/auth/login">
                  Entrar
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {children}
      </body>
    </html>
  )
}
