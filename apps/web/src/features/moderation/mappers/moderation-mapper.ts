import type { TaxonomyItem } from "@/features/entries/types/public-entry";
import type {
  ModerationSnapshot,
  ModerationSnapshotImage,
  ModerationSnapshotReference,
  ModerationSnapshotSource,
  ModerationSnapshotVideo,
  ModerationSubmission,
  ModerationSubmissionDto,
} from "@/features/moderation/types/moderation";

function mapModerationSubmission(submission: ModerationSubmissionDto): ModerationSubmission {
  const snapshot = mapModerationSnapshot(submission.submittedVersion?.snapshot);

  return {
    ...submission,
    title: snapshot?.title ?? "بدون عنوان",
    summary: snapshot?.summary ?? "خلاصه این نسخه در دسترس نیست.",
    snapshot,
  };
}

function mapModerationSnapshot(value: unknown): ModerationSnapshot | null {
  if (!isRecord(value)) {
    return null;
  }

  const category = mapTaxonomy(value.category);
  const contentType = mapTaxonomy(value.contentType);
  const geographicScope = readGeographicScope(value.geographicScope);

  if (
    typeof value.title !== "string" ||
    typeof value.summary !== "string" ||
    !category ||
    !contentType ||
    !geographicScope
  ) {
    return null;
  }

  return {
    title: value.title,
    summary: value.summary,
    contentJson: value.contentJson,
    plainTextContent: typeof value.plainTextContent === "string" ? value.plainTextContent : "",
    geographicScope,
    province: mapTaxonomy(value.province),
    district: mapTaxonomy(value.district),
    category,
    contentType,
    villageOrLocation: readNullableString(value.villageOrLocation),
    tags: readArray(value.tags).flatMap((item) => {
      const tag = mapTaxonomy(item);
      return tag ? [tag] : [];
    }),
    sources: readArray(value.sources).flatMap((item) => {
      const source = mapSource(item);
      return source ? [source] : [];
    }),
    images: readArray(value.images)
      .flatMap((item) => {
        const image = mapImage(item);
        return image ? [image] : [];
      })
      .sort((first, second) => first.displayOrder - second.displayOrder),
    youtubeVideo: mapVideo(value.youtubeVideo),
    internalReferences: readArray(value.internalReferences).flatMap((item) => {
      const reference = mapReference(item);
      return reference ? [reference] : [];
    }),
  };
}

function mapTaxonomy(value: unknown): TaxonomyItem | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    typeof value.slug !== "string"
  ) {
    return null;
  }

  return { id: value.id, name: value.name, slug: value.slug };
}

function mapImage(value: unknown): ModerationSnapshotImage | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.secureUrl !== "string" ||
    typeof value.altText !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    secureUrl: value.secureUrl,
    thumbnailUrl: readNullableString(value.thumbnailUrl),
    width: readNullableNumber(value.width),
    height: readNullableNumber(value.height),
    caption: readNullableString(value.caption),
    altText: value.altText,
    photographerOrSource: readNullableString(value.photographerOrSource),
    permissionConfirmed: value.permissionConfirmed === true,
    displayOrder: readNumber(value.displayOrder, 0),
  };
}

function mapSource(value: unknown): ModerationSnapshotSource | null {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.type !== "string") {
    return null;
  }

  return {
    id: value.id,
    type: value.type,
    title: readNullableString(value.title),
    authorOrProvider: readNullableString(value.authorOrProvider),
    publicationDate: readNullableString(value.publicationDate),
    websiteUrl: readNullableString(value.websiteUrl),
    bookOrArticleDetails: readNullableString(value.bookOrArticleDetails),
    interviewDate: readNullableString(value.interviewDate),
    explanation: readNullableString(value.explanation),
    displayOrder: readNumber(value.displayOrder, 0),
  };
}

function mapVideo(value: unknown): ModerationSnapshotVideo | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.videoId !== "string" ||
    typeof value.url !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    videoId: value.videoId,
    url: value.url,
    title: readNullableString(value.title),
    description: readNullableString(value.description),
  };
}

function mapReference(value: unknown): ModerationSnapshotReference | null {
  if (
    !isRecord(value) ||
    typeof value.targetEntryId !== "string" ||
    typeof value.targetTitle !== "string" ||
    typeof value.anchorText !== "string"
  ) {
    return null;
  }

  return {
    targetEntryId: value.targetEntryId,
    targetSlug: readNullableString(value.targetSlug),
    targetTitle: value.targetTitle,
    anchorText: value.anchorText,
  };
}

function readGeographicScope(value: unknown) {
  return value === "PROVINCE" || value === "NATIONAL" || value === "NONE" ? value : null;
}

function readArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function readNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readNullableNumber(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === "number" ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export { mapModerationSnapshot, mapModerationSubmission };
