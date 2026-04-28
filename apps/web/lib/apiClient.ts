import { authInterceptor } from "./authInterceptor";
import { errorInterceptor } from "./errorInterceptor";

type FetchOptions = RequestInit & {
  skipAuth?: boolean;
  token?: string;
};

export async function apiClient(path: string, options: FetchOptions = {}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

  if (!baseUrl) {
    throw new Error("API URL nao definida");
  }

  const requestUrl =
    path.startsWith("http://") || path.startsWith("https://")
      ? path
      : `${baseUrl}${path}`;

  const headers = new Headers(options.headers ?? {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let config: RequestInit = {
    ...options,
    headers,
  };

  config = await authInterceptor(config, options);

  const response = await fetch(requestUrl, config);

  return errorInterceptor(response);
}
