type FieldErrorProps = {
  id: string;
  message?: string;
};

function FieldError({ id, message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="text-[13px] leading-6 text-destructive" role="alert">
      {message}
    </p>
  );
}

export { FieldError };
