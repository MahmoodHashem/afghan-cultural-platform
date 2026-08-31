type EmailVerificationTemplateInput = {
  displayName: string;
  verificationUrl: string;
  expiresInHours: number;
  logoUrl: string;
};

type EmailVerificationMessage = {
  subject: string;
  text: string;
  html: string;
};

function createEmailVerificationMessage(
  input: EmailVerificationTemplateInput,
): EmailVerificationMessage {
  const displayName = escapeHtml(input.displayName.trim());
  const verificationUrl = escapeHtml(input.verificationUrl);
  const logoUrl = escapeHtml(input.logoUrl);
  const expiresInHours = new Intl.NumberFormat("fa-AF").format(input.expiresInHours);

  return {
    subject: "تأیید ایمیل در میراث افغانستان",
    text: [
      "میراث افغانستان",
      "",
      `سلام ${input.displayName.trim()}،`,
      "برای تکمیل حساب و استفاده از همه امکانات، ایمیل خود را از طریق پیوند زیر تأیید کنید:",
      input.verificationUrl,
      "",
      `این پیوند تا ${expiresInHours} ساعت معتبر است.`,
      "اگر شما این حساب را نساخته‌اید، این ایمیل را نادیده بگیرید.",
    ].join("\n"),
    html: `<!doctype html>
<html lang="fa" dir="rtl">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>تأیید ایمیل در میراث افغانستان</title>
  </head>
  <body style="margin:0; padding:0; background-color:#FAF8F3; color:#1F2937; direction:rtl;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
      برای تکمیل حساب خود، ایمیل‌تان را تأیید کنید.
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background-color:#FAF8F3;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; max-width:600px; background-color:#FFFFFF; border:1px solid #E5E1D8; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(31,41,55,0.06);">
            <tr>
              <td style="height:4px; background-color:#0F766E; font-size:0; line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:28px 32px 20px; border-bottom:1px solid #E5E1D8;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td width="52" style="width:52px; vertical-align:middle;">
                      <img src="${logoUrl}" width="48" height="48" alt="نشان میراث افغانستان" style="display:block; width:48px; height:48px; border:0;">
                    </td>
                    <td style="padding-right:12px; vertical-align:middle; font-family:Estedad,Tahoma,Arial,sans-serif; text-align:right;">
                      <p style="margin:0; color:#0F766E; font-size:20px; line-height:30px; font-weight:700;">میراث افغانستان</p>
                      <p style="margin:2px 0 0; color:#6B7280; font-size:12px; line-height:20px;">فرهنگ افغانستان، یک‌جا</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 32px; font-family:Estedad,Tahoma,Arial,sans-serif; text-align:right;">
                <p style="margin:0 0 12px; color:#6B7280; font-size:15px; line-height:26px;">سلام ${displayName}،</p>
                <h1 style="margin:0 0 16px; color:#1F2937; font-size:26px; line-height:38px; font-weight:700; letter-spacing:0;">ایمیل‌تان را تأیید کنید</h1>
                <p style="margin:0; color:#4B5563; font-size:15px; line-height:28px;">
                  برای تکمیل حساب و استفاده از همه امکانات میراث افغانستان، روی دکمه زیر بزنید.
                </p>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 24px;">
                  <tr>
                    <td bgcolor="#0F766E" style="border-radius:8px;">
                      <a href="${verificationUrl}" target="_blank" style="display:inline-block; padding:13px 28px; border:1px solid #0F766E; border-radius:8px; color:#FFFFFF; font-family:Estedad,Tahoma,Arial,sans-serif; font-size:15px; line-height:22px; font-weight:700; text-decoration:none;">تأیید ایمیل</a>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; margin:0 0 24px; background-color:#F0FDFA; border-radius:8px;">
                  <tr>
                    <td style="padding:12px 16px; color:#115E59; font-family:Estedad,Tahoma,Arial,sans-serif; font-size:13px; line-height:24px;">
                      این پیوند تا ${expiresInHours} ساعت معتبر است.
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 8px; color:#6B7280; font-size:12px; line-height:22px;">اگر دکمه کار نکرد، این نشانی را در مرورگر باز کنید:</p>
                <p dir="ltr" style="margin:0; color:#0F766E; font-family:Arial,sans-serif; font-size:12px; line-height:20px; text-align:left; word-break:break-all;">
                  <a href="${verificationUrl}" target="_blank" style="color:#0F766E; text-decoration:underline;">${verificationUrl}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 24px; background-color:#FCFBF8; border-top:1px solid #E5E1D8; font-family:Estedad,Tahoma,Arial,sans-serif; text-align:right;">
                <p style="margin:0 0 6px; color:#6B7280; font-size:12px; line-height:22px;">اگر شما این حساب را نساخته‌اید، این ایمیل را نادیده بگیرید.</p>
                <p style="margin:0; color:#9CA3AF; font-size:11px; line-height:20px;">جایی برای گردآوری و شناخت فرهنگ افغانستان</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export type { EmailVerificationMessage, EmailVerificationTemplateInput };
export { createEmailVerificationMessage };
