"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/apiClient";
import { REFRESH_TOKEN_COOKIE, TOKEN_COOKIE } from "@/lib/auth";

type Status = "loading" | "form" | "error_expired" | "error_used" | "error_generic";
type FieldError = { password?: string; confirm?: string; api?: string };
type ApiError = { status?: number; message?: string; data?: unknown };

function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
  if (pwd.length === 0) return { score: 0, label: "", color: "transparent" };

  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const map = [
    { score: 1, label: "Fraca", color: "#ef4444" },
    { score: 2, label: "Razoavel", color: "#f97316" },
    { score: 3, label: "Boa", color: "#eab308" },
    { score: 4, label: "Forte", color: "#22c55e" },
  ];

  return map[score - 1] ?? { score: 0, label: "", color: "transparent" };
}

function mapLinkError(data: unknown): Exclude<Status, "loading" | "form"> {
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

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const { saveAuthAndRedirect } = useAuth();
  const [status, setStatus] = useState<Status>("loading");
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [saving, setSaving] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error_generic");
      return;
    }

    const resetToken = token;

    async function validateLink() {
      try {
        const data = await apiClient(
          `/auth/verify-reset-password?token=${encodeURIComponent(resetToken)}`,
        );

        setTempToken(data.tempToken);
        setStatus("form");
      } catch (error) {
        const apiError = error as ApiError;

        if (apiError.status) {
          setStatus(mapLinkError(apiError.data));
          return;
        }

        setStatus("error_generic");
      }
    }

    validateLink();
  }, [searchParams]);

  function validate(): boolean {
    const nextErrors: FieldError = {};

    if (password.length < 8) {
      nextErrors.password = "A senha deve ter ao menos 8 caracteres.";
    } else if (strength.score < 2) {
      nextErrors.password = "Escolha uma senha mais forte.";
    }

    if (confirm !== password) {
      nextErrors.confirm = "As senhas nao conferem.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate() || !tempToken) return;

    setSaving(true);
    setErrors({});

    try {
      const data = await apiClient("/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: tempToken, password }),
      });

      saveAuthAndRedirect({
        [TOKEN_COOKIE]: data.accessToken,
        [REFRESH_TOKEN_COOKIE]: data.refreshToken,
      });
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.status === 401) {
        setErrors({ api: "Sessao invalida. Solicite um novo link." });
        return;
      }

      if (apiError.status) {
        setErrors({ api: "Nao foi possivel redefinir a senha. Tente novamente." });
        return;
      }

      setErrors({ api: "Erro de conexao. Verifique sua internet." });
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") {
    return (
      <main className="screen">
        <div className="card">
          <div className="logo-wrap">
            <ScissorIcon />
          </div>
          <div className="content">
            <div className="spinner" aria-label="Carregando" />
            <p className="title">Validando seu link...</p>
            <p className="subtitle">Isso leva so alguns segundos.</p>
          </div>
        </div>
        <Styles />
      </main>
    );
  }

  if (status !== "form") {
    const copy: Record<Exclude<Status, "loading" | "form">, { title: string; description: string; ctaHref: string; ctaLabel: string }> = {
      error_expired: {
        title: "Link expirado",
        description: "Este link nao e mais valido. Solicite um novo para continuar.",
        ctaHref: "/auth/forgot-password",
        ctaLabel: "Solicitar novo link",
      },
      error_used: {
        title: "Link ja utilizado",
        description: "Este link ja foi usado anteriormente. Voce pode fazer login com a nova senha ou solicitar outro.",
        ctaHref: "/auth/login",
        ctaLabel: "Ir para o login",
      },
      error_generic: {
        title: "Algo deu errado",
        description: "Nao foi possivel validar seu link de redefinicao. Tente novamente mais tarde.",
        ctaHref: "/auth/forgot-password",
        ctaLabel: "Tentar novamente",
      },
    };

    return (
      <main className="screen">
        <div className="card">
          <div className="logo-wrap">
            <ScissorIcon />
          </div>
          <div className="content">
            <div className="error-icon">!</div>
            <p className="title">{copy[status].title}</p>
            <p className="subtitle">{copy[status].description}</p>
            <a href={copy[status].ctaHref} className="btn-link">
              {copy[status].ctaLabel}
            </a>
          </div>
        </div>
        <Styles />
      </main>
    );
  }

  return (
    <main className="screen">
      <div className="card">
        <div className="logo-wrap">
          <ScissorIcon />
        </div>

        <div className="header">
          <h1 className="page-title">Redefinir senha</h1>
          <p className="page-sub">Escolha uma nova senha para voltar ao painel.</p>
        </div>

        <div className="section">
          <p className="section-label">Seguranca</p>

          <div className="field-group">
            <label className="field-label">Nova senha</label>
            <div className={`input-wrap ${errors.password ? "has-error" : ""}`}>
              <span className="input-icon">
                <LockIcon />
              </span>
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Minimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field-input"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPwd((value) => !value)}
                aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPwd ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {password.length > 0 && (
              <div className="strength-row">
                <div className="strength-bar">
                  {[1, 2, 3, 4].map((segment) => (
                    <div
                      key={segment}
                      className="strength-seg"
                      style={{
                        background: strength.score >= segment ? strength.color : "#2a2a2a",
                      }}
                    />
                  ))}
                </div>
                <span className="strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}

            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <div className="field-group">
            <label className="field-label">Confirmar senha</label>
            <div className={`input-wrap ${errors.confirm ? "has-error" : ""}`}>
              <span className="input-icon">
                <LockIcon />
              </span>
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Repita a nova senha"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="field-input"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowConfirm((value) => !value)}
                aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
              >
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.confirm && <p className="field-error">{errors.confirm}</p>}
          </div>
        </div>

        {errors.api && (
          <div className="toast-error" role="alert">
            {errors.api}
          </div>
        )}

        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={saving}
          aria-busy={saving}
        >
          {saving ? <span className="spinner spinner-dark" /> : "Salvar nova senha"}
        </button>
      </div>

      <Styles />
    </main>
  );
}

