"use client";

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";

type FieldError = { email?: string; api?: string };
type ApiError = { status?: number; message?: string; data?: unknown };

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FieldError>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function validate(): boolean {
    const nextErrors: FieldError = {};

    if (!validateEmail(email)) {
      nextErrors.email = "Informe um e-mail valido.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      await apiClient("/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      setSubmitted(true);
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.status) {
        setErrors({ api: "Nao foi possivel enviar as instrucoes. Tente novamente." });
        return;
      }

      setErrors({ api: "Erro de conexao. Verifique sua internet." });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSubmit();
    }
  }

  return (
    <main className="screen">
      <div className="card">
        <div className="logo-wrap">
          <ScissorIcon />
        </div>

        <div className="header">
          <h1 className="page-title">Recuperar senha</h1>
          <p className="page-sub">
            Informe o e-mail da sua conta para receber um link de redefinicao.
          </p>
        </div>

        {submitted ? (
          <div className="success-box">
            <div className="success-icon">OK</div>
            <p className="success-title">Verifique seu e-mail</p>
            <p className="success-text">
              Se existir uma conta para esse endereco, enviaremos as instrucoes em instantes.
            </p>
            <a href="/auth/login" className="btn-secondary">
              Voltar para o login
            </a>
          </div>
        ) : (
          <>
            <div className="section">
              <p className="section-label">Acesso</p>

              <div className="field-group">
                <label className="field-label">E-mail</label>
                <div className={`input-wrap ${errors.email ? "has-error" : ""}`}>
                  <span className="input-icon">
                    <MailIcon />
                  </span>
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
            </div>

            {errors.api && (
              <div className="toast-error" role="alert">
                {errors.api}
              </div>
            )}

            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? <span className="spinner" /> : "Enviar link"}
            </button>

            <p className="footer-text">
              Lembrou da senha?{" "}
              <a href="/auth/login" className="link-gold">
                Voltar para o login
              </a>
            </p>
          </>
        )}
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

        .field-group { width: 100%; display: flex; flex-direction: column; gap: 0.4rem; }
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

        .btn-secondary {
          display: inline-block;
          padding: 0.65rem 1.5rem;
          border: 1px solid #F5A623;
          color: #F5A623;
          border-radius: 10px;
          font-size: 0.875rem;
          text-decoration: none;
          transition: background 0.15s;
        }

        .btn-secondary:hover { background: rgba(245,166,35,0.1); }

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

        .success-box {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.85rem;
          text-align: center;
        }

        .success-icon {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(34,197,94,0.14);
          border: 1px solid rgba(34,197,94,0.4);
          color: #4ade80;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          font-weight: 700;
        }

        .success-title {
          font-family: "Syne", sans-serif;
          font-size: 1.15rem;
          font-weight: 700;
          color: #f0f0f0;
        }

        .success-text {
          font-size: 0.88rem;
          color: #888;
          line-height: 1.6;
        }
      `}</style>
    </main>
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

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
