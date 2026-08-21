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

const publicSourceSelect = {
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
} as const;

const imageSelect = {
  id: true,
  cloudinaryPublicId: true,
  url: true,
  secureUrl: true,
  thumbnailUrl: true,
  width: true,
  height: true,
  format: true,
  bytes: true,
  caption: true,
  altText: true,
  photographerOrSource: true,
  permissionConfirmed: true,
  displayOrder: true,
  createdAt: true,
  updatedAt: true,
} as const;

const publicImageSelect = {
  id: true,
  secureUrl: true,
  thumbnailUrl: true,
  width: true,
  height: true,
  caption: true,
  altText: true,
  photographerOrSource: true,
  displayOrder: true,
} as const;

const youtubeVideoSelect = {
  id: true,
  videoId: true,
  url: true,
  title: true,
  description: true,
  isRemoved: true,
  createdAt: true,
  updatedAt: true,
} as const;

const publicYoutubeVideoSelect = {
  id: true,
  videoId: true,
  url: true,
  title: true,
  description: true,
  isRemoved: true,
} as const;

const contentVersionSelect = {
  id: true,
  entryId: true,
  versionNumber: true,
  snapshot: true,
  plainTextContent: true,
  versionReason: true,
  createdById: true,
  correctionSuggestionId: true,
  moderationReviewId: true,
  createdAt: true,
} as const;

const entryReferenceTargetSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  publishedAt: true,
} as const;

const outgoingEntryReferenceSelect = {
  id: true,
  sourceEntryId: true,
  targetEntryId: true,
  anchorText: true,
  createdAt: true,
  targetEntry: {
    select: entryReferenceTargetSelect,
  },
} as const;

const incomingEntryReferenceSelect = {
  id: true,
  sourceEntryId: true,
  targetEntryId: true,
  anchorText: true,
  createdAt: true,
  sourceEntry: {
    select: {
      id: true,
      slug: true,
      title: true,
    },
  },
} as const;

const entryTagOrderBy: Prisma.EntryTagOrderByWithRelationInput = {
  createdAt: "asc",
};

const imageOrderBy: Prisma.ImageOrderByWithRelationInput[] = [
  { displayOrder: "asc" },
  { createdAt: "asc" },
];

const sourceOrderBy: Prisma.SourceOrderByWithRelationInput[] = [
  { displayOrder: "asc" },
  { createdAt: "asc" },
];

const publishedEntryWhere = {
  status: "PUBLISHED",
  publishedAt: {
    not: null,
  },
} as const;