function Styles() {
  return (
    <style jsx global>{`
      @import url("https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap");

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #0e0e0e; }

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
        max-width: 400px;
        background: #161616;
        border: 1px solid #2a2a2a;
        border-radius: 20px;
        padding: 2.5rem 1.75rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.75rem;
      }

      .logo-wrap {
        width: 64px;
        height: 64px;
        background: #1e1e1e;
        border: 1px solid #F5A623;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .header { text-align: center; }

      .page-title {
        font-family: "Syne", sans-serif;
        font-size: 1.35rem;
        font-weight: 700;
        color: #f0f0f0;
        margin-bottom: 0.35rem;
      }

      .page-sub { font-size: 0.875rem; color: #666; line-height: 1.5; }

      .section {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        border: 1px solid #2a2a2a;
        border-radius: 14px;
        padding: 1.25rem 1.1rem;
        position: relative;
      }

      .section-label {
        position: absolute;
        top: -10px;
        left: 14px;
        background: #161616;
        padding: 0 6px;
        font-size: 0.75rem;
        color: #F5A623;
        font-weight: 500;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .field-group { display: flex; flex-direction: column; gap: 0.4rem; width: 100%; }
      .field-label { font-size: 0.78rem; color: #888; }

      .input-wrap {
        display: flex;
        align-items: center;
        background: #1e1e1e;
        border: 1px solid #2e2e2e;
        border-radius: 10px;
        padding: 0 0.75rem;
        transition: border-color 0.15s;
      }

      .input-wrap:focus-within { border-color: #F5A623; }
      .input-wrap.has-error { border-color: #7a2020; }

      .input-icon {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        margin-right: 8px;
      }

      .field-input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: #f0f0f0;
        font-size: 0.9rem;
        font-family: "DM Sans", sans-serif;
        padding: 0.75rem 0;
      }

      .field-input::placeholder { color: #555; }

      .eye-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        color: #666;
        transition: color 0.15s;
      }

      .eye-btn:hover { color: #F5A623; }

      .strength-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
      }

      .strength-bar {
        display: flex;
        gap: 4px;
        flex: 1;
      }

      .strength-seg {
        height: 3px;
        flex: 1;
        border-radius: 2px;
        transition: background 0.25s;
      }

      .strength-label { font-size: 0.72rem; font-weight: 500; min-width: 44px; }
      .field-error { font-size: 0.75rem; color: #f87171; }

      .toast-error {
        width: 100%;
        background: #2a1010;
        border: 1px solid #5a1f1f;
        border-radius: 10px;
        padding: 0.75rem 1rem;
        font-size: 0.85rem;
        color: #f87171;
        text-align: center;
      }

      .btn-primary {
        width: 100%;
        padding: 0.85rem;
        background: #F5A623;
        color: #0e0e0e;
        border: none;
        border-radius: 12px;
        font-family: "DM Sans", sans-serif;
        font-size: 0.95rem;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: opacity 0.15s, transform 0.1s;
      }

      .btn-primary:hover:not(:disabled) { opacity: 0.88; }
      .btn-primary:active:not(:disabled) { transform: scale(0.98); }
      .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

      .spinner {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(245,166,35,0.22);
        border-top-color: #F5A623;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }

      .spinner-dark {
        border-color: rgba(0,0,0,0.25);
        border-top-color: #0e0e0e;
      }

      @keyframes spin { to { transform: rotate(360deg); } }

      .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        text-align: center;
      }

      .title {
        font-family: "Syne", sans-serif;
        font-size: 1.2rem;
        font-weight: 600;
        color: #f0f0f0;
      }

      .subtitle {
        font-size: 0.875rem;
        color: #888;
        line-height: 1.6;
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

      .btn-link {
        margin-top: 0.5rem;
        padding: 0.65rem 1.5rem;
        background: #F5A623;
        color: #0e0e0e;
        border-radius: 10px;
        font-size: 0.875rem;
        font-weight: 500;
        text-decoration: none;
        transition: opacity 0.15s;
      }

      .btn-link:hover { opacity: 0.88; }
    `}</style>
  );
}

function ScissorIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
