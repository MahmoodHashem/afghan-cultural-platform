function AdminPageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="space-y-1.5">
      <h1 className="text-[28px] font-bold leading-10 text-foreground sm:text-[34px]">{title}</h1>
      {description ? (
        <p className="text-[14px] leading-7 text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}

export { AdminPageHeader };
