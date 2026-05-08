import { authInterceptor } from './authInterceptor';
import { errorInterceptor } from './errorInterceptor';

type FetchOptions = RequestInit & {
  skipAuth?: boolean;
  token?: string;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

function buildUrl(path: string): string {
  return path.startsWith('http') ? path : `${BASE_URL}${path}`;
}

function buildHeaders(options: FetchOptions): Headers {
  const headers = new Headers(options.headers ?? {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  return headers;
}

export async function apiClient<T = unknown>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  if (!BASE_URL) throw new Error('API URL não definida');

  const config = authInterceptor(
    { ...options, headers: buildHeaders(options) },
    options
  );

  const response = await fetch(buildUrl(path), config);
  return errorInterceptor(response) as Promise<T>;
}

// Helpers para não repetir options
export const api = {
  get: <T = unknown>(path: string, opts?: FetchOptions) =>
    apiClient<T>(path, { ...opts, method: 'GET' }),
  
  post: <T = unknown>(path: string, data?: any, opts?: FetchOptions) =>
    apiClient<T>(path, {
      ...opts,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: <T = unknown>(path: string, data?: any, opts?: FetchOptions) =>
    apiClient<T>(path, {
      ...opts,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  patch: <T = unknown>(path: string, data?: any, opts?: FetchOptions) =>
    apiClient<T>(path, {
      ...opts,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: <T = unknown>(path: string, opts?: FetchOptions) =>
    apiClient<T>(path, { ...opts, method: 'DELETE' }),
  
  form: <T = unknown>(path: string, data: FormData, opts?: FetchOptions) =>
    apiClient<T>(path, {
      ...opts,
      method: 'POST',
      body: data,
    }),
};