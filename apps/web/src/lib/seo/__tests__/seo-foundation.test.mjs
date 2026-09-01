import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const webRoot = process.cwd();

function read(relativePath) {
  return readFileSync(resolve(webRoot, relativePath), "utf8");
}

const rootLayout = read("src/app/layout.tsx");
const robotsRoute = read("src/app/robots.ts");
const sitemapRoute = read("src/app/sitemap.ts");
const publicEntriesApi = read("src/features/entries/api/public-entries-api.ts");
const seoMetadata = read("src/lib/seo/metadata.ts");
const jsonLd = read("src/lib/seo/json-ld.tsx");
const structuredData = read("src/lib/seo/structured-data.ts");
const homePage = read("src/app/page.tsx");
const explorePage = read("src/app/(public)/explore/page.tsx");
const categoriesPage = read("src/app/(public)/categories/page.tsx");
const categoryPage = read("src/app/(public)/categories/[slug]/page.tsx");
const provincesPage = read("src/app/(public)/provinces/page.tsx");
const provincePage = read("src/app/(public)/provinces/[slug]/page.tsx");
const entryPage = read("src/app/(public)/entries/[slug]/page.tsx");
const authLayout = read("src/app/(auth)/layout.tsx");
const profileLayout = read("src/app/(profile)/layout.tsx");
const contributionLayout = read("src/app/(contribute)/layout.tsx");
const moderatorLayout = read("src/app/(moderator)/layout.tsx");
const adminLayout = read("src/app/(admin)/admin/layout.tsx");
const envExample = read(".env.example");

test("indexing requires an explicit production-only flag", () => {
  assert.match(seoMetadata, /process\.env\.NODE_ENV === "production"/);
  assert.match(seoMetadata, /process\.env\.SITE_INDEXING_ENABLED === "true"/);
  assert.match(envExample, /SITE_INDEXING_ENABLED=false/);
  assert.match(rootLayout, /robots: createRobotsMetadata\(\)/);
});

test("robots blocks non-production deployments and allows the canonical production host", () => {
  assert.match(robotsRoute, /disallow: "\/"/);
  assert.match(robotsRoute, /allow: "\/"/);
  assert.match(robotsRoute, /host: siteUrl\.origin/);
  assert.match(robotsRoute, /sitemap: new URL\("\/sitemap\.xml", siteUrl\)\.toString\(\)/);
  assert.ok(robotsRoute.indexOf("sitemap:") > robotsRoute.indexOf("if (!isSiteIndexingEnabled())"));
});

test("global metadata uses Persian defaults and a safe title template", () => {
  assert.match(rootLayout, /template: "%s \| میراث افغانستان"/);
  assert.match(rootLayout, /applicationName: SITE_NAME/);
  assert.match(seoMetadata, /جایی برای خواندن، ثبت و شناخت فرهنگ/);
  assert.match(rootLayout, /createSocialMetadata/);
  assert.match(homePage, /title: \{ absolute: "میراث افغانستان \| فرهنگ و تاریخ افغانستان" \}/);
});

