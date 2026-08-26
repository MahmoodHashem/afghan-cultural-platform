function getPublicApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_API_URL. Add it to apps/web/.env.local or use apps/web/.env.example as a guide.",
    );
  }

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");

  if (process.env.NODE_ENV !== "development" || typeof window === "undefined") {
    return normalizedBaseUrl;
  }

  const apiUrl = new URL(normalizedBaseUrl);
  const pageHostname = window.location.hostname;

  if (
    (apiUrl.hostname === "localhost" || apiUrl.hostname === "127.0.0.1") &&
    pageHostname !== "localhost" &&
    pageHostname !== "127.0.0.1"
  ) {
    apiUrl.hostname = pageHostname;
  }

  return apiUrl.toString().replace(/\/+$/, "");
}

export { getPublicApiBaseUrl };
