function UnverifiedEmailNotice() {
  return (
    <div
      className="rounded-[14px_14px_14px_4px] border border-saffron/30 bg-tint-sand px-4 py-3 text-[14px] leading-[1.9] text-ink"
      role="status"
      aria-live="polite"
    >
      ایمیل شما هنوز تأیید نشده است. برای افزودن مطلب و برخی فعالیت‌ها باید ایمیل خود را تأیید کنید.
    </div>
  );
}

export { UnverifiedEmailNotice };
