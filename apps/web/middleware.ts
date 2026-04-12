import { NextRequest, NextResponse } from "next/server";

// Rotas que NÃO precisam de autenticação
const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/magic-link",
  "/auth/set-password",
  "/auth/forgot-password",
];

// Rotas que exigem token TEMPORÁRIO (set-password)
const TEMP_TOKEN_ROUTES = ["/auth/set-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isTempRoute = TEMP_TOKEN_ROUTES.some((route) => pathname.startsWith(route));

  // Lê o token definitivo dos cookies
  // (você deve salvar o token em cookie HttpOnly no login — ver nota abaixo)
  const token = request.cookies.get("@barber:token")?.value;

  // ── Rota pública ──────────────────────────────────────────────────────────
  if (isPublic) {
    // Se já está logado e tenta acessar login, redireciona para dashboard
    if (token && !isTempRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // ── Rota protegida ────────────────────────────────────────────────────────
  if (!token || token === 'undefined') {
    const loginUrl = new URL("/auth/login", request.url);
    // Preserva a rota original para redirecionar após login
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware em todas as rotas EXCETO:
     * - _next/static  (arquivos estáticos)
     * - _next/image   (otimização de imagem)
     * - favicon.ico
     * - arquivos com extensão (ex: .png, .svg)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};