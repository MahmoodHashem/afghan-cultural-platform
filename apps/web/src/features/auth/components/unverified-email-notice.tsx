function UnverifiedEmailNotice() {
  return (
    <div
      className="rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-[14px] leading-7 text-foreground"
      role="status"
      aria-live="polite"
    >
      ایمیل شما هنوز تأیید نشده است. برای افزودن مطلب و برخی فعالیت‌ها باید ایمیل خود را تأیید کنید.
    </div>
  );
}

export { UnverifiedEmailNotice };
