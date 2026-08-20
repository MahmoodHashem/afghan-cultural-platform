function AuthLoadingState() {
  return (
    <div
      className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-6 py-10"
      aria-live="polite"
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary"
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}

export { AuthLoadingState };
