import type { MetadataRoute } from "next";

import { isSiteIndexingEnabled } from "@/lib/seo/metadata";
import { getPublicSiteUrl } from "@/lib/seo/site-url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getPublicSiteUrl();

  if (!isSiteIndexingEnabled()) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
      host: siteUrl.origin,
    };
  }

  return {
    rules: [{ userAgent: "*", allow: "/" }],
    host: siteUrl.origin,
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
