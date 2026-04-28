"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { REFRESH_TOKEN_COOKIE, TOKEN_COOKIE } from "@/lib/auth";
import { apiClient } from "@/lib/apiClient";

type FieldError = { email?: string; password?: string; api?: string };
type ApiError = { status?: number; message?: string; data?: unknown };

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const { saveAuthAndRedirect } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errs: FieldError = {};
    if (!validateEmail(email)) errs.email = "Informe um e-mail vÃ¡lido.";
    if (password.length < 6) errs.password = "Senha muito curta.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      const data = await apiClient(`/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      saveAuthAndRedirect({
        [TOKEN_COOKIE]: data.accessToken,
        [REFRESH_TOKEN_COOKIE]: data.refreshToken,
      });
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.status === 401) {
        setErrors({ api: "E-mail ou senha incorretos." });
        return;
      }

      if (apiError.status) {
        setErrors({ api: "Erro ao conectar. Tente novamente." });
        return;
      }

      setErrors({ api: "Erro de conexÃ£o. Verifique sua internet." });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit();
  }

  return (
    <main className="screen">
      <div className="card">
        {/* Logo */}
        <div className="logo-wrap">
          <ScissorIcon />
        </div>

        {/* Header */}
        <div className="header">
          <h1 className="page-title">Bem-vindo de volta</h1>
          <p className="page-sub">Acesse o painel da sua barbearia</p>
        </div>

        {/* SeÃ§Ã£o â€” Acesso */}
        <div className="section">
          <p className="section-label">Acesso</p>

          {/* E-mail */}
          <div className="field-group">
            <label className="field-label">E-mail</label>
            <div className={`input-wrap ${errors.email ? "has-error" : ""}`}>
              <span className="input-icon"><MailIcon /></span>
              <input
                type="email"
                placeholder="contato@barbearia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className="field-input"
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          {/* Senha */}
          <div className="field-group">
            <div className="label-row">
              <label className="field-label">Senha</label>
              <a href="/auth/forgot-password" className="forgot-link">
                Esqueci minha senha
              </a>
            </div>
            <div className={`input-wrap ${errors.password ? "has-error" : ""}`}>
              <span className="input-icon"><LockIcon /></span>
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Sua senha de acesso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="field-input"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPwd ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>
        </div>

        {/* API error */}
        {errors.api && (
          <div className="toast-error" role="alert">
            {errors.api}
          </div>
        )}

        {/* BotÃ£o */}
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? <span className="spinner" /> : "Entrar"}
        </button>

        {/* Footer */}
        <p className="footer-text">
          Problemas com o acesso?{" "}
          <a href="mailto:suporte@seuapp.com" className="link-gold">
            Fale com o suporte
          </a>
        </p>
      </div>

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

        .field-group { display: flex; flex-direction: column; gap: 0.4rem; }

        .label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .field-label { font-size: 0.78rem; color: #888; }

        .forgot-link {
          font-size: 0.75rem;
          color: #F5A623;
          text-decoration: none;
          opacity: 0.8;
          transition: opacity 0.15s;
        }
        .forgot-link:hover { opacity: 1; }

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
          transition: opacity 0.15s, transform 0.1s;
        }
        .btn-primary:hover:not(:disabled) { opacity: 0.88; }
        .btn-primary:active:not(:disabled) { transform: scale(0.98); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(0,0,0,0.3);
          border-top-color: #0e0e0e;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .footer-text {
          font-size: 0.78rem;
          color: #555;
          text-align: center;
        }

        .link-gold {
          color: #F5A623;
          text-decoration: none;
          opacity: 0.85;
          transition: opacity 0.15s;
        }
        .link-gold:hover { opacity: 1; }
      `}</style>
    </main>
  );
}

// â”€â”€â”€ Icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ScissorIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
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
