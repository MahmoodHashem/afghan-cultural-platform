function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 text-[14px] text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      <span>{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export { AuthDivider };
