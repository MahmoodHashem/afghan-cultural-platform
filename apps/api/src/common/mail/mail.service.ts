import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createTransport, type SendMailOptions, type Transporter } from "nodemailer";
import type Mail from "nodemailer/lib/mailer";

type MailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

type PasswordResetEmailInput = {
  to: string;
  resetUrl: string;
  expiresInMinutes: number;
};

@Injectable()
class MailService {
  private readonly from: Mail.Address;
  private readonly transporter: Transporter;

  constructor(@Inject(ConfigService) configService: ConfigService) {
    const port = configService.getOrThrow<number>("SMTP_PORT");

    this.from = {
      address: configService.getOrThrow<string>("SMTP_FROM"),
      name: configService.getOrThrow<string>("SMTP_FROM_NAME"),
    };
    this.transporter = createTransport({
      host: configService.getOrThrow<string>("SMTP_HOST"),
      port,
      secure: port === 465,
      auth: {
        user: configService.getOrThrow<string>("SMTP_USER"),
        pass: configService.getOrThrow<string>("SMTP_PASSWORD"),
      },
    });
  }

  async sendMail(message: MailMessage): Promise<void> {
    const mailOptions: SendMailOptions = {
      from: this.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(input: PasswordResetEmailInput): Promise<void> {
    await this.sendMail({
      to: input.to,
      subject: "بازنشانی رمز عبور میراث افغانستان",
      text: [
        "میراث افغانستان",
        "",
        "برای بازنشانی رمز عبور خود از لینک زیر استفاده کنید:",
        input.resetUrl,
        "",
        `این لینک تا ${input.expiresInMinutes} دقیقه معتبر است.`,
        "اگر شما این درخواست را نداده‌اید، این ایمیل را نادیده بگیرید.",
      ].join("\n"),
      html: `
        <div dir="rtl" style="font-family: Tahoma, sans-serif; line-height: 1.8;">
          <h1>میراث افغانستان</h1>
          <p>برای بازنشانی رمز عبور خود روی لینک زیر کلیک کنید:</p>
          <p><a href="${input.resetUrl}">بازنشانی رمز عبور</a></p>
          <p>این لینک تا ${input.expiresInMinutes} دقیقه معتبر است.</p>
          <p>اگر شما این درخواست را نداده‌اید، این ایمیل را نادیده بگیرید.</p>
        </div>
      `,
    });
  }
}

export type { MailMessage, PasswordResetEmailInput };
export { MailService };
