import { NextRequest, NextResponse } from "next/server";

import {
  BARBERSHOP_HEADER,
  buildLoginRedirectUrl,
  getBarbershopIdFromToken,
  isValidAuthToken,
  TOKEN_COOKIE,
} from "./lib/auth";

const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/magic-link",
  "/auth/define-password",
  "/auth/forgot-password",
  "/auth/reset-password",
];

const TEMP_TOKEN_ROUTES = ["/auth/define-password", "/auth/reset-password"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isTempRoute = TEMP_TOKEN_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  if (isPublic) {
    if (isValidAuthToken(token) && !isTempRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  if (!isValidAuthToken(token)) {
    return NextResponse.redirect(
      new URL(buildLoginRedirectUrl(pathname), request.url),
    );
  }

  const requestHeaders = new Headers(request.headers);
  const barbershopId = getBarbershopIdFromToken(token);

  if (barbershopId) {
    requestHeaders.set(BARBERSHOP_HEADER, barbershopId);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
