import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const webRoot = process.cwd();

function read(relativePath) {
  return readFileSync(resolve(webRoot, relativePath), "utf8");
}

const cacheTag = read("src/lib/cache/public-entry-cache.ts");
const revalidationRoute = read("src/app/api/internal/revalidate-public-entries/route.ts");
const publicEntriesApi = read("src/features/entries/api/public-entries-api.ts");
const homeApi = read("src/features/home/api/home-api.ts");
const envExample = read(".env.example");

test("published entry fetches share one tag and retain time-based revalidation", () => {
  assert.match(cacheTag, /PUBLIC_ENTRIES_CACHE_TAG = "public-entries"/);
  assert.match(publicEntriesApi, /tags: \[PUBLIC_ENTRIES_CACHE_TAG\]/);
  assert.match(publicEntriesApi, /revalidate: 120/);
  assert.match(publicEntriesApi, /options\?\.revalidate \?\? 120/);
  assert.match(homeApi, /\[\s*PUBLIC_ENTRIES_CACHE_TAG,?\s*\]/);
  assert.match(homeApi, /revalidate: 120/);
});

test("the internal route authenticates a fixed-purpose immediate invalidation", () => {
  assert.match(revalidationRoute, /request\.headers\.get\("authorization"\)/);
  assert.match(revalidationRoute, /timingSafeEqual/);
  assert.match(revalidationRoute, /status: 401/);
  assert.match(revalidationRoute, /revalidateTag\(PUBLIC_ENTRIES_CACHE_TAG, \{ expire: 0 \}\)/);
  assert.match(revalidationRoute, /Cache-Control": "no-store, max-age=0"/);
  assert.doesNotMatch(revalidationRoute, /searchParams|request\.json/);
  assert.match(envExample, /CACHE_REVALIDATION_SECRET=/);
});
