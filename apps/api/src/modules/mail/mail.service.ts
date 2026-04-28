// mail/mail.service.ts
import { Injectable, Logger } from "@nestjs/common"
import { magicLinkTemplate } from "./template/magic-link"
import { passwordResetTemplate } from "./template/password-reset"

export type SendMagicLinkParams = {
  to: string
  name: string
  link: string
}

export type SendPasswordResetParams = {
  to: string
  name: string
  link: string
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)

  async sendMagicLink(params: SendMagicLinkParams): Promise<void> {
    const { to, name, link } = params
    const html = magicLinkTemplate({ name, link })
    void html

    // ─── Troque aqui quando escolher o serviço ───────────
    //
    // Resend:
    // await resend.emails.send({ from: "...", to, subject: "...", html })
    //
    // Nodemailer:
    // await transporter.sendMail({ from: "...", to, subject: "...", html })
    //
    // SendGrid:
    // await sgMail.send({ from: "...", to, subject: "...", html })
    //
    // Por enquanto loga no console para desenvolvimento
    this.logger.log(`Magic link for ${to}: ${link}`)
  }

  async sendPasswordResetLink(
    params: SendPasswordResetParams,
  ): Promise<void> {
    const { to, name, link } = params
    const html = passwordResetTemplate({ name, link })

    void html

    this.logger.log(`Password reset link for ${to}: ${link}`)
  }
}
