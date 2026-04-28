type Params = {
  name: string
  link: string
}

export function passwordResetTemplate({ name, link }: Params): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Hello, ${name}!</h2>
      <p>We received a request to reset your password.</p>
      <p>This link expires in <strong>15 minutes</strong> and can only be used once.</p>
      <a
        href="${link}"
        style="
          display: inline-block;
          background: #e8b84b;
          color: #1a1a1a;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: bold;
          margin: 16px 0;
        "
      >
        Reset password
      </a>
      <p style="color: #888; font-size: 12px;">
        If you did not request a password reset, you can ignore this email.
      </p>
    </div>
  `
}
