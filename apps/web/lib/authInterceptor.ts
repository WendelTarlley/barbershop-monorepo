// lib/http/authInterceptor.ts

export async function authInterceptor(
  config: RequestInit,
  options?: { skipAuth?: boolean }
) {
  if (options?.skipAuth) return config;

  // ⚠️ depende de onde você salva o token
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
}