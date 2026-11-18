function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 text-[12.5px] text-faint">
      <span className="h-px flex-1 bg-line" />
      <span>{label}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export { AuthDivider };
