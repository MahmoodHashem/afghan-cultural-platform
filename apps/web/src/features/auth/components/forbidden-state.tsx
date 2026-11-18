type ForbiddenStateProps = {
  title?: string;
  description?: string;
};

function ForbiddenState({
  title = "دسترسی مجاز نیست",
  description = "شما به این بخش دسترسی ندارید.",
}: ForbiddenStateProps) {
  return (
    <section className="mx-auto flex min-h-70 w-full max-w-lg items-center justify-center px-6 py-10">
      <div className="rounded-card border border-line-soft bg-surface p-6 text-center shadow-card">
        <h1 className="text-card-title text-ink">{title}</h1>
        <p className="mt-2 text-[14.5px] leading-[2] text-copy">{description}</p>
      </div>
    </section>
  );
}

export { ForbiddenState };
