import {
  BARBERSHOP_HEADER,
  getBarbershopIdFromToken,
  getBrowserAuthToken,
} from "./auth";

export async function authInterceptor(
  config: RequestInit,
  options?: { skipAuth?: boolean; token?: string },
) {
  if (options?.skipAuth) return config;

  const token = options?.token ?? getBrowserAuthToken();

  if (!token) {
    return config;
  }

  const headers = new Headers(config.headers ?? {});
  const barbershopId = getBarbershopIdFromToken(token);

  headers.set("Authorization", `Bearer ${token}`);

  if (barbershopId) {
    headers.set(BARBERSHOP_HEADER, barbershopId);
  }

  config.headers = headers;

  return config;
}
