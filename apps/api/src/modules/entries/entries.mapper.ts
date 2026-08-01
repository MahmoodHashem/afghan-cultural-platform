import type { Prisma } from "@/generated/prisma/client";

const sourceSelect = {
  id: true,
  type: true,
  title: true,
  authorOrProvider: true,
  publicationDate: true,
  websiteUrl: true,
  bookOrArticleDetails: true,
  interviewDate: true,
  explanation: true,
  displayOrder: true,
  createdAt: true,
  updatedAt: true,
} as const;

const entryTagOrderBy: Prisma.EntryTagOrderByWithRelationInput = {
  createdAt: "asc",
};

const sourceOrderBy: Prisma.SourceOrderByWithRelationInput[] = [
  { displayOrder: "asc" },
  { createdAt: "asc" },
];

const entrySelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  contentJson: true,
  plainTextContent: true,
  status: true,
  authorId: true,
  provinceId: true,
  districtId: true,
  categoryId: true,
  contentTypeId: true,
  villageOrLocation: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      displayName: true,
    },
  },
  province: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  district: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  contentType: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  tags: {
    select: {
      tag: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: entryTagOrderBy,
  },
  sources: {
    select: sourceSelect,
    orderBy: sourceOrderBy,
  },
} as const;

type EntryPayload = Prisma.CulturalEntryGetPayload<{ select: typeof entrySelect }>;
type SourcePayload = Prisma.SourceGetPayload<{ select: typeof sourceSelect }>;

function mapEntry(entry: EntryPayload) {
  return {
    id: entry.id,
    slug: entry.slug,
    title: entry.title,
    summary: entry.summary,
    contentJson: entry.contentJson,
    plainTextContent: entry.plainTextContent,
    status: entry.status,
    authorId: entry.authorId,
    provinceId: entry.provinceId,
    districtId: entry.districtId,
    categoryId: entry.categoryId,
    contentTypeId: entry.contentTypeId,
    villageOrLocation: entry.villageOrLocation,
    author: entry.author,
    province: entry.province,
    district: entry.district,
    category: entry.category,
    contentType: entry.contentType,
    tags: entry.tags.map((entryTag) => entryTag.tag),
    sources: entry.sources.map(mapSource),
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

function mapSource(source: SourcePayload) {
  return {
    id: source.id,
    type: source.type,
    title: source.title,
    authorOrProvider: source.authorOrProvider,
    publicationDate: source.publicationDate,
    websiteUrl: source.websiteUrl,
    bookOrArticleDetails: source.bookOrArticleDetails,
    interviewDate: source.interviewDate,
    explanation: source.explanation,
    displayOrder: source.displayOrder,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
}

export type { EntryPayload, SourcePayload };
export { entrySelect, mapEntry, mapSource, sourceSelect };
