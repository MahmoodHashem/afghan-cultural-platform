type JsonLdPrimitive = boolean | number | string | null;
type JsonLdValue = JsonLdPrimitive | JsonLdValue[] | { [key: string]: JsonLdValue | undefined };

type JsonLdProps = {
  data: JsonLdValue;
};

function serializeJsonLd(data: JsonLdValue): string {
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}

function JsonLd({ data }: JsonLdProps) {
  if (!isSiteIndexingEnabled()) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      // JSON-LD is serialized from typed server data and escapes HTML-opening characters.
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires raw script content.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

export type { JsonLdValue };
export { JsonLd, serializeJsonLd };

import "server-only";

import { isSiteIndexingEnabled } from "./metadata";