const entrySelect = {
  id: true,
  key: true,
  slug: true,
  title: true,
  summary: true,
  contentJson: true,
  plainTextContent: true,
  status: true,
  geographicScope: true,
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
  images: {
    where: {
      isRemoved: false,
    },
    select: imageSelect,
    orderBy: imageOrderBy,
  },
  youtubeVideo: {
    select: youtubeVideoSelect,
  },
  moderationReviews: {
    select: {
      id: true,
      decision: true,
      comments: true,
      previousStatus: true,
      nextStatus: true,
      createdAt: true,
      moderator: {
        select: {
          id: true,
          displayName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 1,
  },
} as const;

const publicEntryCardSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  _count: {
    select: {
      bookmarks: true,
      likes: true,
    },
  },
  geographicScope: true,
  publishedAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      displayName: true,
      profileImageUrl: true,
    },
  },
  province: {
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
  images: {
    where: {
      isRemoved: false,
    },
    select: publicImageSelect,
    orderBy: imageOrderBy,
    take: 1,
  },
} as const;

const publicEntryDetailSelect = {
  ...publicEntryCardSelect,
  contentJson: true,
  plainTextContent: true,
  villageOrLocation: true,
  district: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  images: {
    where: {
      isRemoved: false,
    },
    select: publicImageSelect,
    orderBy: imageOrderBy,
  },
  sources: {
    select: publicSourceSelect,
    orderBy: sourceOrderBy,
  },
  youtubeVideo: {
    select: publicYoutubeVideoSelect,
  },
  outgoingReferences: {
    where: {
      targetEntry: publishedEntryWhere,
    },
    select: {
      id: true,
      targetEntryId: true,
      anchorText: true,
      targetEntry: {
        select: {
          id: true,
          slug: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  },
  incomingReferences: {
    where: {
      sourceEntry: publishedEntryWhere,
    },
    select: {
      id: true,
      sourceEntryId: true,
      anchorText: true,
      sourceEntry: {
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          publishedAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  },
} as const;

type EntryPayload = Prisma.CulturalEntryGetPayload<{ select: typeof entrySelect }>;
type ContentVersionPayload = Prisma.ContentVersionGetPayload<{
  select: typeof contentVersionSelect;
}>;
type IncomingEntryReferencePayload = Prisma.EntryReferenceGetPayload<{
  select: typeof incomingEntryReferenceSelect;
}>;
type ImagePayload = Prisma.ImageGetPayload<{ select: typeof imageSelect }>;
type OutgoingEntryReferencePayload = Prisma.EntryReferenceGetPayload<{
  select: typeof outgoingEntryReferenceSelect;
}>;
type PublicEntryCardPayload = Prisma.CulturalEntryGetPayload<{
  select: typeof publicEntryCardSelect;
}>;
type PublicEntryDetailPayload = Prisma.CulturalEntryGetPayload<{
  select: typeof publicEntryDetailSelect;
}>;
type SourcePayload = Prisma.SourceGetPayload<{ select: typeof sourceSelect }>;
type YouTubeVideoPayload = Prisma.YouTubeVideoGetPayload<{ select: typeof youtubeVideoSelect }>;

function mapEntry(entry: EntryPayload) {
  return {
    id: entry.id,
    key: entry.key,
    slug: entry.slug,
    title: entry.title,
    summary: entry.summary,
    contentJson: entry.contentJson,
    plainTextContent: entry.plainTextContent,
    status: entry.status,
    geographicScope: entry.geographicScope,
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
    images: entry.images.map(mapImage),
    youtubeVideo:
      entry.youtubeVideo && !entry.youtubeVideo.isRemoved
        ? mapYouTubeVideo(entry.youtubeVideo)
        : null,
    latestModerationReview: entry.moderationReviews?.[0] ?? null,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

function mapContentVersion(version: ContentVersionPayload) {
  return {
    id: version.id,
    entryId: version.entryId,
    versionNumber: version.versionNumber,
    snapshot: version.snapshot,
    plainTextContent: version.plainTextContent,
    versionReason: version.versionReason,
    createdById: version.createdById,
    correctionSuggestionId: version.correctionSuggestionId,
    moderationReviewId: version.moderationReviewId,
    createdAt: version.createdAt,
  };
}

function mapImage(image: ImagePayload) {
  return {
    id: image.id,
    cloudinaryPublicId: image.cloudinaryPublicId,
    url: image.url,
    secureUrl: image.secureUrl,
    thumbnailUrl: image.thumbnailUrl,
    width: image.width,
    height: image.height,
    format: image.format,
    bytes: image.bytes,
    caption: image.caption,
    altText: image.altText,
    photographerOrSource: image.photographerOrSource,
    permissionConfirmed: image.permissionConfirmed,
    displayOrder: image.displayOrder,
    createdAt: image.createdAt,
    updatedAt: image.updatedAt,
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

function mapYouTubeVideo(video: YouTubeVideoPayload) {
  return {
    id: video.id,
    videoId: video.videoId,
    url: video.url,
    title: video.title,
    description: video.description,
    createdAt: video.createdAt,
    updatedAt: video.updatedAt,
  };
}

function mapPublicEntryCard(entry: PublicEntryCardPayload) {
  return {
    id: entry.id,
    slug: requirePublicSlug(entry.slug),
    title: entry.title,
    summary: entry.summary,
    coverImage: entry.images[0] ? mapPublicImage(entry.images[0]) : null,
    geographicScope: entry.geographicScope,
    province: entry.province,
    category: entry.category,
    contentType: entry.contentType,
    tags: entry.tags.map((entryTag) => entryTag.tag),
    author: entry.author,
    publishedAt: requirePublishedAt(entry.publishedAt),
    updatedAt: entry.updatedAt,
    bookmarkCount: entry._count.bookmarks,
    likeCount: entry._count.likes,
  };
}

function mapPublicEntryDetail(entry: PublicEntryDetailPayload) {
  const card = mapPublicEntryCard({
    ...entry,
    images: entry.images.slice(0, 1),
  });

  return {
    ...card,
    contentJson: entry.contentJson,
    plainTextContent: entry.plainTextContent,
    district: entry.district,
    villageOrLocation: entry.villageOrLocation,
    images: entry.images.map(mapPublicImage),
    sources: entry.sources.map(mapPublicSource),
    youtubeVideo:
      entry.youtubeVideo && !entry.youtubeVideo.isRemoved
        ? mapPublicYouTubeVideo(entry.youtubeVideo)
        : null,
    outgoingReferences: entry.outgoingReferences.map((reference) => ({
      id: reference.id,
      targetEntryId: reference.targetEntryId,
      anchorText: reference.anchorText,
      targetEntry: {
        id: reference.targetEntry.id,
        slug: requirePublicSlug(reference.targetEntry.slug),
        title: reference.targetEntry.title,
      },
    })),
    incomingReferences: entry.incomingReferences.map((reference) => ({
      id: reference.id,
      sourceEntryId: reference.sourceEntryId,
      anchorText: reference.anchorText,
      sourceEntry: {
        id: reference.sourceEntry.id,
        slug: requirePublicSlug(reference.sourceEntry.slug),
        title: reference.sourceEntry.title,
        summary: reference.sourceEntry.summary,
        publishedAt: requirePublishedAt(reference.sourceEntry.publishedAt),
      },
    })),
    seo: {
      title: entry.title,
      summary: entry.summary,
      canonicalSlug: requirePublicSlug(entry.slug),
      image: entry.images[0]?.thumbnailUrl ?? entry.images[0]?.secureUrl ?? null,
      author: entry.author.displayName,
      publishedAt: requirePublishedAt(entry.publishedAt),
      modifiedAt: entry.updatedAt,
      taxonomy: [entry.province, entry.category, entry.contentType].filter(
        (taxonomy) => taxonomy !== null,
      ),
      plainTextExcerpt: createPlainTextExcerpt(entry.plainTextContent),
    },
  };
}

function mapPublicImage(image: PublicEntryDetailPayload["images"][number]) {
  return {
    id: image.id,
    secureUrl: image.secureUrl,
    thumbnailUrl: image.thumbnailUrl,
    width: image.width,
    height: image.height,
    caption: image.caption,
    altText: image.altText,
    photographerOrSource: image.photographerOrSource,
    displayOrder: image.displayOrder,
  };
}

function mapPublicSource(source: PublicEntryDetailPayload["sources"][number]) {
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
  };
}

function mapPublicYouTubeVideo(video: NonNullable<PublicEntryDetailPayload["youtubeVideo"]>) {
  return {
    id: video.id,
    videoId: video.videoId,
    url: video.url,
    title: video.title,
    description: video.description,
  };
}

function requirePublicSlug(slug: string | null): string {
  return slug ?? "";
}

function requirePublishedAt(publishedAt: Date | null): Date {
  return publishedAt ?? new Date(0);
}

function createPlainTextExcerpt(plainText: string): string {
  return plainText.trim().replace(/\s+/g, " ").slice(0, 220);
}

function mapOutgoingEntryReference(reference: OutgoingEntryReferencePayload) {
  return {
    id: reference.id,
    sourceEntryId: reference.sourceEntryId,
    targetEntryId: reference.targetEntryId,
    anchorText: reference.anchorText,
    createdAt: reference.createdAt,
    targetEntry: reference.targetEntry,
  };
}

function mapIncomingEntryReference(reference: IncomingEntryReferencePayload) {
  return {
    id: reference.id,
    sourceEntryId: reference.sourceEntryId,
    targetEntryId: reference.targetEntryId,
    anchorText: reference.anchorText,
    createdAt: reference.createdAt,
    sourceEntry: reference.sourceEntry,
  };
}

export type {
  ContentVersionPayload,
  EntryPayload,
  ImagePayload,
  IncomingEntryReferencePayload,
  OutgoingEntryReferencePayload,
  PublicEntryCardPayload,
  PublicEntryDetailPayload,
  SourcePayload,
  YouTubeVideoPayload,
};
export {
  contentVersionSelect,
  entryReferenceTargetSelect,
  entrySelect,
  imageSelect,
  incomingEntryReferenceSelect,
  mapContentVersion,
  mapEntry,
  mapImage,
  mapIncomingEntryReference,
  mapOutgoingEntryReference,
  mapPublicEntryCard,
  mapPublicEntryDetail,
  mapSource,
  mapYouTubeVideo,
  outgoingEntryReferenceSelect,
  publicEntryCardSelect,
  publicEntryDetailSelect,
  sourceSelect,
  youtubeVideoSelect,
};
