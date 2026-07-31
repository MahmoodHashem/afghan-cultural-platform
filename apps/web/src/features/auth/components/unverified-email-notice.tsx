function UnverifiedEmailNotice() {
  return (
    <div
      className="rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-[14px] leading-7 text-foreground"
      role="status"
      aria-live="polite"
    >
      ایمیل شما هنوز تأیید نشده است. ورود انجام شد، اما برای برخی کارهای مشارکتی مانند ثبت محتوا،
      امتیازدهی و گزارش‌دهی بعداً به تأیید ایمیل نیاز دارید.
    </div>
  );
}

export { UnverifiedEmailNotice };
