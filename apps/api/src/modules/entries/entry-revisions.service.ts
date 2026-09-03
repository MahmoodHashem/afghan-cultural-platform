import { randomUUID } from "node:crypto";

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { PublicEntryCacheService } from "../../common/cache/public-entry-cache.service";
import { PrismaService } from "../../database/prisma.service";
import type { Prisma } from "../../generated/prisma/client";
import {
  AuditAction,
  EntryRevisionStatus,
  EntryStatus,
  GeographicScope,
  ModerationDecision,
  type SourceType,
  VersionReason,
} from "../../generated/prisma/enums";
import { AuditService } from "../audit/audit.service";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { CloudinaryMediaService } from "../media/cloudinary-media.service";
import { isSupportedImageFile } from "../media/image-file.utils";
import type { UpdateEntryDraftDto } from "./dto/create-entry-draft.dto";
import type { UpdateEntryImageMetadataDto, UploadEntryImageDto } from "./dto/entry-images.dto";
import type { CreateEntrySourceDto, UpdateEntrySourceDto } from "./dto/entry-sources.dto";
import type { UpsertEntryYouTubeVideoDto } from "./dto/entry-youtube.dto";
import { ENTRY_ERROR_CODES } from "./entries.constants";
import { normalizeEntrySearchText } from "./utils/entry-slug.util";
import {
  extractInternalEntryReferences,
  extractPlainTextFromTiptap,
  TiptapValidationError,
} from "./utils/tiptap-content.util";
import { createCanonicalYouTubeUrl, extractYouTubeVideoId } from "./utils/youtube-url.util";

type TaxonomySnapshot = { id: string; name: string; slug: string };
type RevisionSource = {
  id: string;
  type: SourceType;
  title: string | null;
  authorOrProvider: string | null;
  publicationDate: string | null;
  websiteUrl: string | null;
  bookOrArticleDetails: string | null;
  interviewDate: string | null;
  explanation: string | null;
  displayOrder: number;
};
type RevisionImage = {
  id: string;
  cloudinaryPublicId: string;
  secureUrl: string;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  format: string | null;
  bytes: number | null;
  caption: string | null;
  altText: string;
  photographerOrSource: string | null;
  permissionConfirmed: boolean;
  displayOrder: number;
};
type RevisionSnapshot = {
  schemaVersion: number;
  entryId: string;
  key: string;
  slug: string;
  title: string;
  summary: string;
  contentJson: Prisma.JsonValue;
  plainTextContent: string;
  normalizedSearchText: string;
  geographicScope: GeographicScope;
  province: TaxonomySnapshot | null;
  district: TaxonomySnapshot | null;
  category: TaxonomySnapshot;
  contentType: TaxonomySnapshot;
  villageOrLocation: string | null;
  tags: TaxonomySnapshot[];
  sources: RevisionSource[];
  images: RevisionImage[];
  youtubeVideo: {
    id: string;
    videoId: string;
    url: string;
    title: string | null;
    description: string | null;
  } | null;
  internalReferences: Array<{
    targetEntryId: string;
    targetSlug: string;
    targetTitle: string;
    anchorText: string;
  }>;
  versionReason: VersionReason;
  creatorId: string;
  createdAt: string;
};

const activeRevisionStatuses = [
  EntryRevisionStatus.DRAFT,
  EntryRevisionStatus.PENDING_REVIEW,
  EntryRevisionStatus.CHANGES_REQUESTED,
  EntryRevisionStatus.REJECTED,
] as const;
const editableRevisionStatuses = new Set<EntryRevisionStatus>([
  EntryRevisionStatus.DRAFT,
  EntryRevisionStatus.CHANGES_REQUESTED,
  EntryRevisionStatus.REJECTED,
]);
const revisionEntrySelect = {
  id: true,
  key: true,
  slug: true,
  title: true,
  summary: true,
  contentJson: true,
  plainTextContent: true,
  normalizedSearchText: true,
  status: true,
  geographicScope: true,
  authorId: true,
  provinceId: true,
  districtId: true,
  categoryId: true,
  contentTypeId: true,
  villageOrLocation: true,
  publishedAt: true,
  publishedVersionId: true,
  province: { select: { id: true, name: true, slug: true } },
  district: { select: { id: true, name: true, slug: true } },
  category: { select: { id: true, name: true, slug: true } },
  contentType: { select: { id: true, name: true, slug: true } },
  tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
  sources: {
    select: {
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
    },
    orderBy: [{ displayOrder: "asc" as const }, { createdAt: "asc" as const }],
  },
  images: {
    where: { isRemoved: false, entryRevisionId: null },
    select: {
      id: true,
      cloudinaryPublicId: true,
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
    },
    orderBy: [{ displayOrder: "asc" as const }, { createdAt: "asc" as const }],
  },
  youtubeVideo: {
    select: {
      id: true,
      videoId: true,
      url: true,
      title: true,
      description: true,
      isRemoved: true,
    },
  },
  outgoingReferences: {
    select: {
      targetEntryId: true,
      anchorText: true,
      targetEntry: { select: { slug: true, title: true } },
    },
  },
} satisfies Prisma.CulturalEntrySelect;

const revisionInclude = {
  entry: {
    select: {
      id: true,
      key: true,
      slug: true,
      authorId: true,
      publishedAt: true,
      status: true,
      publishedVersionId: true,
      author: { select: { id: true, displayName: true } },
    },
  },
  createdBy: { select: { id: true, displayName: true } },
  requestedBy: { select: { id: true, displayName: true } },
  moderationReviews: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
    select: {
      id: true,
      decision: true,
      comments: true,
      createdAt: true,
      moderator: { select: { id: true, displayName: true } },
    },
  },
  contentVersions: {
    orderBy: { versionNumber: "desc" as const },
    take: 1,
    select: { id: true, versionNumber: true, createdAt: true },
  },
} satisfies Prisma.EntryRevisionInclude;

