import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

import { PUBLIC_ENTRIES_CACHE_TAG } from "@/lib/cache/public-entry-cache";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
} as const;

function secretsMatch(candidate: string, expected: string) {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);

  return (
    candidateBuffer.length === expectedBuffer.length &&
    timingSafeEqual(candidateBuffer, expectedBuffer)
  );
}

function readBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

async function POST(request: Request) {
  const expectedSecret = process.env.CACHE_REVALIDATION_SECRET;
  const suppliedSecret = readBearerToken(request);

  if (!expectedSecret || !suppliedSecret || !secretsMatch(suppliedSecret, expectedSecret)) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized." } },
      { status: 401, headers: NO_STORE_HEADERS },
    );
  }

  revalidateTag(PUBLIC_ENTRIES_CACHE_TAG, { expire: 0 });

  return Response.json(
    { data: { revalidated: true, tag: PUBLIC_ENTRIES_CACHE_TAG } },
    { headers: NO_STORE_HEADERS },
  );
}

export { POST };
