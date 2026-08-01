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
type SourcePayload = Prisma.SourceGetPayload<{ select: typeof sourceSelect }>;
type YouTubeVideoPayload = Prisma.YouTubeVideoGetPayload<{ select: typeof youtubeVideoSelect }>;

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
    images: entry.images.map(mapImage),
    youtubeVideo:
      entry.youtubeVideo && !entry.youtubeVideo.isRemoved
        ? mapYouTubeVideo(entry.youtubeVideo)
        : null,
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
  mapSource,
  mapYouTubeVideo,
  outgoingEntryReferenceSelect,
  sourceSelect,
  youtubeVideoSelect,
};
