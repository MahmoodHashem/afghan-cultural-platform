function getPublicApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_API_URL. Add it to apps/web/.env.local or use apps/web/.env.example as a guide.",
    );
  }

  return baseUrl.replace(/\/+$/, "");
}

export { getPublicApiBaseUrl };
