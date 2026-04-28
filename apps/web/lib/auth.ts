export const TOKEN_COOKIE = "@barber:token";
export const REFRESH_TOKEN_COOKIE = "@barber:refreshToken";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
export const BARBERSHOP_HEADER = "X-Barbershop-Id";

export function isValidAuthToken(token?: string | null): token is string {
  return Boolean(token && token !== "undefined" && token !== "null");
}

export function buildLoginRedirectUrl(pathname: string) {
  return `/auth/login?redirect=${encodeURIComponent(pathname)}`;
}

function getCookieValue(cookieSource: string, name: string): string | null {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = cookieSource.match(
    new RegExp(`(?:^|; )${escapedName}=([^;]+)`),
  );

  return match ? decodeURIComponent(match[1]) : null;
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  return atob(padded);
}

export function getBrowserAuthToken(): string | null {
  if (typeof document !== "undefined") {
    const tokenFromCookie = getCookieValue(document.cookie, TOKEN_COOKIE);

    if (isValidAuthToken(tokenFromCookie)) {
      return tokenFromCookie;
    }
  }

  if (typeof window !== "undefined") {
    const tokenFromStorage = window.localStorage.getItem("token");

    if (isValidAuthToken(tokenFromStorage)) {
      return tokenFromStorage;
    }
  }

  return null;
}

export function getBarbershopIdFromToken(token?: string | null): string | null {
  if (!isValidAuthToken(token)) {
    return null;
  }

  try {
    const [, payload = ""] = token.split(".");
    const parsedPayload = JSON.parse(decodeBase64Url(payload)) as {
      barbershopId?: string;
    };

    return parsedPayload.barbershopId ?? null;
  } catch {
    return null;
  }
}
