function AuthLoadingState() {
  return (
    <div
      className="mx-auto flex min-h-[280px] w-full max-w-md items-center justify-center px-6 py-10"
      aria-live="polite"
    >
      <div className="w-full space-y-4 rounded-card border bg-card p-6 shadow-sm">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export { AuthLoadingState };