type EntryRevisionPayload = Prisma.EntryRevisionGetPayload<{ include: typeof revisionInclude }>;

@Injectable()
class EntryRevisionsService {
  private readonly logger = new Logger(EntryRevisionsService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuditService) private readonly auditService: AuditService,
    @Inject(CloudinaryMediaService) private readonly mediaService: CloudinaryMediaService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(PublicEntryCacheService)
    private readonly publicEntryCacheService: PublicEntryCacheService,
  ) {}

  async startOwnRevision(user: AuthenticatedUser, entryId: string) {
    try {
      const revision = await this.prisma.$transaction(async (tx) => {
        const existing = await this.findActiveRevision(tx, entryId);
        if (existing) {
          if (existing.entry.authorId !== user.id) {
            throw this.notFound();
          }
          return existing;
        }

        const entry = await this.findPublishedOwnedEntry(tx, user.id, entryId);
        const baseVersionId = await this.ensurePublishedVersion(tx, entry, user.id);
        const snapshot = this.createSnapshot(entry, user.id);
        const created = await tx.entryRevision.create({
          data: {
            entryId,
            status: EntryRevisionStatus.DRAFT,
            baseVersionId,
            workingSnapshot: snapshot as unknown as Prisma.InputJsonValue,
            plainTextContent: snapshot.plainTextContent,
            createdById: user.id,
          },
          include: revisionInclude,
        });
        await this.auditService.createWithClient(tx, {
          action: AuditAction.ENTRY_REVISION_STARTED,
          actorId: user.id,
          entryId,
          entryRevisionId: created.id,
          metadata: { revisionId: created.id, baseVersionId },
        });
        return created;
      }, this.transactionOptions());

      return { data: this.mapRevision(revision) };
    } catch (error) {
      if ((error as { code?: unknown }).code === "P2002") {
        return this.getOwnRevision(user, entryId);
      }
      throw error;
    }
  }

  async getOwnRevision(user: AuthenticatedUser, entryId: string) {
    const revision = await this.prisma.entryRevision.findFirst({
      where: { entryId, entry: { authorId: user.id }, status: { in: [...activeRevisionStatuses] } },
      include: revisionInclude,
    });
    if (!revision) throw this.notFound();
    return { data: this.mapRevision(revision) };
  }

  async updateOwnRevision(user: AuthenticatedUser, entryId: string, input: UpdateEntryDraftDto) {
    const revision = await this.getEditableRevision(user.id, entryId);
    const current = this.parseSnapshot(revision.workingSnapshot);
    const snapshot = await this.applyCorePatch(current, input);
    const updated = await this.prisma.entryRevision.update({
      where: { id: revision.id },
      data: {
        workingSnapshot: snapshot as unknown as Prisma.InputJsonValue,
        plainTextContent: snapshot.plainTextContent,
      },
      include: revisionInclude,
    });
    return { data: this.mapRevision(updated) };
  }

  async cancelOwnRevision(user: AuthenticatedUser, entryId: string) {
    const revision = await this.getEditableRevision(user.id, entryId);
    const stagedImages = await this.prisma.image.findMany({
      where: { entryRevisionId: revision.id },
      select: { cloudinaryPublicId: true },
    });
    await this.prisma.$transaction(async (tx) => {
      await tx.image.deleteMany({ where: { entryRevisionId: revision.id } });
      await tx.entryRevision.update({
        where: { id: revision.id },
        data: { status: EntryRevisionStatus.CANCELLED, decidedAt: new Date() },
      });
      await this.auditService.createWithClient(tx, {
        action: AuditAction.ENTRY_REVISION_CANCELLED,
        actorId: user.id,
        entryId,
        entryRevisionId: revision.id,
        metadata: { revisionId: revision.id },
      });
    });
    await Promise.all(stagedImages.map((image) => this.cleanupImage(image.cloudinaryPublicId)));
    return { data: { message: "Revision cancelled successfully." } };
  }

  async replaceTags(user: AuthenticatedUser, entryId: string, tagIds: string[]) {
    const revision = await this.getEditableRevision(user.id, entryId);
    if (new Set(tagIds).size !== tagIds.length)
      throw this.badRequest(ENTRY_ERROR_CODES.TAG_DUPLICATE);
    const tags = await this.prisma.tag.findMany({
      where: { id: { in: tagIds }, isActive: true },
      select: { id: true, name: true, slug: true },
    });
    if (tags.length !== tagIds.length) throw this.badRequest(ENTRY_ERROR_CODES.TAG_INVALID);
    const byId = new Map(tags.map((tag) => [tag.id, tag]));
    const snapshot = this.parseSnapshot(revision.workingSnapshot);
    snapshot.tags = tagIds.map((id) => byId.get(id) as TaxonomySnapshot);
    this.refreshSnapshotSearchText(snapshot);
    await this.saveSnapshot(revision.id, snapshot);
    return { data: snapshot.tags };
  }

  async createSource(user: AuthenticatedUser, entryId: string, input: CreateEntrySourceDto) {
    const revision = await this.getEditableRevision(user.id, entryId);
    const snapshot = this.parseSnapshot(revision.workingSnapshot);
    const source = this.mapSourceInput(
      input,
      randomUUID(),
      input.displayOrder ?? snapshot.sources.length,
    );
    snapshot.sources.push(source);
    snapshot.sources.sort((a, b) => a.displayOrder - b.displayOrder);
    await this.saveSnapshot(revision.id, snapshot);
    return { data: this.mapSourceResponse(entryId, source) };
  }

  async updateSource(
    user: AuthenticatedUser,
    entryId: string,
    sourceId: string,
    input: UpdateEntrySourceDto,
  ) {
    const revision = await this.getEditableRevision(user.id, entryId);
    const snapshot = this.parseSnapshot(revision.workingSnapshot);
    const index = snapshot.sources.findIndex((source) => source.id === sourceId);
    if (index < 0) throw this.notFound(ENTRY_ERROR_CODES.SOURCE_NOT_FOUND);
    const current = snapshot.sources[index] as RevisionSource;
    const source = this.mapSourceInput(
      { ...current, ...input },
      sourceId,
      input.displayOrder ?? current.displayOrder,
    );
    snapshot.sources[index] = source;
    snapshot.sources.sort((a, b) => a.displayOrder - b.displayOrder);
    await this.saveSnapshot(revision.id, snapshot);
    return { data: this.mapSourceResponse(entryId, source) };
  }

  async deleteSource(user: AuthenticatedUser, entryId: string, sourceId: string) {
    const revision = await this.getEditableRevision(user.id, entryId);
    const snapshot = this.parseSnapshot(revision.workingSnapshot);
    if (!snapshot.sources.some((source) => source.id === sourceId)) {
      throw this.notFound(ENTRY_ERROR_CODES.SOURCE_NOT_FOUND);
    }
    snapshot.sources = snapshot.sources.filter((source) => source.id !== sourceId);
    await this.saveSnapshot(revision.id, snapshot);
    return { data: { message: "Source deleted successfully." } };
  }

  async upsertVideo(user: AuthenticatedUser, entryId: string, input: UpsertEntryYouTubeVideoDto) {
    const revision = await this.getEditableRevision(user.id, entryId);
    const videoId = extractYouTubeVideoId(input.url);
    if (!videoId) throw this.badRequest(ENTRY_ERROR_CODES.YOUTUBE_URL_INVALID);
    const snapshot = this.parseSnapshot(revision.workingSnapshot);
    snapshot.youtubeVideo = {
      id: snapshot.youtubeVideo?.id ?? randomUUID(),
      videoId,
      url: createCanonicalYouTubeUrl(videoId),
      title: this.optionalText(input.title),
      description: this.optionalText(input.description),
    };
    await this.saveSnapshot(revision.id, snapshot);
    return {
      data: {
        ...snapshot.youtubeVideo,
        entryId,
        createdAt: revision.createdAt,
        updatedAt: new Date(),
      },
    };
  }

  async uploadImage(
    user: AuthenticatedUser,
    entryId: string,
    input: UploadEntryImageDto,
    file: Express.Multer.File | undefined,
  ) {
    const revision = await this.getEditableRevision(user.id, entryId);
    this.validateImage(file, input.permissionConfirmed);
    const snapshot = this.parseSnapshot(revision.workingSnapshot);
    if (snapshot.images.length >= this.configService.get<number>("MAX_IMAGES_PER_ENTRY", 6)) {
      throw this.badRequest(ENTRY_ERROR_CODES.IMAGE_LIMIT_EXCEEDED);
    }
    const uploaded = await this.mediaService.uploadEntryImage(file);
    try {
      const image = await this.prisma.image.create({
        data: {
          entryId,
          entryRevisionId: revision.id,
          uploadedById: user.id,
          cloudinaryPublicId: uploaded.publicId,
          url: uploaded.url,
          secureUrl: uploaded.secureUrl,
          thumbnailUrl: uploaded.thumbnailUrl,
          width: uploaded.width,
          height: uploaded.height,
          format: uploaded.format,
          bytes: uploaded.bytes,
          caption: this.optionalText(input.caption),
          altText: input.altText.trim(),
          photographerOrSource: this.optionalText(input.photographerOrSource),
          permissionConfirmed: true,
          displayOrder: input.displayOrder ?? snapshot.images.length,
        },
      });
      const snapshotImage: RevisionImage = {
        id: image.id,
        cloudinaryPublicId: image.cloudinaryPublicId,
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
      };
      snapshot.images.push(snapshotImage);
      await this.saveSnapshot(revision.id, snapshot);
      return { data: this.mapImageResponse(entryId, snapshotImage, image.createdAt) };
    } catch (error) {
      await this.cleanupImage(uploaded.publicId);
      throw error;
    }
  }

  async deleteImage(user: AuthenticatedUser, entryId: string, imageId: string) {
    const revision = await this.getEditableRevision(user.id, entryId);
    const snapshot = this.parseSnapshot(revision.workingSnapshot);
    const image = snapshot.images.find((item) => item.id === imageId);
    if (!image) throw this.notFound(ENTRY_ERROR_CODES.IMAGE_NOT_FOUND);
    snapshot.images = snapshot.images.filter((item) => item.id !== imageId);
    await this.saveSnapshot(revision.id, snapshot);
    const staged = await this.prisma.image.findFirst({
      where: { id: imageId, entryRevisionId: revision.id },
      select: { cloudinaryPublicId: true },
    });
    if (staged) {
      await this.prisma.image.delete({ where: { id: imageId } });
      await this.cleanupImage(staged.cloudinaryPublicId);
    }
    return { data: { message: "Image deleted successfully." } };
  }

  async updateImage(
    user: AuthenticatedUser,
    entryId: string,
    imageId: string,
    input: UpdateEntryImageMetadataDto,
  ) {
    const revision = await this.getEditableRevision(user.id, entryId);
    const snapshot = this.parseSnapshot(revision.workingSnapshot);
    const index = snapshot.images.findIndex((item) => item.id === imageId);
    if (index < 0) throw this.notFound(ENTRY_ERROR_CODES.IMAGE_NOT_FOUND);
    const current = snapshot.images[index] as RevisionImage;
    const updated: RevisionImage = {
      ...current,
      altText: input.altText === undefined ? current.altText : input.altText.trim(),
      caption: input.caption === undefined ? current.caption : this.optionalText(input.caption),
      photographerOrSource:
        input.photographerOrSource === undefined
          ? current.photographerOrSource
          : this.optionalText(input.photographerOrSource),
      permissionConfirmed: input.permissionConfirmed ?? current.permissionConfirmed,
      displayOrder: input.displayOrder ?? current.displayOrder,
    };
    if (!updated.altText || !updated.permissionConfirmed) {
      throw this.badRequest(ENTRY_ERROR_CODES.IMAGE_PERMISSION_REQUIRED);
    }
    snapshot.images[index] = updated;
    snapshot.images.sort((a, b) => a.displayOrder - b.displayOrder);
    await this.prisma.$transaction(async (tx) => {
      await tx.entryRevision.update({
        where: { id: revision.id },
        data: { workingSnapshot: snapshot as unknown as Prisma.InputJsonValue },
      });
      await tx.image.updateMany({
        where: { id: imageId, entryRevisionId: revision.id },
        data: {
          altText: updated.altText,
          caption: updated.caption,
          photographerOrSource: updated.photographerOrSource,
          permissionConfirmed: updated.permissionConfirmed,
          displayOrder: updated.displayOrder,
        },
      });
    });
    return { data: this.mapImageResponse(entryId, updated, revision.createdAt) };
  }

  async removeVideo(user: AuthenticatedUser, entryId: string) {
    const revision = await this.getEditableRevision(user.id, entryId);
    const snapshot = this.parseSnapshot(revision.workingSnapshot);
    snapshot.youtubeVideo = null;
    await this.saveSnapshot(revision.id, snapshot);
    return { data: { message: "YouTube video removed successfully." } };
  }

  async submitOwnRevision(user: AuthenticatedUser, entryId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const revision = await this.getEditableRevision(user.id, entryId, tx);
      const snapshot = this.parseSnapshot(revision.workingSnapshot);
      await this.validateSnapshot(tx, snapshot);
      const latest = await tx.contentVersion.aggregate({
        where: { entryId },
        _max: { versionNumber: true },
      });
      const contentVersion = await tx.contentVersion.create({
        data: {
          entryId,
          entryRevisionId: revision.id,
          versionNumber: (latest._max.versionNumber ?? 0) + 1,
          snapshot: {
            ...snapshot,
            versionReason: VersionReason.PUBLISHED_REVISION,
          } as unknown as Prisma.InputJsonValue,
          plainTextContent: snapshot.plainTextContent,
          versionReason: VersionReason.PUBLISHED_REVISION,
          createdById: user.id,
        },
      });
      const updated = await tx.entryRevision.updateMany({
        where: { id: revision.id, status: revision.status },
        data: { status: EntryRevisionStatus.PENDING_REVIEW, submittedAt: new Date() },
      });
      if (updated.count !== 1) throw this.conflict();
      await this.auditService.createWithClient(tx, {
        action: AuditAction.ENTRY_REVISION_SUBMITTED,
        actorId: user.id,
        entryId,
        entryRevisionId: revision.id,
        metadata: { revisionId: revision.id, versionNumber: contentVersion.versionNumber },
      });
      return { revisionId: revision.id, versionNumber: contentVersion.versionNumber };
    }, this.transactionOptions());
    return { data: result };
  }

  async requestRevision(user: AuthenticatedUser, entryId: string, reason: string) {
    const normalizedReason = this.requiredReason(reason);
    const revision = await this.prisma.$transaction(async (tx) => {
      const existing = await this.findActiveRevision(tx, entryId);
      if (existing?.status === EntryRevisionStatus.PENDING_REVIEW) throw this.conflict();
      if (existing) {
        const updated = await tx.entryRevision.update({
          where: { id: existing.id },
          data: {
            status: EntryRevisionStatus.CHANGES_REQUESTED,
            requestedById: user.id,
            requestFeedback: normalizedReason,
          },
          include: revisionInclude,
        });
        await this.auditRevisionRequest(tx, user.id, entryId, updated.id, normalizedReason);
        return updated;
      }
      const entry = await this.findPublishedEntry(tx, entryId);
      const baseVersionId = await this.ensurePublishedVersion(tx, entry, entry.authorId);
      const snapshot = this.createSnapshot(entry, entry.authorId);
      const created = await tx.entryRevision.create({
        data: {
          entryId,
          status: EntryRevisionStatus.CHANGES_REQUESTED,
          baseVersionId,
          workingSnapshot: snapshot as unknown as Prisma.InputJsonValue,
          plainTextContent: snapshot.plainTextContent,
          createdById: entry.authorId,
          requestedById: user.id,
          requestFeedback: normalizedReason,
        },
        include: revisionInclude,
      });
      await this.auditRevisionRequest(tx, user.id, entryId, created.id, normalizedReason);
      return created;
    }, this.transactionOptions());
    return { data: this.mapRevision(revision) };
  }

  async listPendingRevisions(page = 1, limit = 20) {
    const normalizedPage = Math.max(1, page);
    const normalizedLimit = Math.min(50, Math.max(1, limit));
    const where = { status: EntryRevisionStatus.PENDING_REVIEW };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.entryRevision.findMany({
        where,
        include: revisionInclude,
        orderBy: [{ submittedAt: "asc" }, { createdAt: "asc" }],
        skip: (normalizedPage - 1) * normalizedLimit,
        take: normalizedLimit,
      }),
      this.prisma.entryRevision.count({ where }),
    ]);
    return {
      data: items.map((item) => this.mapRevision(item)),
      meta: {
        page: normalizedPage,
        limit: normalizedLimit,
        total,
        totalPages: Math.ceil(total / normalizedLimit),
      },
    };
  }

  async getModerationRevision(revisionId: string) {
    const revision = await this.prisma.entryRevision.findUnique({
      where: { id: revisionId },
      include: revisionInclude,
    });
    if (!revision) throw this.notFound();
    return { data: this.mapRevision(revision) };
  }

  async approveRevision(user: AuthenticatedUser, revisionId: string, comments?: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const revision = await this.findPendingRevision(tx, revisionId);
      if (revision.entry.authorId === user.id) {
        throw new ForbiddenException({
          error: "MODERATION_SELF_APPROVAL_FORBIDDEN",
          message: "Authors cannot approve their own revision.",
        });
      }
      if (revision.entry.publishedVersionId !== revision.baseVersionId) {
        throw this.conflict(ENTRY_ERROR_CODES.REVISION_STALE);
      }
      const snapshot = this.parseSnapshot(revision.workingSnapshot);
      await this.validateSnapshot(tx, snapshot);
      const submittedVersion = revision.contentVersions[0];
      if (!submittedVersion) throw this.conflict();
      const review = await tx.moderationReview.create({
        data: {
          entryId: revision.entryId,
          entryRevisionId: revision.id,
          moderatorId: user.id,
          decision: ModerationDecision.APPROVE,
          comments: this.optionalText(comments),
          previousStatus: EntryStatus.PUBLISHED,
          nextStatus: EntryStatus.PUBLISHED,
          previousRevisionStatus: EntryRevisionStatus.PENDING_REVIEW,
          nextRevisionStatus: EntryRevisionStatus.APPROVED,
        },
      });
      await this.applySnapshot(tx, revision.entryId, snapshot, submittedVersion.id);
      await tx.contentVersion.update({
        where: { id: submittedVersion.id },
        data: { moderationReviewId: review.id },
      });
      await tx.entryRevision.update({
        where: { id: revision.id },
        data: { status: EntryRevisionStatus.APPROVED, decidedAt: new Date() },
      });
      await this.auditService.createWithClient(tx, {
        action: AuditAction.ENTRY_REVISION_APPROVED,
        actorId: user.id,
        entryId: revision.entryId,
        entryRevisionId: revision.id,
        metadata: {
          revisionId: revision.id,
          reviewId: review.id,
          versionNumber: submittedVersion.versionNumber,
        },
      });
      return { entryId: revision.entryId, revisionId: revision.id };
    }, this.transactionOptions());
    await this.publicEntryCacheService.revalidatePublishedEntries();
    return { data: result };
  }

  requestRevisionChanges(user: AuthenticatedUser, revisionId: string, reason: string) {
    return this.decideRevision(
      user,
      revisionId,
      EntryRevisionStatus.CHANGES_REQUESTED,
      ModerationDecision.REQUEST_CHANGES,
      AuditAction.ENTRY_REVISION_CHANGES_REQUESTED,
      reason,
    );
  }

  rejectRevision(user: AuthenticatedUser, revisionId: string, reason: string) {
    return this.decideRevision(
      user,
      revisionId,
      EntryRevisionStatus.REJECTED,
      ModerationDecision.REJECT,
      AuditAction.ENTRY_REVISION_REJECTED,
      reason,
    );
  }

  private async decideRevision(
    user: AuthenticatedUser,
    revisionId: string,
    nextStatus: EntryRevisionStatus,
    decision: ModerationDecision,
    auditAction: AuditAction,
    reason: string,
  ) {
    const comments = this.requiredReason(reason);
    const result = await this.prisma.$transaction(async (tx) => {
      const revision = await this.findPendingRevision(tx, revisionId);
      const review = await tx.moderationReview.create({
        data: {
          entryId: revision.entryId,
          entryRevisionId: revision.id,
          moderatorId: user.id,
          decision,
          comments,
          previousStatus: EntryStatus.PUBLISHED,
          nextStatus: EntryStatus.PUBLISHED,
          previousRevisionStatus: EntryRevisionStatus.PENDING_REVIEW,
          nextRevisionStatus: nextStatus,
        },
      });
      const updated = await tx.entryRevision.updateMany({
        where: { id: revision.id, status: EntryRevisionStatus.PENDING_REVIEW },
        data: { status: nextStatus, requestFeedback: comments, decidedAt: new Date() },
      });
      if (updated.count !== 1) throw this.conflict();
      await this.auditService.createWithClient(tx, {
        action: auditAction,
        actorId: user.id,
        entryId: revision.entryId,
        entryRevisionId: revision.id,
        metadata: { revisionId: revision.id, reviewId: review.id, reason: comments },
      });
      return { entryId: revision.entryId, revisionId: revision.id, status: nextStatus };
    }, this.transactionOptions());
    return { data: result };
  }

  private async applyCorePatch(snapshot: RevisionSnapshot, input: UpdateEntryDraftDto) {
    const next = structuredClone(snapshot);
    if (input.title !== undefined) next.title = input.title.trim().replace(/\s+/g, " ");
    if (input.summary !== undefined) next.summary = input.summary.trim();
    if (input.villageOrLocation !== undefined)
      next.villageOrLocation = this.optionalText(input.villageOrLocation);
    if (input.contentJson !== undefined) {
      try {
        next.plainTextContent = extractPlainTextFromTiptap(input.contentJson).trim();
        next.internalReferences = extractInternalEntryReferences(input.contentJson).map(
          (reference) => ({
            ...reference,
            targetSlug: "",
            targetTitle: "",
          }),
        );
      } catch (error) {
        if (error instanceof TiptapValidationError)
          throw this.badRequest(ENTRY_ERROR_CODES.CONTENT_INVALID, error.message);
        throw error;
      }
      next.contentJson = input.contentJson as Prisma.JsonValue;
    }
    const geographicScope = input.geographicScope ?? next.geographicScope;
    const provinceId = input.provinceId === undefined ? next.province?.id : input.provinceId;
    const districtId = input.districtId === undefined ? next.district?.id : input.districtId;
    const categoryId = input.categoryId ?? next.category.id;
    const contentTypeId = input.contentTypeId ?? next.contentType.id;
    const taxonomy = await this.resolveTaxonomy(
      geographicScope,
      provinceId,
      districtId,
      categoryId,
      contentTypeId,
    );
    next.geographicScope = geographicScope;
    next.province = taxonomy.province;
    next.district = taxonomy.district;
    next.category = taxonomy.category;
    next.contentType = taxonomy.contentType;
    this.refreshSnapshotSearchText(next);
    return next;
  }

  private refreshSnapshotSearchText(snapshot: RevisionSnapshot) {
    snapshot.normalizedSearchText = normalizeEntrySearchText([
      snapshot.title,
      snapshot.summary,
      snapshot.plainTextContent,
      snapshot.villageOrLocation,
      snapshot.province?.name,
      snapshot.district?.name,
      snapshot.category.name,
      snapshot.contentType.name,
      ...snapshot.tags.map((tag) => tag.name),
    ]);
  }

  private async resolveTaxonomy(
    geographicScope: GeographicScope,
    provinceId: string | null | undefined,
    districtId: string | null | undefined,
    categoryId: string,
    contentTypeId: string,
    client: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    if (geographicScope === GeographicScope.PROVINCE && !provinceId)
      throw this.badRequest(ENTRY_ERROR_CODES.GEOGRAPHY_INVALID);
    if (geographicScope !== GeographicScope.PROVINCE && (provinceId || districtId))
      throw this.badRequest(ENTRY_ERROR_CODES.GEOGRAPHY_INVALID);
    const [province, district, category, contentType] = await Promise.all([
      provinceId
        ? client.province.findFirst({
            where: { id: provinceId, isActive: true },
            select: { id: true, name: true, slug: true },
          })
        : null,
      districtId
        ? client.district.findFirst({
            where: { id: districtId, isActive: true },
            select: { id: true, name: true, slug: true, provinceId: true },
          })
        : null,
      client.category.findFirst({
        where: { id: categoryId, isActive: true },
        select: { id: true, name: true, slug: true },
      }),
      client.contentType.findFirst({
        where: { id: contentTypeId, isActive: true },
        select: { id: true, name: true, slug: true },
      }),
    ]);
    if ((provinceId && !province) || (districtId && !district) || !category || !contentType)
      throw this.badRequest(ENTRY_ERROR_CODES.TAXONOMY_INVALID);
    if (district && district.provinceId !== province?.id)
      throw this.badRequest(ENTRY_ERROR_CODES.DISTRICT_PROVINCE_MISMATCH);
    return {
      province,
      district: district ? { id: district.id, name: district.name, slug: district.slug } : null,
      category,
      contentType,
    };
  }

  private async validateSnapshot(client: Prisma.TransactionClient, snapshot: RevisionSnapshot) {
    if (!snapshot.title.trim() || !snapshot.summary.trim() || !snapshot.plainTextContent.trim())
      throw this.badRequest(ENTRY_ERROR_CODES.SUBMISSION_INCOMPLETE);
    await this.resolveTaxonomy(
      snapshot.geographicScope,
      snapshot.province?.id,
      snapshot.district?.id,
      snapshot.category.id,
      snapshot.contentType.id,
      client,
    );
    if (snapshot.images.length > this.configService.get<number>("MAX_IMAGES_PER_ENTRY", 6))
      throw this.badRequest(ENTRY_ERROR_CODES.IMAGE_LIMIT_EXCEEDED);
    if (snapshot.images.some((image) => !image.altText.trim() || !image.permissionConfirmed))
      throw this.badRequest(ENTRY_ERROR_CODES.IMAGE_PERMISSION_REQUIRED);
    const tagCount = await client.tag.count({
      where: { id: { in: snapshot.tags.map((tag) => tag.id) }, isActive: true },
    });
    if (tagCount !== snapshot.tags.length) throw this.badRequest(ENTRY_ERROR_CODES.TAG_INVALID);
    const targetIds = [
      ...new Set(snapshot.internalReferences.map((reference) => reference.targetEntryId)),
    ];
    if (targetIds.includes(snapshot.entryId))
      throw this.badRequest(ENTRY_ERROR_CODES.REFERENCE_SELF);
    if (targetIds.length) {
      const count = await client.culturalEntry.count({
        where: { id: { in: targetIds }, status: EntryStatus.PUBLISHED },
      });
      if (count !== targetIds.length)
        throw this.badRequest(ENTRY_ERROR_CODES.REFERENCE_TARGET_INVALID);
    }
  }

  private async applySnapshot(
    tx: Prisma.TransactionClient,
    entryId: string,
    snapshot: RevisionSnapshot,
    publishedVersionId: string,
  ) {
    await tx.culturalEntry.update({
      where: { id: entryId },
      data: {
        title: snapshot.title,
        summary: snapshot.summary,
        contentJson: snapshot.contentJson as Prisma.InputJsonValue,
        plainTextContent: snapshot.plainTextContent,
        normalizedSearchText: snapshot.normalizedSearchText,
        geographicScope: snapshot.geographicScope,
        provinceId: snapshot.province?.id ?? null,
        districtId: snapshot.district?.id ?? null,
        categoryId: snapshot.category.id,
        contentTypeId: snapshot.contentType.id,
        villageOrLocation: snapshot.villageOrLocation,
        publishedVersionId,
      },
    });
    await tx.entryTag.deleteMany({ where: { entryId } });
    if (snapshot.tags.length)
      await tx.entryTag.createMany({
        data: snapshot.tags.map((tag) => ({ entryId, tagId: tag.id })),
      });
    await tx.source.deleteMany({ where: { entryId } });
    if (snapshot.sources.length) {
      await tx.source.createMany({
        data: snapshot.sources.map((source) => ({
          id: source.id,
          entryId,
          type: source.type,
          title: source.title,
          authorOrProvider: source.authorOrProvider,
          publicationDate: source.publicationDate,
          websiteUrl: source.websiteUrl,
          bookOrArticleDetails: source.bookOrArticleDetails,
          interviewDate: source.interviewDate ? new Date(source.interviewDate) : null,
          explanation: source.explanation,
          displayOrder: source.displayOrder,
        })),
      });
    }
    const selectedImageIds = snapshot.images.map((image) => image.id);
    await tx.image.updateMany({
      where: { entryId, entryRevisionId: null, isRemoved: false, id: { notIn: selectedImageIds } },
      data: { isRemoved: true, removedAt: new Date() },
    });
    for (const image of snapshot.images) {
      await tx.image.update({
        where: { id: image.id },
        data: {
          entryRevisionId: null,
          isRemoved: false,
          removedAt: null,
          caption: image.caption,
          altText: image.altText,
          photographerOrSource: image.photographerOrSource,
          permissionConfirmed: image.permissionConfirmed,
          displayOrder: image.displayOrder,
        },
      });
    }
    await tx.youTubeVideo.deleteMany({ where: { entryId } });
    if (snapshot.youtubeVideo) {
      await tx.youTubeVideo.create({ data: { ...snapshot.youtubeVideo, entryId } });
    }
    await tx.entryReference.deleteMany({ where: { sourceEntryId: entryId } });
    if (snapshot.internalReferences.length) {
      await tx.entryReference.createMany({
        data: snapshot.internalReferences.map((reference) => ({
          sourceEntryId: entryId,
          targetEntryId: reference.targetEntryId,
          anchorText: reference.anchorText,
        })),
      });
    }
  }

  private async ensurePublishedVersion(
    tx: Prisma.TransactionClient,
    entry: Prisma.CulturalEntryGetPayload<{ select: typeof revisionEntrySelect }>,
    creatorId: string,
  ) {
    if (entry.publishedVersionId) return entry.publishedVersionId;
    const latest = await tx.contentVersion.findFirst({
      where: { entryId: entry.id },
      orderBy: { versionNumber: "desc" },
    });
    if (latest) {
      await tx.culturalEntry.update({
        where: { id: entry.id },
        data: { publishedVersionId: latest.id },
      });
      return latest.id;
    }
    const snapshot = this.createSnapshot(entry, creatorId);
    const baseline = await tx.contentVersion.create({
      data: {
        entryId: entry.id,
        versionNumber: 1,
        snapshot: snapshot as unknown as Prisma.InputJsonValue,
        plainTextContent: entry.plainTextContent,
        versionReason: VersionReason.ADMIN_UPDATE,
        createdById: creatorId,
      },
    });
    await tx.culturalEntry.update({
      where: { id: entry.id },
      data: { publishedVersionId: baseline.id },
    });
    return baseline.id;
  }

  private createSnapshot(
    entry: Prisma.CulturalEntryGetPayload<{ select: typeof revisionEntrySelect }>,
    creatorId: string,
  ): RevisionSnapshot {
    return {
      schemaVersion: 1,
      entryId: entry.id,
      key: entry.key,
      slug: entry.slug,
      title: entry.title,
      summary: entry.summary,
      contentJson: entry.contentJson,
      plainTextContent: entry.plainTextContent,
      normalizedSearchText: entry.normalizedSearchText,
      geographicScope: entry.geographicScope,
      province: entry.province,
      district: entry.district,
      category: entry.category,
      contentType: entry.contentType,
      villageOrLocation: entry.villageOrLocation,
      tags: entry.tags.map((item) => item.tag),
      sources: entry.sources.map((source) => ({
        ...source,
        interviewDate: source.interviewDate?.toISOString() ?? null,
      })),
      images: entry.images,
      youtubeVideo: entry.youtubeVideo && !entry.youtubeVideo.isRemoved ? entry.youtubeVideo : null,
      internalReferences: entry.outgoingReferences.map((reference) => ({
        targetEntryId: reference.targetEntryId,
        targetSlug: reference.targetEntry.slug,
        targetTitle: reference.targetEntry.title,
        anchorText: reference.anchorText,
      })),
      versionReason: VersionReason.PUBLISHED_REVISION,
      creatorId,
      createdAt: new Date().toISOString(),
    };
  }

  private mapRevision(revision: EntryRevisionPayload) {
    const snapshot = this.parseSnapshot(revision.workingSnapshot);
    const now = revision.updatedAt?.toISOString?.() ?? new Date().toISOString();
    return {
      id: revision.entryId,
      revisionId: revision.id,
      key: snapshot.key,
      slug: snapshot.slug,
      title: snapshot.title,
      summary: snapshot.summary,
      contentJson: snapshot.contentJson,
      plainTextContent: snapshot.plainTextContent,
      status: revision.entry.status,
      revisionStatus: revision.status,
      publicStatus: revision.entry.status,
      geographicScope: snapshot.geographicScope,
      authorId: revision.entry.authorId,
      provinceId: snapshot.province?.id ?? null,
      districtId: snapshot.district?.id ?? null,
      categoryId: snapshot.category.id,
      contentTypeId: snapshot.contentType.id,
      villageOrLocation: snapshot.villageOrLocation,
      author: revision.entry.author,
      province: snapshot.province,
      district: snapshot.district,
      category: snapshot.category,
      contentType: snapshot.contentType,
      tags: snapshot.tags,
      sources: snapshot.sources.map((source) => this.mapSourceResponse(revision.entryId, source)),
      images: snapshot.images.map((image) =>
        this.mapImageResponse(revision.entryId, image, revision.createdAt),
      ),
      youtubeVideo: snapshot.youtubeVideo
        ? {
            ...snapshot.youtubeVideo,
            entryId: revision.entryId,
            createdAt: revision.createdAt,
            updatedAt: revision.updatedAt,
          }
        : null,
      requestFeedback: revision.requestFeedback,
      revisionCreatedBy: revision.createdBy,
      revisionRequestedBy: revision.requestedBy,
      revisionVersion: revision.contentVersions[0] ?? null,
      latestModerationReview: revision.moderationReviews[0]
        ? {
            ...revision.moderationReviews[0],
            previousStatus: EntryStatus.PUBLISHED,
            nextStatus: EntryStatus.PUBLISHED,
          }
        : null,
      baseVersionId: revision.baseVersionId,
      submittedAt: revision.submittedAt,
      createdAt: revision.createdAt ?? now,
      updatedAt: revision.updatedAt ?? now,
    };
  }

  private parseSnapshot(value: Prisma.JsonValue): RevisionSnapshot {
    return value as unknown as RevisionSnapshot;
  }

  private async saveSnapshot(revisionId: string, snapshot: RevisionSnapshot) {
    await this.prisma.entryRevision.update({
      where: { id: revisionId },
      data: {
        workingSnapshot: snapshot as unknown as Prisma.InputJsonValue,
        plainTextContent: snapshot.plainTextContent,
      },
    });
  }

  private async findPublishedOwnedEntry(
    tx: Prisma.TransactionClient,
    userId: string,
    entryId: string,
  ) {
    const entry = await tx.culturalEntry.findFirst({
      where: { id: entryId, authorId: userId, status: EntryStatus.PUBLISHED },
      select: revisionEntrySelect,
    });
    if (!entry) throw this.notFound();
    return entry;
  }

  private async findPublishedEntry(tx: Prisma.TransactionClient, entryId: string) {
    const entry = await tx.culturalEntry.findFirst({
      where: { id: entryId, status: EntryStatus.PUBLISHED },
      select: revisionEntrySelect,
    });
    if (!entry) throw this.notFound();
    return entry;
  }

  private findActiveRevision(tx: Prisma.TransactionClient, entryId: string) {
    return tx.entryRevision.findFirst({
      where: { entryId, status: { in: [...activeRevisionStatuses] } },
      include: revisionInclude,
    });
  }

  private async getEditableRevision(
    userId: string,
    entryId: string,
    client: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    const revision = await client.entryRevision.findFirst({
      where: {
        entryId,
        entry: { authorId: userId },
        status: { in: [...editableRevisionStatuses] },
      },
    });
    if (!revision) throw this.notFound();
    return revision;
  }

  private async findPendingRevision(tx: Prisma.TransactionClient, revisionId: string) {
    const revision = await tx.entryRevision.findFirst({
      where: { id: revisionId, status: EntryRevisionStatus.PENDING_REVIEW },
      include: {
        ...revisionInclude,
        contentVersions: {
          where: { versionReason: VersionReason.PUBLISHED_REVISION },
          orderBy: { versionNumber: "desc" },
          take: 1,
          select: { id: true, versionNumber: true, createdAt: true },
        },
      },
    });
    if (!revision) throw this.conflict();
    return revision;
  }

  private async auditRevisionRequest(
    tx: Prisma.TransactionClient,
    actorId: string,
    entryId: string,
    revisionId: string,
    reason: string,
  ) {
    await this.auditService.createWithClient(tx, {
      action: AuditAction.ENTRY_REVISION_REQUESTED,
      actorId,
      entryId,
      entryRevisionId: revisionId,
      metadata: { revisionId, reason },
    });
  }

  private mapSourceInput(
    input: CreateEntrySourceDto | (RevisionSource & UpdateEntrySourceDto),
    id: string,
    displayOrder: number,
  ): RevisionSource {
    return {
      id,
      type: input.type,
      title: this.optionalText(input.title),
      authorOrProvider: this.optionalText(input.authorOrProvider),
      publicationDate: this.optionalText(input.publicationDate),
      websiteUrl: this.optionalText(input.websiteUrl),
      bookOrArticleDetails: this.optionalText(input.bookOrArticleDetails),
      interviewDate: input.interviewDate ? new Date(input.interviewDate).toISOString() : null,
      explanation: this.optionalText(input.explanation),
      displayOrder,
    };
  }

  private mapSourceResponse(entryId: string, source: RevisionSource) {
    return {
      ...source,
      entryId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  private mapImageResponse(entryId: string, image: RevisionImage, createdAt: Date) {
    return {
      ...image,
      entryId,
      createdAt: createdAt.toISOString?.() ?? createdAt,
      updatedAt: new Date().toISOString(),
    };
  }

  private validateImage(
    file: Express.Multer.File | undefined,
    permissionConfirmed: boolean,
  ): asserts file is Express.Multer.File {
    if (!file || !isSupportedImageFile(file))
      throw this.badRequest(ENTRY_ERROR_CODES.IMAGE_INVALID_TYPE);
    if (file.size > this.configService.get<number>("MAX_IMAGE_SIZE_MB", 4) * 1024 * 1024)
      throw this.badRequest(ENTRY_ERROR_CODES.IMAGE_TOO_LARGE);
    if (!permissionConfirmed) throw this.badRequest(ENTRY_ERROR_CODES.IMAGE_PERMISSION_REQUIRED);
  }

  private optionalText(value: string | null | undefined) {
    return value?.trim() || null;
  }

  private requiredReason(value: string) {
    const reason = value.trim();
    if (reason.length < 3)
      throw this.badRequest(
        ENTRY_ERROR_CODES.REVISION_INVALID_STATUS,
        "Revision reason is required.",
      );
    return reason;
  }

  private async cleanupImage(publicId: string) {
    try {
      await this.mediaService.deleteImage(publicId);
    } catch (error) {
      this.logger.error(
        `Failed to clean up revision image ${publicId}.`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private transactionOptions() {
    return { maxWait: 10_000, timeout: 20_000 } as const;
  }

  private notFound(code: string = ENTRY_ERROR_CODES.REVISION_NOT_FOUND) {
    return new NotFoundException({ error: code, message: "Entry revision was not found." });
  }

  private conflict(code: string = ENTRY_ERROR_CODES.REVISION_CONFLICT) {
    return new ConflictException({
      error: code,
      message: "Entry revision changed before this action completed.",
    });
  }

  private badRequest(code: string, message = "Entry revision data is invalid.") {
    return new BadRequestException({ error: code, message });
  }
}

export { EntryRevisionsService };
