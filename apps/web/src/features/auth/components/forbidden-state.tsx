type ForbiddenStateProps = {
  title?: string;
  description?: string;
};

function ForbiddenState({
  title = "دسترسی مجاز نیست",
  description = "حساب شما اجازه دسترسی به این بخش را ندارد.",
}: ForbiddenStateProps) {
  return (
    <section className="mx-auto flex min-h-70 w-full max-w-lg items-center justify-center px-6 py-10">
      <div className="rounded-card border bg-card p-6 text-center shadow-sm">
        <h1 className="text-card-title text-foreground">{title}</h1>
        <p className="mt-2 text-[15px] leading-7 text-muted-foreground">{description}</p>
      </div>
    </section>
  );
}

export { ForbiddenState };
