const AUTH_EVENT_CHANNEL = "afghan-cultural-platform:auth-events";

type AuthEvent = {
  type: "email-verified";
  userId: string;
};

function publishAuthEvent(event: AuthEvent): void {
  if (typeof BroadcastChannel === "undefined") return;

  const channel = new BroadcastChannel(AUTH_EVENT_CHANNEL);
  channel.postMessage(event);
  channel.close();
}

function subscribeToAuthEvents(listener: (event: AuthEvent) => void): () => void {
  if (typeof BroadcastChannel === "undefined") return () => undefined;

  const channel = new BroadcastChannel(AUTH_EVENT_CHANNEL);
  channel.addEventListener("message", (message: MessageEvent<unknown>) => {
    const event = parseAuthEvent(message.data);
    if (event) listener(event);
  });

  return () => channel.close();
}

function parseAuthEvent(value: unknown): AuthEvent | null {
  if (!value || typeof value !== "object") return null;
  const event = value as Record<string, unknown>;

  return event.type === "email-verified" && typeof event.userId === "string"
    ? { type: "email-verified", userId: event.userId }
    : null;
}

export { publishAuthEvent, subscribeToAuthEvents };
