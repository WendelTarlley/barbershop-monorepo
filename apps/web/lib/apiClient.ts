// lib/http/apiClient.ts

import { authInterceptor } from "./authInterceptor";
import { errorInterceptor } from "./errorInterceptor";

type FetchOptions = RequestInit & {
  skipAuth?: boolean;
};

export async function apiClient(
  path: string,
  options: FetchOptions = {}
) {
  const baseUrl = process.env.API_URL;

  if (!baseUrl) {
    throw new Error("API URL não definida");
  }

  let config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  };

  // 👉 interceptors
  config = await authInterceptor(config, options);
  
  const response = await fetch(`${baseUrl}${path}`, config);

  return errorInterceptor(response);
}