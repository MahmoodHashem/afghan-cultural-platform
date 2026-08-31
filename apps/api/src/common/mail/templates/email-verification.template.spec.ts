import { createEmailVerificationMessage } from "./email-verification.template";

describe("createEmailVerificationMessage", () => {
  it("renders a branded Persian RTL verification email with a plain-text fallback", () => {
    const message = createEmailVerificationMessage({
      displayName: "محمود هاشم",
      verificationUrl: "https://example.com/verify-email?token=secure-token&next=%2Fprofile",
      expiresInHours: 24,
      logoUrl: "https://example.com/images/small-logo.png",
    });

    expect(message.subject).toBe("تأیید ایمیل در میراث افغانستان");
    expect(message.text).toContain("سلام محمود هاشم،");
    expect(message.text).toContain("https://example.com/verify-email?token=secure-token");
    expect(message.html).toContain('<html lang="fa" dir="rtl">');
    expect(message.html).toContain("#FAF8F3");
    expect(message.html).toContain("#0F766E");
    expect(message.html).toContain("تأیید ایمیل");
    expect(message.html).toContain("https://example.com/images/small-logo.png");
    expect(message.html).toContain("token=secure-token&amp;next=%2Fprofile");
  });

  it("escapes user-controlled and URL values in HTML", () => {
    const message = createEmailVerificationMessage({
      displayName: '<script>alert("name")</script>',
      verificationUrl: 'https://example.com/verify?token=<unsafe>&value="quoted"',
      expiresInHours: 1,
      logoUrl: 'https://example.com/logo.png?value="unsafe"',
    });

    expect(message.html).not.toContain("<script>");
    expect(message.html).toContain("&lt;script&gt;");
    expect(message.html).toContain("&quot;quoted&quot;");
    expect(message.html).toContain("&quot;unsafe&quot;");
  });
});
