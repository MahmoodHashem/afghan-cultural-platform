function VerifiedEmailBanner() {
  return (
    <aside className="rounded-card border border-warning/30 bg-warning/10 px-4 py-3 text-[14px] leading-7 text-foreground">
      <p className="font-semibold text-warning">ایمیل شما هنوز تأیید نشده است.</p>
      <p className="mt-1 text-muted-foreground">
        می‌توانید وارد حساب شوید؛ اما برای افزودن مطلب، گزارش، امتیازدهی و نوشتن دیدگاه باید ایمیل
        خود را تأیید کنید.
      </p>
    </aside>
  );
}

export { VerifiedEmailBanner };
