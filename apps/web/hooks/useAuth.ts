"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import {
  AUTH_COOKIE_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
  TOKEN_COOKIE,
  isValidAuthToken,
} from "@/lib/auth";

function getCookieOptions() {
  const secure = window.location.protocol === "https:";
  const secureFlag = secure ? "; Secure" : "";

  return `path=/; max-age=${AUTH_COOKIE_MAX_AGE}; SameSite=Strict${secureFlag}`;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; ${getCookieOptions()}`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; max-age=0; path=/; SameSite=Strict`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export function useAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const saveAuthAndRedirect = useCallback(
    (tokens: Partial<Record<string, string>>, defaultRedirect = "/") => {
      Object.entries(tokens).forEach(([key, value]) => {
        if (isValidAuthToken(value)) {
          setCookie(key, value);
        }
      });

      const redirectTo = searchParams.get("redirect") ?? defaultRedirect;
      router.replace(redirectTo);
    },
    [router, searchParams]
  );

  const logout = useCallback(() => {
    deleteCookie(TOKEN_COOKIE);
    deleteCookie(REFRESH_TOKEN_COOKIE);
    router.replace("/auth/login");
  }, [router]);

  const getToken = useCallback((): string | null => {
    return getCookie(TOKEN_COOKIE);
  }, []);

  return { saveAuthAndRedirect, logout, getToken };
}

