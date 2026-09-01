import "server-only";

import type { JsonLdValue } from "./json-ld";
import { createAbsoluteUrl, DEFAULT_SOCIAL_IMAGE, SITE_DESCRIPTION, SITE_NAME } from "./metadata";

type BreadcrumbInput = {
  name: string;
  path: string;
};

type CollectionItemInput = {
  name: string;
  path: string;
};

type CollectionStructuredDataInput = {
  name: string;
  description: string;
  canonicalPath: string;
  breadcrumbs: BreadcrumbInput[];
  items: CollectionItemInput[];
  totalItems: number;
};

type ArticleStructuredDataInput = {
  headline: string;
  description: string;
  canonicalPath: string;
  authorName: string;
  publishedAt: string;
  modifiedAt: string;
  images: string[];
  category: string;
  tags: string[];
};

function createOrganizationEntity(): JsonLdValue {
  return {
    "@type": "Organization",
    "@id": createAbsoluteUrl("/#organization"),
    name: SITE_NAME,
    url: createAbsoluteUrl("/"),
    description: SITE_DESCRIPTION,
    logo: {
      "@type": "ImageObject",
      url: createAbsoluteUrl("/images/small-logo.png"),
      width: 455,
      height: 520,
    },
  };
}

function createHomeStructuredData(): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@graph": [
      createOrganizationEntity(),
      {
        "@type": "WebSite",
        "@id": createAbsoluteUrl("/#website"),
        name: SITE_NAME,
        url: createAbsoluteUrl("/"),
        description: SITE_DESCRIPTION,
        inLanguage: "fa-AF",
        publisher: { "@id": createAbsoluteUrl("/#organization") },
      },
    ],
  };
}

function createCollectionStructuredData({
  name,
  description,
  canonicalPath,
  breadcrumbs,
  items,
  totalItems,
}: CollectionStructuredDataInput): JsonLdValue {
  const pageUrl = createAbsoluteUrl(canonicalPath);
  const breadcrumbId = `${pageUrl}#breadcrumb`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#collection`,
        url: pageUrl,
        name,
        description,
        inLanguage: "fa-AF",
        isPartOf: { "@id": createAbsoluteUrl("/#website") },
        breadcrumb: { "@id": breadcrumbId },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: totalItems,
          itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            url: createAbsoluteUrl(item.path),
          })),
        },
      },
      createBreadcrumbEntity(breadcrumbId, breadcrumbs),
    ],
  };
}

function createArticleStructuredData({
  headline,
  description,
  canonicalPath,
  authorName,
  publishedAt,
  modifiedAt,
  images,
  category,
  tags,
}: ArticleStructuredDataInput): JsonLdValue {
  const pageUrl = createAbsoluteUrl(canonicalPath);
  const breadcrumbId = `${pageUrl}#breadcrumb`;
  const articleImages = images.length > 0 ? images : [DEFAULT_SOCIAL_IMAGE.url];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
        url: pageUrl,
        headline,
        description,
        image: articleImages.map(createAbsoluteUrl),
        datePublished: publishedAt,
        dateModified: modifiedAt,
        inLanguage: "fa-AF",
        isAccessibleForFree: true,
        articleSection: category,
        keywords: tags,
        author: { "@type": "Person", name: authorName },
        publisher: createOrganizationEntity(),
      },
      createBreadcrumbEntity(breadcrumbId, [
        { name: "خانه", path: "/" },
        { name: "مطالب", path: "/explore" },
        { name: headline, path: canonicalPath },
      ]),
    ],
  };
}

function createBreadcrumbEntity(id: string, items: BreadcrumbInput[]): JsonLdValue {
  return {
    "@type": "BreadcrumbList",
    "@id": id,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: createAbsoluteUrl(item.path),
    })),
  };
}

export type {
  ArticleStructuredDataInput,
  BreadcrumbInput,
  CollectionItemInput,
  CollectionStructuredDataInput,
};
export { createArticleStructuredData, createCollectionStructuredData, createHomeStructuredData };
