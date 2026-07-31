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
}

export type { MailMessage };
export { MailService };
