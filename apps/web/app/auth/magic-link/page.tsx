"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";

type Status = "loading" | "error_expired" | "error_used" | "error_generic";
type ApiError = { status?: number; message?: string; data?: unknown };

function mapLinkError(data: unknown): Exclude<Status, "loading"> {
  const message =
    typeof data === "object" && data !== null && "message" in data
      ? Array.isArray((data as { message?: unknown }).message)
        ? (data as { message?: unknown[] }).message?.[0]
        : (data as { message?: unknown }).message
      : undefined;

  if (message === "Link expired") {
    return "error_expired";
  }

  if (message === "Link already used") {
    return "error_used";
  }

  return "error_generic";
}

export default function MagicLinkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>(token ? "loading" : "error_generic");

  useEffect(() => {
    if (!token) {
      return;
    }

    const magicToken = token;

    async function validateMagicLink() {
      try {
        const data = await apiClient(
          `/auth/verify-magic-link?token=${encodeURIComponent(magicToken)}`,
        );

        sessionStorage.setItem("@barber:temp_token", data.tempToken);
        router.replace("/auth/define-password");
      } catch (error) {
        const apiError = error as ApiError;

        if (apiError.status) {
          setStatus(mapLinkError(apiError.data));
          return;
        }

        setStatus("error_generic");
      }
    }

    void validateMagicLink();
  }, [router, token]);

  const errors: Record<Exclude<Status, "loading">, { title: string; description: string }> = {
    error_expired: {
      title: "Link expirado",
      description: "Este link de acesso nao e mais valido. Solicite um novo pelo suporte.",
    },
    error_used: {
      title: "Link ja utilizado",
      description: "Este link ja foi usado anteriormente. Faca login com sua senha.",
    },
    error_generic: {
      title: "Algo deu errado",
      description: "Nao foi possivel validar seu acesso. Tente novamente ou contate o suporte.",
    },
  };

  return (
    <main className="screen">
      <div className="card">
        <div className="logo-wrap">
          <ScissorIcon />
        </div>

        {status === "loading" ? (
          <div className="content">
            <div className="spinner" aria-label="Carregando" />
            <p className="title">Validando seu acesso...</p>
            <p className="subtitle">Aguarde um momento</p>
          </div>
        ) : (
          <div className="content">
            <div className="error-icon">!</div>
            <p className="title">{errors[status].title}</p>
            <p className="subtitle">{errors[status].description}</p>
            {status === "error_used" && (
              <a href="/auth/login" className="btn-link">
                Ir para o login
              </a>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap");

        .screen {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0e0e0e;
          font-family: "DM Sans", sans-serif;
          padding: 1.5rem;
        }

        .card {
          width: 100%;
          max-width: 380px;
          background: #161616;
          border: 1px solid #2a2a2a;
          border-radius: 20px;
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        .logo-wrap {
          width: 72px;
          height: 72px;
          background: #1e1e1e;
          border: 1px solid #f5a623;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          text-align: center;
        }

        .spinner {
          width: 36px;
          height: 36px;
          border: 3px solid #2a2a2a;
          border-top-color: #f5a623;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 0.5rem;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .error-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #3a1a1a;
          border: 1px solid #7a2020;
          color: #f87171;
          font-size: 20px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
        }

        .title {
          font-family: "Syne", sans-serif;
          font-size: 1.2rem;
          font-weight: 600;
          color: #f0f0f0;
          margin: 0;
        }

        .subtitle {
          font-size: 0.875rem;
          color: #888;
          margin: 0;
          line-height: 1.6;
        }

        .btn-link {
          margin-top: 0.5rem;
          padding: 0.65rem 1.5rem;
          background: #f5a623;
          color: #0e0e0e;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition: opacity 0.15s;
        }

        .btn-link:hover {
          opacity: 0.88;
        }
      `}</style>
    </main>
  );
}

function ScissorIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#F5A623"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}
