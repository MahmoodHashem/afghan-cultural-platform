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
const seoMetadata = read("src/lib/seo/metadata.ts");
const homePage = read("src/app/page.tsx");
const explorePage = read("src/app/(public)/explore/page.tsx");
const categoryPage = read("src/app/(public)/categories/[slug]/page.tsx");
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
  assert.doesNotMatch(robotsRoute, /sitemap/);
});

test("global metadata uses Persian defaults and a safe title template", () => {
  assert.match(rootLayout, /template: "%s \| میراث افغانستان"/);
  assert.match(rootLayout, /applicationName: "میراث افغانستان"/);
  assert.match(rootLayout, /جایی برای خواندن، ثبت و شناخت فرهنگ/);
  assert.match(rootLayout, /publicOpenGraphDefaults/);
  assert.match(homePage, /title: \{ absolute: "میراث افغانستان \| فرهنگ و تاریخ افغانستان" \}/);
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
