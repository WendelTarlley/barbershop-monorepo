const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"
const ACCESS_TOKEN_KEY = "@barbershop:customer-token"
const REFRESH_TOKEN_KEY = "@barbershop:customer-refresh-token"

type ApiOptions = RequestInit & {
  auth?: boolean
}

export async function apiFetch(path: string, options: ApiOptions = {}) {
  const headers = new Headers(options.headers ?? {})

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  if (options.auth && typeof window !== "undefined") {
    const token = window.localStorage.getItem(ACCESS_TOKEN_KEY)

    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message =
      (data && typeof data.message === "string" && data.message) ||
      "Request failed."
    throw new Error(message)
  }

  return data
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
