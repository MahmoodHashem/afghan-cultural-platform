import { ExclamationCircleIcon } from "@heroicons/react/20/solid";

type FieldErrorProps = {
  id: string;
  message?: string;
};

/** Field-level error: red text plus an icon, so the state is not conveyed by colour alone. */
function FieldError({ id, message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      id={id}
      className="mt-1.5 flex items-start gap-1.5 text-[12.5px] leading-6 text-brand-ink"
      role="alert"
    >
      <ExclamationCircleIcon className="mt-1 size-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}

export { FieldError };
