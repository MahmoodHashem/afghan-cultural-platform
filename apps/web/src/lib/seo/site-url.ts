const LOCAL_SITE_URL = "http://localhost:3000";

/** Resolves the canonical site origin used by Next.js metadata. */
function getPublicSiteUrl(): URL {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ?? process.env.VERCEL_URL?.trim();
  const candidate = configuredUrl ?? (vercelUrl ? `https://${vercelUrl}` : LOCAL_SITE_URL);
  const url = new URL(candidate);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_SITE_URL must use http or https.");
  }

  return new URL(url.origin);
}

export { getPublicSiteUrl };
