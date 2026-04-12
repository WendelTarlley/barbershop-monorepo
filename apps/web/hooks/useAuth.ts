"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const TOKEN_KEY = "@barber:token";
const COOKIE_OPTIONS = "path=/; SameSite=Strict; Secure";

// ─── Helpers de cookie ─────────────────────────────────────────────────────

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; ${COOKIE_OPTIONS}`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * Salva o token definitivo em cookie (lido pelo middleware)
   * e redireciona para o destino correto.
   */
  const saveTokenAndRedirect = useCallback(
    (key: string, token: string, defaultRedirect = "/") => {
      setCookie(key, token);
      const redirectTo = searchParams.get("redirect") ?? defaultRedirect;
      router.replace(redirectTo);
    },
    [router, searchParams]
  );

  /**
   * Remove o token e volta para o login.
   */
  const logout = useCallback(() => {
    deleteCookie(TOKEN_KEY);
    router.replace("/auth/login");
  }, [router]);

  /**
   * Retorna o token atual (útil para chamadas de API client-side).
   */
  const getToken = useCallback((): string | null => {
    return getCookie(TOKEN_KEY);
  }, []);

  return { saveTokenAndRedirect, logout, getToken };
}