test("dynamic sitemap includes only canonical public discovery records", () => {
  assert.match(sitemapRoute, /if \(!isSiteIndexingEnabled\(\)\) \{\s+return \[\];/);
  assert.match(sitemapRoute, /export const revalidate = 3600/);
  assert.match(sitemapRoute, /SITEMAP_REVALIDATE_SECONDS = 3600/);
  assert.match(
    sitemapRoute,
    /STATIC_PUBLIC_PATHS = \["\/", "\/explore", "\/provinces", "\/categories"\]/,
  );
  assert.match(sitemapRoute, /getPublicProvinces\(\{ revalidate: SITEMAP_REVALIDATE_SECONDS \}\)/);
  assert.match(sitemapRoute, /getPublicCategories\(\{ revalidate: SITEMAP_REVALIDATE_SECONDS \}\)/);
  assert.match(sitemapRoute, /limit: SITEMAP_PAGE_SIZE/);
  assert.match(sitemapRoute, /revalidate: SITEMAP_REVALIDATE_SECONDS/);
  assert.match(publicEntriesApi, /options\?\.revalidate \?\? 120/);
  assert.match(sitemapRoute, /page <= firstPage\.meta\.totalPages/);
  assert.match(sitemapRoute, /lastModified: toValidDate\(entry\.updatedAt\)/);
  assert.match(sitemapRoute, /new Map\(records\.map/);
  assert.doesNotMatch(sitemapRoute, /admin|moderator|profile|entries\/new/);
});

test("social metadata provides canonical Open Graph and large Twitter previews", () => {
  assert.match(seoMetadata, /DEFAULT_SOCIAL_IMAGE/);
  assert.match(seoMetadata, /width: 1200/);
  assert.match(seoMetadata, /height: 675/);
  assert.match(seoMetadata, /url: canonicalPath/);
  assert.match(seoMetadata, /card: "summary_large_image"/);
  assert.match(entryPage, /article: \{/);
  assert.match(entryPage, /publishedTime: entry\.seo\.publishedAt/);
  assert.match(entryPage, /section: entry\.category\.name/);
  assert.match(provincePage, /image: \{ url: image\.src, alt: image\.alt \}/);
});

test("JSON-LD is safely serialized and uses the approved rich-result entities", () => {
  assert.match(jsonLd, /if \(!isSiteIndexingEnabled\(\)\) \{\s+return null;/);
  assert.match(jsonLd, /replaceAll\("<", "\\\\u003c"\)/);
  assert.match(jsonLd, /type="application\/ld\+json"/);
  for (const entity of ["Organization", "WebSite", "CollectionPage", "BreadcrumbList", "Article"]) {
    assert.match(structuredData, new RegExp(`"@type": "${entity}"`));
  }
  assert.match(structuredData, /inLanguage: "fa-AF"/);
  assert.match(structuredData, /isAccessibleForFree: true/);
  assert.doesNotMatch(structuredData, /sameAs|aggregateRating|reviewRating|PostalAddress/);
});

test("public pages render the matching structured data only on clean collections", () => {
  assert.match(homePage, /createHomeStructuredData\(\)/);
  assert.match(categoriesPage, /createCollectionStructuredData/);
  assert.match(provincesPage, /createCollectionStructuredData/);
  assert.match(explorePage, /!isFiltered && !entries\.isUnavailable/);
  assert.match(categoryPage, /!isFiltered && !entries\.isUnavailable/);
  assert.match(provincePage, /!isFiltered && !entries\.isUnavailable/);
  assert.match(entryPage, /createArticleStructuredData/);
  assert.match(structuredData, /\{ name: "مطالب", path: "\/explore" \}/);
});

test("clean public routes expose canonical URLs", () => {
  assert.match(homePage, /alternates: \{ canonical: "\/" \}/);
  assert.match(explorePage, /alternates: \{ canonical: "\/explore" \}/);
  assert.match(categoryPage, /createCanonicalPath\(\s*"categories"/);
  assert.match(provincePage, /createCanonicalPath\(\s*"provinces"/);
  assert.match(entryPage, /createCanonicalPath\("entries", entry\.seo\.canonicalSlug\)/);
});

test("functional public query variants are noindexed without treating tracking params as filters", () => {
  assert.match(explorePage, /EXPLORE_FUNCTIONAL_SEARCH_PARAMS/);
  assert.match(categoryPage, /CATEGORY_FUNCTIONAL_SEARCH_PARAMS/);
  assert.match(provincePage, /PROVINCE_FUNCTIONAL_SEARCH_PARAMS/);
  assert.match(explorePage, /createRobotsMetadata\(!isFiltered\)/);
  assert.match(categoryPage, /createRobotsMetadata\(!isFiltered\)/);
  assert.match(provincePage, /createRobotsMetadata\(!isFiltered\)/);
  assert.doesNotMatch(explorePage, /utm_source/);
});

test("private route groups remain noindex and missing public resources stay excluded", () => {
  for (const layout of [
    authLayout,
    profileLayout,
    contributionLayout,
    moderatorLayout,
    adminLayout,
  ]) {
    assert.match(layout, /robots: \{ index: false, follow: false \}/);
  }

  assert.match(entryPage, /robots: \{ index: false, follow: false \}/);
  assert.match(categoryPage, /robots: \{ index: false, follow: false \}/);
  assert.match(provincePage, /robots: \{ index: false, follow: false \}/);
});
