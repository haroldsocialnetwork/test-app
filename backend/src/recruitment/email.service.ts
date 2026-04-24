import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface MissingInfoEmailPayload {
  toEmail: string;
  candidateName: string;
  jobTitle: string;
  followUpMessage: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter | null;

  constructor() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(process.env.SMTP_PORT ?? '587', 10),
        secure: false,
        auth: { user, pass },
      });
    } else {
      this.transporter = null;
      this.logger.warn(
        'SMTP not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing). ' +
          'Emails will be logged to console only.',
      );
    }
  }

  async sendMissingInfoEmail(payload: MissingInfoEmailPayload): Promise<void> {
    const { toEmail, candidateName, jobTitle, followUpMessage } = payload;
    const from = process.env.EMAIL_FROM ?? 'AI Recruitment <noreply@recruitment.ai>';

    const subject = `Follow-up on your application for ${jobTitle}`;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Application Follow-Up: ${jobTitle}</h2>
        <div style="white-space: pre-wrap; line-height: 1.6; color: #333;">
${followUpMessage}
        </div>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
        <p style="color: #999; font-size: 12px;">
          This is an automated message from our AI-powered recruitment system.
        </p>
      </div>
    `;

    if (!this.transporter) {
      this.logger.log(
        `[EMAIL PREVIEW] To: ${toEmail} | Subject: ${subject}\n${followUpMessage}`,
      );
      return;
    }

    await this.transporter.sendMail({ from, to: toEmail, subject, html });
    this.logger.log(`Follow-up email sent to ${toEmail} for job "${jobTitle}"`);
  }
}
