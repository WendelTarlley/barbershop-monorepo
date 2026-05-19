const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"
const ACCESS_TOKEN_KEY = "@barbershop:customer-token"
const REFRESH_TOKEN_KEY = "@barbershop:customer-refresh-token"
const BARBERSHOP_HEADER = "X-Barbershop-Id"

type ApiOptions = RequestInit & {
  auth?: boolean
  barbershopId?: string
}

type ApiErrorPayload = {
  message?: string | string[]
}

function getApiUrl() {
  const normalizedApiUrl = RAW_API_URL.replace(/\/$/, "")

  if (normalizedApiUrl.endsWith("/api")) {
    return normalizedApiUrl
  }

  return `${normalizedApiUrl}/api`
}

function getStoredToken(key: string) {
  if (typeof window === "undefined") {
    return null
  }

  return window.localStorage.getItem(key)
}

function parseResponseBody(text: string): unknown {
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

function getErrorMessage(data: unknown) {
  if (!data || typeof data !== "object") {
    return "Request failed."
  }

  const { message } = data as ApiErrorPayload

  if (typeof message === "string" && message.trim()) {
    return message
  }

  if (Array.isArray(message) && typeof message[0] === "string") {
    return message[0]
  }

  return "Request failed."
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers ?? {})

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  if (options.auth) {
    const token = getStoredToken(ACCESS_TOKEN_KEY)

    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
  }

  if (options.barbershopId?.trim()) {
    headers.set(BARBERSHOP_HEADER, options.barbershopId.trim())
  }

  const response = await fetch(`${getApiUrl()}${path}`, {
    ...options,
    headers,
  })

  const text = await response.text()
  const data = parseResponseBody(text)

  if (!response.ok) {
    throw new Error(getErrorMessage(data))
  }

  return data as T
}

export function saveCustomerTokens(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function clearCustomerTokens() {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
}
