import type { Prisma } from "@/generated/prisma/client";

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
} as const;

type EntryPayload = Prisma.CulturalEntryGetPayload<{ select: typeof entrySelect }>;

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
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

export type { EntryPayload };
export { entrySelect, mapEntry };
