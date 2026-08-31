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

import { PrismaService } from "../../database/prisma.service";
import type { Prisma } from "../../generated/prisma/client";
import {
  AuditAction,
  EntryStatus,
  GeographicScope,
  VersionReason,
} from "../../generated/prisma/enums";
import { AuditService } from "../audit/audit.service";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { CloudinaryMediaService } from "../media/cloudinary-media.service";
import { isSupportedImageFile } from "../media/image-file.utils";
import type { CreateEntryDraftDto, UpdateEntryDraftDto } from "./dto/create-entry-draft.dto";
import type {
  ReorderEntryImagesDto,
  UpdateEntryImageMetadataDto,
  UploadEntryImageDto,
} from "./dto/entry-images.dto";
import type { OwnEntriesQueryDto } from "./dto/entry-query.dto";
import type { EntryReferenceSearchQueryDto } from "./dto/entry-references.dto";
import type {
  CreateEntrySourceDto,
  ReorderEntrySourcesDto,
  UpdateEntrySourceDto,
} from "./dto/entry-sources.dto";
import type { EntryTagsDto } from "./dto/entry-tags.dto";
import type {
  UpdateEntryYouTubeVideoDto,
  UpsertEntryYouTubeVideoDto,
} from "./dto/entry-youtube.dto";
import type { PublicEntryQueryDto } from "./dto/public-entry-query.dto";
import { ENTRY_ERROR_CODES } from "./entries.constants";
import {
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
} from "./entries.mapper";
import {
  createEntryKeyFromId,
  createUniqueEntrySlug,
  isValidEntrySlug,
  normalizeEntrySearchText,
  normalizeEntrySlug,
} from "./utils/entry-slug.util";
import {
  extractInternalEntryReferences,
  extractPlainTextFromTiptap,
  type InternalEntryReference,
  TiptapValidationError,
} from "./utils/tiptap-content.util";
import { createCanonicalYouTubeUrl, extractYouTubeVideoId } from "./utils/youtube-url.util";

type TaxonomyReference = {
  id: string;
  name: string;
  slug: string;
};

type DistrictReference = TaxonomyReference & {
  provinceId: string;
};

type ValidatedTaxonomy = {
  geographicScope: GeographicScope;
  province: TaxonomyReference | null;
  district: DistrictReference | null;
  category: TaxonomyReference;
  contentType: TaxonomyReference;
};

type SearchTaxonomy = {
  geographicScope: GeographicScope;
  province: TaxonomyReference | null;
  district: TaxonomyReference | null;
  category: TaxonomyReference;
  contentType: TaxonomyReference;
};

type NormalizedEntryQuery = {
  page: number;
  limit: number;
  sortBy: "createdAt" | "updatedAt";
  sortDirection: "asc" | "desc";
};

type NormalizedPublicEntryQuery = {
  page: number;
  limit: number;
  sort: "newest" | "oldest" | "recentlyUpdated";
};

type EntriesDbClient = Prisma.TransactionClient | PrismaService;
type SourceCreateData = Omit<Prisma.SourceUncheckedCreateInput, "entryId" | "displayOrder">;
type NormalizedEntryReference = {
  targetEntryId: string;
  anchorText: string;
};

const editableStatuses = new Set<EntryStatus>([EntryStatus.DRAFT, EntryStatus.CHANGES_REQUESTED]);
const submittableStatuses = new Set<EntryStatus>([
  EntryStatus.DRAFT,
  EntryStatus.CHANGES_REQUESTED,
]);
const MAX_REFERENCE_ANCHOR_LENGTH = 180;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TAXONOMY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const taxonomyReferenceSelect = {
  id: true,
  name: true,
  slug: true,
} as const;
const activeTaxonomyReferenceSelect = {
  ...taxonomyReferenceSelect,
  isActive: true,
} as const;
const districtReferenceSelect = {
  ...taxonomyReferenceSelect,
  provinceId: true,
} as const;
const activeDistrictReferenceSelect = {
  ...activeTaxonomyReferenceSelect,
  provinceId: true,
} as const;
const submissionSourceOrderBy: Prisma.SourceOrderByWithRelationInput[] = [
  { displayOrder: "asc" },
  { createdAt: "asc" },
];
const submissionImageOrderBy: Prisma.ImageOrderByWithRelationInput[] = [
  { displayOrder: "asc" },
  { createdAt: "asc" },
];
const submissionEntrySelect = {
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
  submittedAt: true,
  publishedAt: true,
  author: {
    select: {
      id: true,
      displayName: true,
    },
  },
  province: {
    select: activeTaxonomyReferenceSelect,
  },
  district: {
    select: activeDistrictReferenceSelect,
  },
  category: {
    select: activeTaxonomyReferenceSelect,
  },
  contentType: {
    select: activeTaxonomyReferenceSelect,
  },
  tags: {
    select: {
      tag: {
        select: activeTaxonomyReferenceSelect,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  },
  sources: {
    select: sourceSelect,
    orderBy: submissionSourceOrderBy,
  },
  images: {
    where: {
      isRemoved: false,
    },
    select: imageSelect,
    orderBy: submissionImageOrderBy,
  },
  youtubeVideo: {
    select: youtubeVideoSelect,
  },
  outgoingReferences: {
    select: {
      targetEntryId: true,
      anchorText: true,
      targetEntry: {
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
          publishedAt: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  },
} as const;
type SubmissionEntryPayload = Prisma.CulturalEntryGetPayload<{
  select: typeof submissionEntrySelect;
}>;

@Injectable()
class EntriesService {
  private readonly logger = new Logger(EntriesService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuditService) private readonly auditService: AuditService,
    @Inject(CloudinaryMediaService) private readonly mediaService: CloudinaryMediaService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  async listPublishedEntries(query: PublicEntryQueryDto) {
    const normalizedQuery = this.normalizePublicEntryQuery(query);
    await this.ensurePublicDistrictProvinceFilterIsValid(query);
    const where = this.createPublicEntryWhere(query);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.culturalEntry.findMany({
        where,
        select: publicEntryCardSelect,
        orderBy: this.publicEntryOrderBy(normalizedQuery),
        skip: this.skip(normalizedQuery),
        take: normalizedQuery.limit,
      }),
      this.prisma.culturalEntry.count({ where }),
    ]);

    return {
      data: items.map(mapPublicEntryCard),
      meta: {
        page: normalizedQuery.page,
        limit: normalizedQuery.limit,
        total,
        totalPages: Math.ceil(total / normalizedQuery.limit),
      },
    };
  }

  async getPublishedEntryBySlug(slug: string) {
    const normalizedSlug = this.normalizePublicSlug(slug);
    const entry = await this.prisma.culturalEntry.findFirst({
      where: {
        slug: normalizedSlug,
        status: EntryStatus.PUBLISHED,
        publishedAt: {
          not: null,
        },
      },
      select: publicEntryDetailSelect,
    });

    if (!entry) {
      throw this.notFound();
    }

    return {
      data: mapPublicEntryDetail(entry),
    };
  }

  async createDraft(user: AuthenticatedUser, input: CreateEntryDraftDto) {
    const entryId = randomUUID();
    const title = this.normalizeTitle(input.title);
    const summary = this.normalizeRequiredText(input.summary, "Summary is required.");
    const contentJson = this.validateContent(input.contentJson);
    const plainTextContent = extractPlainTextFromTiptap(contentJson);
    const entryReferences = extractInternalEntryReferences(contentJson);
    const taxonomy = await this.validateTaxonomy({
      geographicScope: input.geographicScope,
      provinceId: input.provinceId,
      districtId: input.districtId ?? null,
      categoryId: input.categoryId,
      contentTypeId: input.contentTypeId,
    });
    const slug = await this.generateUniqueSlug(title);
    const villageOrLocation = this.normalizeOptionalText(input.villageOrLocation);

    const entry = await this.withUniqueConstraintHandling(async () =>
      this.prisma.$transaction(async (tx) => {
        const createdEntry = await tx.culturalEntry.create({
          data: {
            title,
            id: entryId,
            key: createEntryKeyFromId(entryId),
            summary,
            contentJson: contentJson as Prisma.InputJsonValue,
            plainTextContent,
            normalizedSearchText: this.createSearchText({
              title,
              summary,
              plainTextContent,
              villageOrLocation,
              taxonomy,
            }),
            slug,
            status: EntryStatus.DRAFT,
            authorId: user.id,
            geographicScope: taxonomy.geographicScope,
            provinceId: taxonomy.province?.id ?? null,
            districtId: taxonomy.district?.id ?? null,
            categoryId: taxonomy.category.id,
            contentTypeId: taxonomy.contentType.id,
            villageOrLocation,
          },
          select: entrySelect,
        });

        await this.syncEntryReferences(tx, createdEntry.id, entryReferences);

        return createdEntry;
      }),
    );

    return {
      data: mapEntry(entry),
    };
  }

  async listOwnEntries(user: AuthenticatedUser, query: OwnEntriesQueryDto) {
    const normalizedQuery = this.normalizeQuery(query);
    const where: Prisma.CulturalEntryWhereInput = {
      authorId: user.id,
      ...(query.status ? { status: query.status } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.contentTypeId ? { contentTypeId: query.contentTypeId } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.culturalEntry.findMany({
        where,
        select: entrySelect,
        orderBy: this.entryOrderBy(normalizedQuery),
        skip: this.skip(normalizedQuery),
        take: normalizedQuery.limit,
      }),
      this.prisma.culturalEntry.count({ where }),
    ]);

    return {
      data: items.map(mapEntry),
      meta: {
        page: normalizedQuery.page,
        limit: normalizedQuery.limit,
        total,
        totalPages: Math.ceil(total / normalizedQuery.limit),
      },
    };
  }

  async getOwnEntry(user: AuthenticatedUser, id: string) {
    const entry = await this.prisma.culturalEntry.findFirst({
      where: {
        id,
        authorId: user.id,
      },
      select: entrySelect,
    });

    if (!entry) {
      throw this.notFound();
    }

    return {
      data: mapEntry(entry),
    };
  }

  async updateOwnEntry(user: AuthenticatedUser, id: string, input: UpdateEntryDraftDto) {
    const existingEntry = await this.findOwnedEntryForChange(user.id, id);

    if (!editableStatuses.has(existingEntry.status)) {
      throw this.invalidStatus("Only draft or changes-requested entries can be edited.");
    }

    const title =
      input.title === undefined ? existingEntry.title : this.normalizeTitle(input.title);
    const summary =
      input.summary === undefined
        ? existingEntry.summary
        : this.normalizeRequiredText(input.summary, "Summary is required.");
    const contentJson =
      input.contentJson === undefined
        ? existingEntry.contentJson
        : this.validateContent(input.contentJson);
    const plainTextContent =
      input.contentJson === undefined
        ? existingEntry.plainTextContent
        : extractPlainTextFromTiptap(contentJson);
    const entryReferences = extractInternalEntryReferences(contentJson);
    const geographicScope = input.geographicScope ?? existingEntry.geographicScope;
    const provinceId =
      geographicScope === GeographicScope.PROVINCE
        ? (input.provinceId ?? existingEntry.provinceId)
        : input.provinceId === undefined
          ? null
          : input.provinceId;
    const districtId =
      geographicScope === GeographicScope.PROVINCE
        ? input.districtId === undefined
          ? existingEntry.districtId
          : input.districtId
        : input.districtId === undefined
          ? null
          : input.districtId;
    const categoryId = input.categoryId ?? existingEntry.categoryId;
    const contentTypeId = input.contentTypeId ?? existingEntry.contentTypeId;
    const villageOrLocation =
      input.villageOrLocation === undefined
        ? existingEntry.villageOrLocation
        : this.normalizeOptionalText(input.villageOrLocation);
    const taxonomy = await this.validateTaxonomy({
      geographicScope,
      provinceId,
      districtId,
      categoryId,
      contentTypeId,
    });
    const slug =
      input.title === undefined || existingEntry.publishedAt
        ? existingEntry.slug
        : await this.generateUniqueSlug(title, existingEntry.id);

    const entry = await this.withUniqueConstraintHandling(async () =>
      this.prisma.$transaction(async (tx) => {
        const updatedEntry = await tx.culturalEntry.update({
          where: { id: existingEntry.id },
          data: {
            title,
            summary,
            contentJson: contentJson as Prisma.InputJsonValue,
            plainTextContent,
            normalizedSearchText: this.createSearchText({
              title,
              summary,
              plainTextContent,
              villageOrLocation,
              taxonomy,
              tagNames: existingEntry.tags.map((entryTag) => entryTag.tag.name),
            }),
            slug,
            geographicScope: taxonomy.geographicScope,
            provinceId: taxonomy.province?.id ?? null,
            districtId: taxonomy.district?.id ?? null,
            categoryId: taxonomy.category.id,
            contentTypeId: taxonomy.contentType.id,
            villageOrLocation,
          },
          select: entrySelect,
        });

        await this.syncEntryReferences(tx, existingEntry.id, entryReferences);

        return updatedEntry;
      }),
    );

    return {
      data: mapEntry(entry),
    };
  }

  async deleteOwnDraft(user: AuthenticatedUser, id: string) {
    const existingEntry = await this.findOwnedEntryForChange(user.id, id);

    if (existingEntry.status !== EntryStatus.DRAFT || existingEntry.submittedAt) {
      throw this.invalidStatus("Only unsubmitted drafts can be hard-deleted.");
    }

    await this.prisma.culturalEntry.delete({
      where: { id: existingEntry.id },
    });

    return {
      data: {
        message: "Draft deleted successfully.",
      },
    };
  }

  async submitOwnEntry(user: AuthenticatedUser, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const entry = await this.findOwnedSubmissionEntry(tx, user.id, id);

      if (!submittableStatuses.has(entry.status)) {
        throw this.invalidStatus("Only draft or changes-requested entries can be submitted.");
      }

      this.validateEntryReadyForSubmission(entry);

      const previousStatus = entry.status;
      const nextStatus = EntryStatus.PENDING_REVIEW;
      const submittedAt = entry.submittedAt ?? new Date();
      const versionReason =
        previousStatus === EntryStatus.CHANGES_REQUESTED
          ? VersionReason.RESUBMISSION
          : VersionReason.INITIAL_SUBMISSION;
      const updated = await tx.culturalEntry.updateMany({
        where: {
          id: entry.id,
          authorId: user.id,
          status: previousStatus,
        },
        data: {
          status: nextStatus,
          submittedAt,
        },
      });

      if (updated.count !== 1) {
        throw this.submissionConflict();
      }

      const contentVersion = await this.createContentVersion(tx, entry, versionReason, user.id);

      await this.auditService.createWithClient(tx, {
        action: AuditAction.ENTRY_SUBMITTED,
        actorId: user.id,
        entryId: entry.id,
        metadata: {
          entryId: entry.id,
          versionNumber: contentVersion.versionNumber,
          oldStatus: previousStatus,
          newStatus: nextStatus,
          authorId: user.id,
          versionReason,
        },
      });

      const submittedEntry = await tx.culturalEntry.findUnique({
        where: { id: entry.id },
        select: entrySelect,
      });

      if (!submittedEntry) {
        throw this.notFound();
      }

      return {
        data: {
          entry: mapEntry(submittedEntry),
          contentVersion: mapContentVersion(contentVersion),
        },
      };
    });
  }

  async addTags(user: AuthenticatedUser, id: string, input: EntryTagsDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.ensureOwnedEditableEntry(tx, user.id, id);
      const tags = await this.validateActiveTags(tx, input.tagIds);
      const existingTags = await tx.entryTag.findMany({
        where: {
          entryId: id,
          tagId: {
            in: tags.map((tag) => tag.id),
          },
        },
        select: {
          tagId: true,
        },
      });

      if (existingTags.length > 0) {
        throw this.duplicateTags();
      }

      if (tags.length > 0) {
        await tx.entryTag.createMany({
          data: tags.map((tag) => ({
            entryId: id,
            tagId: tag.id,
          })),
        });
      }

      await this.refreshEntrySearchText(tx, id);

      return {
        data: await this.listEntryTags(tx, id),
      };
    });
  }

  async replaceTags(user: AuthenticatedUser, id: string, input: EntryTagsDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.ensureOwnedEditableEntry(tx, user.id, id);
      const tags = await this.validateActiveTags(tx, input.tagIds);

      await tx.entryTag.deleteMany({
        where: { entryId: id },
      });

      if (tags.length > 0) {
        await tx.entryTag.createMany({
          data: tags.map((tag) => ({
            entryId: id,
            tagId: tag.id,
          })),
        });
      }

      await this.refreshEntrySearchText(tx, id);

      return {
        data: await this.listEntryTags(tx, id),
      };
    });
  }

  async removeTag(user: AuthenticatedUser, id: string, tagId: string) {
    return this.prisma.$transaction(async (tx) => {
      await this.ensureOwnedEditableEntry(tx, user.id, id);
      const existingTag = await tx.entryTag.findUnique({
        where: {
          entryId_tagId: {
            entryId: id,
            tagId,
          },
        },
        select: {
          tagId: true,
        },
      });

      if (!existingTag) {
        throw this.invalidTags();
      }

      await tx.entryTag.delete({
        where: {
          entryId_tagId: {
            entryId: id,
            tagId,
          },
        },
      });
      await this.refreshEntrySearchText(tx, id);

      return {
        data: await this.listEntryTags(tx, id),
      };
    });
  }

  async createSource(user: AuthenticatedUser, id: string, input: CreateEntrySourceDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.ensureOwnedEditableEntry(tx, user.id, id);
      const displayOrder = input.displayOrder ?? (await this.getNextSourceDisplayOrder(tx, id));

      await this.ensureSourceDisplayOrderIsAvailable(tx, id, displayOrder);

      const source = await tx.source.create({
        data: {
          ...this.createSourceData(input),
          entryId: id,
          displayOrder,
        },
        select: sourceSelect,
      });

      return {
        data: mapSource(source),
      };
    });
  }

  async updateSource(
    user: AuthenticatedUser,
    id: string,
    sourceId: string,
    input: UpdateEntrySourceDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await this.ensureOwnedEditableEntry(tx, user.id, id);
      const existingSource = await this.findEntrySource(tx, id, sourceId);

      if (input.displayOrder !== undefined) {
        await this.ensureSourceDisplayOrderIsAvailable(
          tx,
          id,
          input.displayOrder,
          existingSource.id,
        );
      }

      const source = await tx.source.update({
        where: { id: existingSource.id },
        data: this.createSourceUpdateData(input),
        select: sourceSelect,
      });

      return {
        data: mapSource(source),
      };
    });
  }

  async deleteSource(user: AuthenticatedUser, id: string, sourceId: string) {
    return this.prisma.$transaction(async (tx) => {
      await this.ensureOwnedEditableEntry(tx, user.id, id);
      const existingSource = await this.findEntrySource(tx, id, sourceId);

      await tx.source.delete({
        where: { id: existingSource.id },
      });

      return {
        data: {
          message: "Source deleted successfully.",
        },
      };
    });
  }

  async reorderSources(user: AuthenticatedUser, id: string, input: ReorderEntrySourcesDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.ensureOwnedEditableEntry(tx, user.id, id);
      this.ensureUniqueSourceIds(input.items.map((item) => item.id));
      this.ensureUniqueDisplayOrders(input.items.map((item) => item.displayOrder));

      const sourceIds = input.items.map((item) => item.id);
      const sources = await tx.source.findMany({
        where: {
          entryId: id,
          id: {
            in: sourceIds,
          },
        },
        select: {
          id: true,
        },
      });

      if (sources.length !== sourceIds.length) {
        throw this.sourceNotFound();
      }

      const conflictingSource = await tx.source.findFirst({
        where: {
          entryId: id,
          id: {
            notIn: sourceIds,
          },
          displayOrder: {
            in: input.items.map((item) => item.displayOrder),
          },
        },
        select: {
          id: true,
        },
      });

      if (conflictingSource) {
        throw this.duplicateSourceOrder();
      }

      await Promise.all(
        input.items.map((item) =>
          tx.source.update({
            where: { id: item.id },
            data: { displayOrder: item.displayOrder },
          }),
        ),
      );

      return {
        data: (await this.listEntrySources(tx, id)).map(mapSource),
      };
    });
  }

  async listImages(user: AuthenticatedUser, id: string) {
    await this.ensureOwnedEditableEntry(this.prisma, user.id, id);

    return {
      data: (await this.listEntryImages(this.prisma, id)).map(mapImage),
    };
  }

  async uploadImage(
    user: AuthenticatedUser,
    id: string,
    input: UploadEntryImageDto,
    file: Express.Multer.File | undefined,
  ) {
    await this.ensureOwnedEditableEntry(this.prisma, user.id, id);
    this.validateImageFile(file);
    this.ensureImagePermission(input.permissionConfirmed);
    const displayOrder =
      input.displayOrder ?? (await this.getNextImageDisplayOrder(this.prisma, id));

    await this.ensureImageDisplayOrderIsAvailable(this.prisma, id, displayOrder);
    await this.ensureImageCountAllowsUpload(this.prisma, id);

    const uploadedImage = await this.mediaService.uploadEntryImage(file);

    try {
      const image = await this.prisma.image.create({
        data: {
          entryId: id,
          uploadedById: user.id,
          cloudinaryPublicId: uploadedImage.publicId,
          url: uploadedImage.url,
          secureUrl: uploadedImage.secureUrl,
          thumbnailUrl: uploadedImage.thumbnailUrl,
          width: uploadedImage.width,
          height: uploadedImage.height,
          format: uploadedImage.format,
          bytes: uploadedImage.bytes,
          caption: this.normalizeOptionalText(input.caption),
          altText: this.normalizeRequiredText(input.altText, "Image alt text is required."),
          photographerOrSource: this.normalizeOptionalText(input.photographerOrSource),
          permissionConfirmed: input.permissionConfirmed,
          displayOrder,
        },
        select: imageSelect,
      });

      return {
        data: mapImage(image),
      };
    } catch (error) {
      await this.cleanupUploadedImage(uploadedImage.publicId);
      throw error;
    }
  }

  async updateImageMetadata(
    user: AuthenticatedUser,
    id: string,
    imageId: string,
    input: UpdateEntryImageMetadataDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await this.ensureOwnedEditableEntry(tx, user.id, id);
      const existingImage = await this.findEntryImage(tx, id, imageId);

      if (input.permissionConfirmed === false) {
        throw this.imagePermissionRequired();
      }

      if (input.displayOrder !== undefined) {
        await this.ensureImageDisplayOrderIsAvailable(tx, id, input.displayOrder, existingImage.id);
      }

      const image = await tx.image.update({
        where: { id: existingImage.id },
        data: this.createImageUpdateData(input),
        select: imageSelect,
      });

      return {
        data: mapImage(image),
      };
    });
  }

  async deleteImage(user: AuthenticatedUser, id: string, imageId: string) {
    await this.ensureOwnedEditableEntry(this.prisma, user.id, id);
    const existingImage = await this.findEntryImage(this.prisma, id, imageId);

    await this.mediaService.deleteImage(existingImage.cloudinaryPublicId);
    await this.prisma.image.delete({
      where: { id: existingImage.id },
    });

    return {
      data: {
        message: "Image deleted successfully.",
      },
    };
  }

  async reorderImages(user: AuthenticatedUser, id: string, input: ReorderEntryImagesDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.ensureOwnedEditableEntry(tx, user.id, id);
      this.ensureUniqueImageIds(input.items.map((item) => item.id));
      this.ensureUniqueImageDisplayOrders(input.items.map((item) => item.displayOrder));

      const imageIds = input.items.map((item) => item.id);
      const images = await tx.image.findMany({
        where: {
          entryId: id,
          id: {
            in: imageIds,
          },
          isRemoved: false,
        },
        select: {
          id: true,
        },
      });

      if (images.length !== imageIds.length) {
        throw this.imageNotFound();
      }

      const conflictingImage = await tx.image.findFirst({
        where: {
          entryId: id,
          isRemoved: false,
          id: {
            notIn: imageIds,
          },
          displayOrder: {
            in: input.items.map((item) => item.displayOrder),
          },
        },
        select: {
          id: true,
        },
      });

      if (conflictingImage) {
        throw this.duplicateImageOrder();
      }

      await Promise.all(
        input.items.map((item) =>
          tx.image.update({
            where: { id: item.id },
            data: { displayOrder: item.displayOrder },
          }),
        ),
      );

      return {
        data: (await this.listEntryImages(tx, id)).map(mapImage),
      };
    });
  }

  async getYouTubeVideo(user: AuthenticatedUser, id: string) {
    await this.ensureOwnedEditableEntry(this.prisma, user.id, id);
    const video = await this.prisma.youTubeVideo.findUnique({
      where: { entryId: id },
      select: youtubeVideoSelect,
    });

    return {
      data: video && !video.isRemoved ? mapYouTubeVideo(video) : null,
    };
  }

  async upsertYouTubeVideo(user: AuthenticatedUser, id: string, input: UpsertEntryYouTubeVideoDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.ensureOwnedEditableEntry(tx, user.id, id);
      const videoId = this.extractRequiredYouTubeVideoId(input.url);
      const url = createCanonicalYouTubeUrl(videoId);
      const existingVideo = await tx.youTubeVideo.findUnique({
        where: { entryId: id },
        select: {
          id: true,
          isRemoved: true,
        },
      });

      const data = {
        videoId,
        url,
        title: this.normalizeOptionalText(input.title),
        description: this.normalizeOptionalText(input.description),
        isRemoved: false,
        removedById: null,
        removedAt: null,
      };
      const video = existingVideo
        ? await tx.youTubeVideo.update({
            where: { id: existingVideo.id },
            data,
            select: youtubeVideoSelect,
          })
        : await tx.youTubeVideo.create({
            data: {
              entryId: id,
              ...data,
            },
            select: youtubeVideoSelect,
          });

      return {
        data: mapYouTubeVideo(video),
      };
    });
  }

  async updateYouTubeVideo(user: AuthenticatedUser, id: string, input: UpdateEntryYouTubeVideoDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.ensureOwnedEditableEntry(tx, user.id, id);
      const existingVideo = await this.findEntryYouTubeVideo(tx, id);
      const video = await tx.youTubeVideo.update({
        where: { id: existingVideo.id },
        data: {
          ...(input.title !== undefined ? { title: this.normalizeOptionalText(input.title) } : {}),
          ...(input.description !== undefined
            ? { description: this.normalizeOptionalText(input.description) }
            : {}),
        },
        select: youtubeVideoSelect,
      });

      return {
        data: mapYouTubeVideo(video),
      };
    });
  }

  async removeYouTubeVideo(user: AuthenticatedUser, id: string) {
    return this.prisma.$transaction(async (tx) => {
      await this.ensureOwnedEditableEntry(tx, user.id, id);
      const existingVideo = await this.findEntryYouTubeVideo(tx, id);

      await tx.youTubeVideo.delete({
        where: { id: existingVideo.id },
      });

      return {
        data: {
          message: "YouTube video removed successfully.",
        },
      };
    });
  }

  async searchReferenceTargets(query: EntryReferenceSearchQueryDto) {
    const search = query.search?.trim();
    const limit = query.limit ?? 10;
    const where: Prisma.CulturalEntryWhereInput = {
      status: EntryStatus.PUBLISHED,
      ...(search
        ? {
            OR: [
              {
                title: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                slug: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };
    const entries = await this.prisma.culturalEntry.findMany({
      where,
      select: entryReferenceTargetSelect,
      orderBy: [{ publishedAt: "desc" }, { title: "asc" }],
      take: Math.min(limit * 3, 60),
    });

    return {
      data: this.rankReferenceTargets(entries, search).slice(0, limit),
    };
  }

  async validateReferenceTarget(targetEntryId: string) {
    const target = await this.findPublishedReferenceTarget(this.prisma, targetEntryId);

    return {
      data: target,
    };
  }

  async listOutgoingReferences(user: AuthenticatedUser, id: string) {
    await this.ensureOwnedEntry(this.prisma, user.id, id);
    const references = await this.prisma.entryReference.findMany({
      where: { sourceEntryId: id },
      select: outgoingEntryReferenceSelect,
      orderBy: { createdAt: "asc" },
    });

    return {
      data: references.map(mapOutgoingEntryReference),
    };
  }

  async listIncomingReferences(user: AuthenticatedUser, id: string) {
    await this.ensureOwnedEntry(this.prisma, user.id, id);
    const references = await this.prisma.entryReference.findMany({
      where: {
        targetEntryId: id,
        sourceEntry: {
          OR: [{ status: EntryStatus.PUBLISHED }, { authorId: user.id }],
        },
      },
      select: incomingEntryReferenceSelect,
      orderBy: { createdAt: "asc" },
    });

    return {
      data: references.map(mapIncomingEntryReference),
    };
  }

  private async syncEntryReferences(
    client: EntriesDbClient,
    sourceEntryId: string,
    references: InternalEntryReference[],
  ): Promise<void> {
    const normalizedReferences = this.normalizeEntryReferences(references);

    if (normalizedReferences.length === 0) {
      await client.entryReference.deleteMany({
        where: { sourceEntryId },
      });
      return;
    }

    if (normalizedReferences.some((reference) => reference.targetEntryId === sourceEntryId)) {
      throw this.selfReference();
    }

    await this.validatePublishedReferenceTargets(
      client,
      normalizedReferences.map((reference) => reference.targetEntryId),
    );

    const currentReferences = await client.entryReference.findMany({
      where: { sourceEntryId },
      select: {
        id: true,
        targetEntryId: true,
        anchorText: true,
      },
    });
    const desiredKeys = new Set(
      normalizedReferences.map((reference) => this.referenceKey(reference)),
    );
    const currentKeys = new Set(currentReferences.map((reference) => this.referenceKey(reference)));
    const referenceIdsToDelete = currentReferences
      .filter((reference) => !desiredKeys.has(this.referenceKey(reference)))
      .map((reference) => reference.id);
    const referencesToCreate = normalizedReferences.filter(
      (reference) => !currentKeys.has(this.referenceKey(reference)),
    );

    if (referenceIdsToDelete.length > 0) {
      await client.entryReference.deleteMany({
        where: {
          id: {
            in: referenceIdsToDelete,
          },
        },
      });
    }

    if (referencesToCreate.length > 0) {
      await client.entryReference.createMany({
        data: referencesToCreate.map((reference) => ({
          sourceEntryId,
          targetEntryId: reference.targetEntryId,
          anchorText: reference.anchorText,
        })),
      });
    }
  }

  private normalizeEntryReferences(
    references: InternalEntryReference[],
  ): NormalizedEntryReference[] {
    const normalizedReferences = references.map((reference) => ({
      targetEntryId: reference.targetEntryId,
      anchorText: reference.anchorText.trim().replace(/\s+/g, " "),
    }));

    for (const reference of normalizedReferences) {
      if (
        !reference.anchorText ||
        reference.anchorText.length > MAX_REFERENCE_ANCHOR_LENGTH ||
        /<\/?\s*(script|iframe|img|table|video|youtube)\b/i.test(reference.anchorText)
      ) {
        throw this.invalidReferenceAnchor();
      }
    }

    const referenceKeys = normalizedReferences.map((reference) => this.referenceKey(reference));

    if (new Set(referenceKeys).size !== referenceKeys.length) {
      throw this.duplicateReference();
    }

    return normalizedReferences;
  }

  private async validatePublishedReferenceTargets(
    client: EntriesDbClient,
    targetEntryIds: string[],
  ): Promise<void> {
    const uniqueTargetEntryIds = [...new Set(targetEntryIds)];
    const targets = await client.culturalEntry.findMany({
      where: {
        id: {
          in: uniqueTargetEntryIds,
        },
        status: EntryStatus.PUBLISHED,
      },
      select: {
        id: true,
      },
    });

    if (targets.length !== uniqueTargetEntryIds.length) {
      throw this.invalidReferenceTarget();
    }
  }

  private async findPublishedReferenceTarget(client: EntriesDbClient, targetEntryId: string) {
    const target = await client.culturalEntry.findFirst({
      where: {
        id: targetEntryId,
        status: EntryStatus.PUBLISHED,
      },
      select: entryReferenceTargetSelect,
    });

    if (!target) {
      throw this.invalidReferenceTarget();
    }

    return target;
  }

  private rankReferenceTargets<TEntry extends { title: string; slug: string | null }>(
    entries: TEntry[],
    search: string | undefined,
  ): TEntry[] {
    if (!search) {
      return entries;
    }

    const normalizedSearch = search.toLowerCase();

    return [...entries].sort(
      (left, right) =>
        this.referenceTargetRank(left, normalizedSearch) -
          this.referenceTargetRank(right, normalizedSearch) ||
        left.title.localeCompare(right.title),
    );
  }

  private referenceTargetRank(
    entry: { title: string; slug: string | null },
    search: string,
  ): number {
    const title = entry.title.toLowerCase();
    const slug = entry.slug?.toLowerCase() ?? "";

    if (title === search || slug === search) {
      return 0;
    }

    if (title.startsWith(search) || slug.startsWith(search)) {
      return 1;
    }

    return 2;
  }

  private referenceKey(reference: { targetEntryId: string; anchorText: string }): string {
    return `${reference.targetEntryId}:${reference.anchorText}`;
  }

  private normalizePublicEntryQuery(query: PublicEntryQueryDto): NormalizedPublicEntryQuery {
    const sort = query.sort ?? "newest";

    if (sort !== "newest" && sort !== "oldest" && sort !== "recentlyUpdated") {
      throw this.invalidPublicQuery("Public entry sort value is invalid.");
    }

    return {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      sort,
    };
  }

  private createPublicEntryWhere(query: PublicEntryQueryDto): Prisma.CulturalEntryWhereInput {
    const searchTerms = this.normalizePublicSearchTerms(query.search);
    const provinceId = this.normalizeUuidFilter(query.provinceId, "provinceId");
    const provinceSlug = this.normalizeSlugFilter(query.provinceSlug, "provinceSlug");
    const districtId = this.normalizeUuidFilter(query.districtId, "districtId");
    const districtSlug = this.normalizeSlugFilter(query.districtSlug, "districtSlug");
    const categoryId = this.normalizeUuidFilter(query.categoryId, "categoryId");
    const categorySlug = this.normalizeSlugFilter(query.categorySlug, "categorySlug");
    const contentTypeId = this.normalizeUuidFilter(query.contentTypeId, "contentTypeId");
    const contentTypeSlug = this.normalizeSlugFilter(query.contentTypeSlug, "contentTypeSlug");
    const tagId = this.normalizeUuidFilter(query.tagId, "tagId");
    const tagSlug = this.normalizeSlugFilter(query.tagSlug, "tagSlug");
    const authorId = this.normalizeUuidFilter(query.authorId, "authorId");
    const hasProvinceFilter = Boolean(provinceId || provinceSlug || districtId || districtSlug);

    if (
      query.geographicScope &&
      query.geographicScope !== GeographicScope.PROVINCE &&
      hasProvinceFilter
    ) {
      throw this.invalidPublicFilter(
        "Province and district filters can only be used with PROVINCE geographic scope.",
      );
    }

    return {
      status: EntryStatus.PUBLISHED,
      publishedAt: {
        not: null,
      },
      ...(searchTerms.length > 0
        ? {
            AND: searchTerms.map((term) => ({
              normalizedSearchText: {
                contains: term,
              },
            })),
          }
        : {}),
      ...(query.geographicScope ? { geographicScope: query.geographicScope } : {}),
      ...(!query.geographicScope && hasProvinceFilter
        ? { geographicScope: GeographicScope.PROVINCE }
        : {}),
      ...(provinceId ? { provinceId } : {}),
      ...(districtId ? { districtId } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(contentTypeId ? { contentTypeId } : {}),
      ...(authorId ? { authorId } : {}),
      ...(provinceSlug ? { province: { slug: provinceSlug } } : {}),
      ...(districtSlug ? { district: { slug: districtSlug } } : {}),
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(contentTypeSlug ? { contentType: { slug: contentTypeSlug } } : {}),
      ...(tagId || tagSlug
        ? {
            tags: {
              some: {
                ...(tagId ? { tagId } : {}),
                ...(tagSlug ? { tag: { slug: tagSlug } } : {}),
              },
            },
          }
        : {}),
    };
  }

  private async ensurePublicDistrictProvinceFilterIsValid(
    query: PublicEntryQueryDto,
  ): Promise<void> {
    const provinceId = this.normalizeUuidFilter(query.provinceId, "provinceId");
    const provinceSlug = this.normalizeSlugFilter(query.provinceSlug, "provinceSlug");
    const districtId = this.normalizeUuidFilter(query.districtId, "districtId");
    const districtSlug = this.normalizeSlugFilter(query.districtSlug, "districtSlug");

    if ((!provinceId && !provinceSlug) || (!districtId && !districtSlug)) {
      return;
    }

    const district = await this.prisma.district.findFirst({
      where: {
        ...(districtId ? { id: districtId } : {}),
        ...(districtSlug ? { slug: districtSlug } : {}),
      },
      select: {
        provinceId: true,
        province: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!district) {
      throw this.invalidPublicFilter("District filter is invalid.");
    }

    if (provinceId && district.provinceId !== provinceId) {
      throw this.invalidPublicFilter("District does not belong to the selected province.");
    }

    if (provinceSlug && district.province.slug !== provinceSlug) {
      throw this.invalidPublicFilter("District does not belong to the selected province.");
    }
  }

  private publicEntryOrderBy(
    query: NormalizedPublicEntryQuery,
  ): Prisma.CulturalEntryOrderByWithRelationInput[] {
    switch (query.sort) {
      case "oldest":
        return [{ publishedAt: "asc" }, { createdAt: "asc" }, { id: "asc" }];
      case "recentlyUpdated":
        return [{ updatedAt: "desc" }, { publishedAt: "desc" }, { id: "asc" }];
      case "newest":
        return [{ publishedAt: "desc" }, { createdAt: "desc" }, { id: "asc" }];
    }
  }

  private normalizeUuidFilter(value: string | undefined, field: string): string | undefined {
    const normalizedValue = this.normalizeFilterValue(value);

    if (!normalizedValue) {
      return undefined;
    }

    if (!UUID_PATTERN.test(normalizedValue)) {
      throw this.invalidPublicQuery(`${field} must be a valid UUID.`);
    }

    return normalizedValue;
  }

  private normalizeSlugFilter(value: string | undefined, field: string): string | undefined {
    const normalizedValue = this.normalizeFilterValue(value);

    if (!normalizedValue) {
      return undefined;
    }

    if (!TAXONOMY_SLUG_PATTERN.test(normalizedValue)) {
      throw this.invalidPublicQuery(`${field} must be a valid slug.`);
    }

    return normalizedValue;
  }

  private normalizePublicSlug(slug: string): string {
    let decodedSlug = slug.trim();

    try {
      decodedSlug = decodeURIComponent(decodedSlug);
    } catch {
      throw this.invalidPublicQuery("Entry slug must be a valid slug.");
    }

    const normalizedSlug = normalizeEntrySlug(decodedSlug);

    if (!isValidEntrySlug(normalizedSlug)) {
      throw this.invalidPublicQuery("Entry slug must be a valid slug.");
    }

    return normalizedSlug;
  }

  private normalizeFilterValue(value: string | undefined): string | undefined {
    const normalizedValue = value?.trim().toLowerCase();

    return normalizedValue || undefined;
  }

  private normalizePublicSearchTerms(value: string | undefined): string[] {
    if (!value) {
      return [];
    }

    return [
      ...new Set(
        normalizeEntrySearchText([value.replace(/[\u200C\u200D]/g, " ")])
          .split(" ")
          .filter(Boolean),
      ),
    ];
  }

  private async validateTaxonomy({
    geographicScope,
    provinceId,
    districtId,
    categoryId,
    contentTypeId,
  }: {
    geographicScope: GeographicScope;
    provinceId: string | null | undefined;
    districtId?: string | null;
    categoryId: string | null | undefined;
    contentTypeId: string | null | undefined;
  }): Promise<ValidatedTaxonomy> {
    if (!categoryId || !contentTypeId) {
      throw this.invalidTaxonomy();
    }

    if (geographicScope === GeographicScope.PROVINCE && !provinceId) {
      throw this.invalidGeography("Province is required for provincial Cultural Entries.");
    }

    if (geographicScope !== GeographicScope.PROVINCE && (provinceId || districtId)) {
      throw this.invalidGeography(
        "Province and district must be empty for national or non-geographic Cultural Entries.",
      );
    }

    const [province, category, contentType, district] = await Promise.all([
      provinceId
        ? this.prisma.province.findFirst({
            where: { id: provinceId, isActive: true },
            select: taxonomyReferenceSelect,
          })
        : Promise.resolve(null),
      this.prisma.category.findFirst({
        where: { id: categoryId, isActive: true },
        select: taxonomyReferenceSelect,
      }),
      this.prisma.contentType.findFirst({
        where: { id: contentTypeId, isActive: true },
        select: taxonomyReferenceSelect,
      }),
      districtId
        ? this.prisma.district.findFirst({
            where: { id: districtId, isActive: true },
            select: districtReferenceSelect,
          })
        : Promise.resolve(null),
    ]);

    if (
      (geographicScope === GeographicScope.PROVINCE && !province) ||
      !category ||
      !contentType ||
      (districtId && !district)
    ) {
      throw this.invalidTaxonomy();
    }

    if (district && district.provinceId !== province?.id) {
      throw new BadRequestException({
        error: ENTRY_ERROR_CODES.DISTRICT_PROVINCE_MISMATCH,
        message: "District does not belong to the selected province.",
      });
    }

    return {
      geographicScope,
      province,
      district,
      category,
      contentType,
    };
  }

  private validateContent(contentJson: unknown): Record<string, unknown> {
    try {
      extractPlainTextFromTiptap(contentJson);
    } catch (error) {
      if (error instanceof TiptapValidationError) {
        throw new BadRequestException({
          error: ENTRY_ERROR_CODES.CONTENT_INVALID,
          message: error.message,
        });
      }

      throw error;
    }

    return contentJson as Record<string, unknown>;
  }

  private async validateActiveTags(
    client: EntriesDbClient,
    tagIds: string[],
  ): Promise<TaxonomyReference[]> {
    this.ensureUniqueTagIds(tagIds);

    if (tagIds.length === 0) {
      return [];
    }

    const tags = await client.tag.findMany({
      where: {
        id: {
          in: tagIds,
        },
        isActive: true,
      },
      select: taxonomyReferenceSelect,
    });

    if (tags.length !== tagIds.length) {
      throw this.invalidTags();
    }

    const tagsById = new Map(tags.map((tag) => [tag.id, tag]));

    return tagIds.map((tagId) => {
      const tag = tagsById.get(tagId);

      if (!tag) {
        throw this.invalidTags();
      }

      return tag;
    });
  }

  private async listEntryTags(
    client: EntriesDbClient,
    entryId: string,
  ): Promise<TaxonomyReference[]> {
    const entryTags = await client.entryTag.findMany({
      where: { entryId },
      select: {
        tag: {
          select: taxonomyReferenceSelect,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return entryTags.map((entryTag) => entryTag.tag);
  }

  private async listEntrySources(client: EntriesDbClient, entryId: string) {
    return client.source.findMany({
      where: { entryId },
      select: sourceSelect,
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    });
  }

  private async findEntrySource(client: EntriesDbClient, entryId: string, sourceId: string) {
    const source = await client.source.findFirst({
      where: {
        id: sourceId,
        entryId,
      },
      select: {
        id: true,
        displayOrder: true,
      },
    });

    if (!source) {
      throw this.sourceNotFound();
    }

    return source;
  }

  private async listEntryImages(client: EntriesDbClient, entryId: string) {
    return client.image.findMany({
      where: {
        entryId,
        isRemoved: false,
      },
      select: imageSelect,
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    });
  }

  private async findEntryImage(client: EntriesDbClient, entryId: string, imageId: string) {
    const image = await client.image.findFirst({
      where: {
        id: imageId,
        entryId,
        isRemoved: false,
      },
      select: {
        id: true,
        cloudinaryPublicId: true,
        displayOrder: true,
      },
    });

    if (!image) {
      throw this.imageNotFound();
    }

    return image;
  }

  private async findEntryYouTubeVideo(client: EntriesDbClient, entryId: string) {
    const video = await client.youTubeVideo.findUnique({
      where: { entryId },
      select: {
        id: true,
        isRemoved: true,
      },
    });

    if (!video || video.isRemoved) {
      throw this.youtubeVideoNotFound();
    }

    return video;
  }

  private async getNextImageDisplayOrder(
    client: EntriesDbClient,
    entryId: string,
  ): Promise<number> {
    const result = await client.image.aggregate({
      where: {
        entryId,
        isRemoved: false,
      },
      _max: {
        displayOrder: true,
      },
    });

    return (result._max.displayOrder ?? -1) + 1;
  }

  private async ensureImageDisplayOrderIsAvailable(
    client: EntriesDbClient,
    entryId: string,
    displayOrder: number,
    excludeImageId?: string,
  ): Promise<void> {
    const existingImage = await client.image.findFirst({
      where: {
        entryId,
        displayOrder,
        isRemoved: false,
        ...(excludeImageId ? { NOT: { id: excludeImageId } } : {}),
      },
      select: {
        id: true,
      },
    });

    if (existingImage) {
      throw this.duplicateImageOrder();
    }
  }

  private async ensureImageCountAllowsUpload(
    client: EntriesDbClient,
    entryId: string,
  ): Promise<void> {
    const imageCount = await client.image.count({
      where: {
        entryId,
        isRemoved: false,
      },
    });

    if (imageCount >= this.getMaxImagesPerEntry()) {
      throw this.imageLimitExceeded();
    }
  }

  private async getNextSourceDisplayOrder(
    client: EntriesDbClient,
    entryId: string,
  ): Promise<number> {
    const result = await client.source.aggregate({
      where: { entryId },
      _max: {
        displayOrder: true,
      },
    });

    return (result._max.displayOrder ?? -1) + 1;
  }

  private async ensureSourceDisplayOrderIsAvailable(
    client: EntriesDbClient,
    entryId: string,
    displayOrder: number,
    excludeSourceId?: string,
  ): Promise<void> {
    const existingSource = await client.source.findFirst({
      where: {
        entryId,
        displayOrder,
        ...(excludeSourceId ? { NOT: { id: excludeSourceId } } : {}),
      },
      select: {
        id: true,
      },
    });

    if (existingSource) {
      throw this.duplicateSourceOrder();
    }
  }

  private createSourceData(input: CreateEntrySourceDto): SourceCreateData {
    return {
      type: input.type,
      title: this.normalizeOptionalText(input.title),
      authorOrProvider: this.normalizeOptionalText(input.authorOrProvider),
      publicationDate: this.normalizeOptionalText(input.publicationDate),
      websiteUrl: this.normalizeOptionalUrl(input.websiteUrl),
      bookOrArticleDetails: this.normalizeOptionalText(input.bookOrArticleDetails),
      interviewDate: this.normalizeOptionalDate(input.interviewDate),
      explanation: this.normalizeOptionalText(input.explanation),
    };
  }

  private createSourceUpdateData(input: UpdateEntrySourceDto): Prisma.SourceUncheckedUpdateInput {
    const data: Prisma.SourceUncheckedUpdateInput = {};

    if (input.type !== undefined) {
      data.type = input.type;
    }

    if (input.title !== undefined) {
      data.title = this.normalizeOptionalText(input.title);
    }

    if (input.authorOrProvider !== undefined) {
      data.authorOrProvider = this.normalizeOptionalText(input.authorOrProvider);
    }

    if (input.publicationDate !== undefined) {
      data.publicationDate = this.normalizeOptionalText(input.publicationDate);
    }

    if (input.websiteUrl !== undefined) {
      data.websiteUrl = this.normalizeOptionalUrl(input.websiteUrl);
    }

    if (input.bookOrArticleDetails !== undefined) {
      data.bookOrArticleDetails = this.normalizeOptionalText(input.bookOrArticleDetails);
    }

    if (input.interviewDate !== undefined) {
      data.interviewDate = this.normalizeOptionalDate(input.interviewDate);
    }

    if (input.explanation !== undefined) {
      data.explanation = this.normalizeOptionalText(input.explanation);
    }

    if (input.displayOrder !== undefined) {
      data.displayOrder = input.displayOrder;
    }

    return data;
  }

  private createImageUpdateData(
    input: UpdateEntryImageMetadataDto,
  ): Prisma.ImageUncheckedUpdateInput {
    const data: Prisma.ImageUncheckedUpdateInput = {};

    if (input.altText !== undefined) {
      data.altText = this.normalizeRequiredText(input.altText, "Image alt text is required.");
    }

    if (input.caption !== undefined) {
      data.caption = this.normalizeOptionalText(input.caption);
    }

    if (input.photographerOrSource !== undefined) {
      data.photographerOrSource = this.normalizeOptionalText(input.photographerOrSource);
    }

    if (input.permissionConfirmed !== undefined) {
      data.permissionConfirmed = input.permissionConfirmed;
    }

    if (input.displayOrder !== undefined) {
      data.displayOrder = input.displayOrder;
    }

    return data;
  }

  private async findOwnedSubmissionEntry(
    client: EntriesDbClient,
    authorId: string,
    id: string,
  ): Promise<SubmissionEntryPayload> {
    const entry = await client.culturalEntry.findFirst({
      where: {
        id,
        authorId,
      },
      select: submissionEntrySelect,
    });

    if (!entry) {
      throw this.notFound();
    }

    return entry;
  }

  private validateEntryReadyForSubmission(entry: SubmissionEntryPayload): void {
    const contentJson = this.validateContent(entry.contentJson);
    const plainTextContent = extractPlainTextFromTiptap(contentJson).trim();
    const extractedReferences = extractInternalEntryReferences(contentJson);

    if (!entry.title.trim() || !entry.summary.trim() || !plainTextContent) {
      throw this.incompleteSubmission("Title, summary, and content are required for submission.");
    }

    if (!entry.slug) {
      throw this.incompleteSubmission("Entry slug is required before submission.");
    }

    if (
      !entry.category?.isActive ||
      !entry.contentType?.isActive ||
      !this.entryGeographyIsValidForSubmission(entry)
    ) {
      throw this.incompleteSubmission("One or more taxonomy references are inactive or invalid.");
    }

    if (entry.images.length > this.getMaxImagesPerEntry()) {
      throw this.incompleteSubmission("Entry has too many images.");
    }

    for (const image of entry.images) {
      if (!image.altText.trim() || !image.permissionConfirmed) {
        throw this.incompleteSubmission("All images require alt text and permission confirmation.");
      }
    }

    for (const source of entry.sources) {
      if (source.websiteUrl) {
        this.normalizeOptionalUrl(source.websiteUrl);
      }
    }

    if (entry.youtubeVideo && !entry.youtubeVideo.isRemoved) {
      const videoId = extractYouTubeVideoId(entry.youtubeVideo.url);

      if (!videoId || videoId !== entry.youtubeVideo.videoId) {
        throw this.incompleteSubmission("YouTube video data is invalid.");
      }
    }

    if (entry.tags.some((entryTag) => !entryTag.tag.isActive)) {
      throw this.incompleteSubmission("Inactive tags cannot be submitted.");
    }

    this.validateSubmissionReferences(entry, extractedReferences);
  }

  private entryGeographyIsValidForSubmission(entry: SubmissionEntryPayload): boolean {
    if (entry.geographicScope === GeographicScope.PROVINCE) {
      return Boolean(
        entry.province?.isActive &&
          (!entry.district ||
            (entry.district.isActive && entry.district.provinceId === entry.provinceId)),
      );
    }

    return !entry.provinceId && !entry.districtId && !entry.province && !entry.district;
  }

  private validateSubmissionReferences(
    entry: SubmissionEntryPayload,
    extractedReferences: InternalEntryReference[],
  ): void {
    const extractedReferenceKeys = new Set(
      extractedReferences.map((reference) =>
        this.referenceKey({
          targetEntryId: reference.targetEntryId,
          anchorText: reference.anchorText.trim().replace(/\s+/g, " "),
        }),
      ),
    );
    const storedReferenceKeys = new Set(
      entry.outgoingReferences.map((reference) => this.referenceKey(reference)),
    );

    if (extractedReferences.some((reference) => reference.targetEntryId === entry.id)) {
      throw this.invalidSubmissionReference("An entry cannot reference itself.");
    }

    if (extractedReferenceKeys.size !== extractedReferences.length) {
      throw this.invalidSubmissionReference("Duplicate internal entry references are not allowed.");
    }

    if (extractedReferenceKeys.size !== storedReferenceKeys.size) {
      throw this.invalidSubmissionReference("Internal entry references are out of sync.");
    }

    for (const referenceKey of extractedReferenceKeys) {
      if (!storedReferenceKeys.has(referenceKey)) {
        throw this.invalidSubmissionReference("Internal entry references are out of sync.");
      }
    }

    for (const reference of entry.outgoingReferences) {
      if (
        reference.targetEntryId === entry.id ||
        reference.targetEntry.status !== EntryStatus.PUBLISHED ||
        !reference.targetEntry.publishedAt
      ) {
        throw this.invalidSubmissionReference("Internal entry reference target is not published.");
      }
    }
  }

  private async createContentVersion(
    client: EntriesDbClient,
    entry: SubmissionEntryPayload,
    versionReason: VersionReason,
    creatorId: string,
  ) {
    const versionNumber = await this.getNextContentVersionNumber(client, entry.id);
    const createdAt = new Date();

    return client.contentVersion.create({
      data: {
        entryId: entry.id,
        versionNumber,
        snapshot: this.createContentSnapshot(entry, versionReason, creatorId, createdAt),
        plainTextContent: entry.plainTextContent,
        versionReason,
        createdById: creatorId,
      },
      select: contentVersionSelect,
    });
  }

  private async getNextContentVersionNumber(
    client: EntriesDbClient,
    entryId: string,
  ): Promise<number> {
    const result = await client.contentVersion.aggregate({
      where: { entryId },
      _max: {
        versionNumber: true,
      },
    });

    return (result._max.versionNumber ?? 0) + 1;
  }

  private createContentSnapshot(
    entry: SubmissionEntryPayload,
    versionReason: VersionReason,
    creatorId: string,
    createdAt: Date,
  ): Prisma.InputJsonValue {
    return {
      schemaVersion: 1,
      entryId: entry.id,
      key: entry.key,
      title: entry.title,
      summary: entry.summary,
      contentJson: entry.contentJson as Prisma.InputJsonValue,
      plainTextContent: entry.plainTextContent,
      normalizedSearchText: entry.normalizedSearchText,
      slug: entry.slug,
      geographicScope: entry.geographicScope,
      province: entry.province ? this.mapTaxonomySnapshot(entry.province) : null,
      district: entry.district ? this.mapTaxonomySnapshot(entry.district) : null,
      category: this.mapTaxonomySnapshot(entry.category),
      contentType: this.mapTaxonomySnapshot(entry.contentType),
      villageOrLocation: entry.villageOrLocation,
      tags: entry.tags.map((entryTag) => this.mapTaxonomySnapshot(entryTag.tag)),
      sources: entry.sources.map((source) => ({
        id: source.id,
        type: source.type,
        title: source.title,
        authorOrProvider: source.authorOrProvider,
        publicationDate: source.publicationDate,
        websiteUrl: source.websiteUrl,
        bookOrArticleDetails: source.bookOrArticleDetails,
        interviewDate: this.toIsoString(source.interviewDate),
        explanation: source.explanation,
        displayOrder: source.displayOrder,
      })),
      images: entry.images.map((image) => ({
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
      })),
      youtubeVideo:
        entry.youtubeVideo && !entry.youtubeVideo.isRemoved
          ? {
              id: entry.youtubeVideo.id,
              videoId: entry.youtubeVideo.videoId,
              url: entry.youtubeVideo.url,
              title: entry.youtubeVideo.title,
              description: entry.youtubeVideo.description,
            }
          : null,
      internalReferences: entry.outgoingReferences.map((reference) => ({
        targetEntryId: reference.targetEntryId,
        targetSlug: reference.targetEntry.slug,
        targetTitle: reference.targetEntry.title,
        anchorText: reference.anchorText,
      })),
      versionReason,
      creatorId,
      createdAt: createdAt.toISOString(),
    };
  }

  private mapTaxonomySnapshot(taxonomy: TaxonomyReference) {
    return {
      id: taxonomy.id,
      name: taxonomy.name,
      slug: taxonomy.slug,
    };
  }

  private toIsoString(value: Date | null): string | null {
    return value ? value.toISOString() : null;
  }

  private async findOwnedEntryForChange(authorId: string, id: string) {
    const entry = await this.prisma.culturalEntry.findFirst({
      where: {
        id,
        authorId,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        contentJson: true,
        plainTextContent: true,
        status: true,
        geographicScope: true,
        provinceId: true,
        districtId: true,
        categoryId: true,
        contentTypeId: true,
        villageOrLocation: true,
        submittedAt: true,
        publishedAt: true,
        tags: {
          select: {
            tag: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!entry) {
      throw this.notFound();
    }

    return entry;
  }

  private async ensureOwnedEditableEntry(client: EntriesDbClient, authorId: string, id: string) {
    const entry = await client.culturalEntry.findFirst({
      where: {
        id,
        authorId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!entry) {
      throw this.notFound();
    }

    if (!editableStatuses.has(entry.status)) {
      throw this.invalidStatus("Only draft or changes-requested entries can be edited.");
    }

    return entry;
  }

  private async ensureOwnedEntry(client: EntriesDbClient, authorId: string, id: string) {
    const entry = await client.culturalEntry.findFirst({
      where: {
        id,
        authorId,
      },
      select: {
        id: true,
      },
    });

    if (!entry) {
      throw this.notFound();
    }

    return entry;
  }

  private async generateUniqueSlug(title: string, excludeEntryId?: string): Promise<string> {
    return createUniqueEntrySlug(title, (slug) => this.slugExists(slug, excludeEntryId));
  }

  private async slugExists(slug: string, excludeEntryId?: string): Promise<boolean> {
    const existingEntry = await this.prisma.culturalEntry.findFirst({
      where: {
        slug,
        ...(excludeEntryId ? { NOT: { id: excludeEntryId } } : {}),
      },
      select: { id: true },
    });

    return Boolean(existingEntry);
  }

  private createSearchText({
    title,
    summary,
    plainTextContent,
    villageOrLocation,
    taxonomy,
    tagNames = [],
  }: {
    title: string;
    summary: string;
    plainTextContent: string;
    villageOrLocation: string | null;
    taxonomy: SearchTaxonomy;
    tagNames?: string[];
  }): string {
    return normalizeEntrySearchText([
      title,
      summary,
      plainTextContent,
      villageOrLocation,
      taxonomy.province?.name,
      this.geographicScopeSearchLabel(taxonomy.geographicScope),
      taxonomy.district?.name,
      taxonomy.category.name,
      taxonomy.contentType.name,
      ...tagNames,
    ]);
  }

  private geographicScopeSearchLabel(geographicScope: GeographicScope): string | null {
    switch (geographicScope) {
      case GeographicScope.NATIONAL:
        return "سراسر افغانستان";
      case GeographicScope.NONE:
        return "بدون وابستگی جغرافیایی";
      case GeographicScope.PROVINCE:
        return null;
    }
  }

  private async refreshEntrySearchText(client: EntriesDbClient, entryId: string): Promise<void> {
    const entry = await client.culturalEntry.findUnique({
      where: { id: entryId },
      select: {
        title: true,
        summary: true,
        plainTextContent: true,
        villageOrLocation: true,
        geographicScope: true,
        province: { select: taxonomyReferenceSelect },
        district: { select: taxonomyReferenceSelect },
        category: { select: taxonomyReferenceSelect },
        contentType: { select: taxonomyReferenceSelect },
        tags: {
          select: {
            tag: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!entry) {
      throw this.notFound();
    }

    await client.culturalEntry.update({
      where: { id: entryId },
      data: {
        normalizedSearchText: this.createSearchText({
          title: entry.title,
          summary: entry.summary,
          plainTextContent: entry.plainTextContent,
          villageOrLocation: entry.villageOrLocation,
          taxonomy: {
            geographicScope: entry.geographicScope,
            province: entry.province,
            district: entry.district,
            category: entry.category,
            contentType: entry.contentType,
          },
          tagNames: entry.tags.map((entryTag) => entryTag.tag.name),
        }),
      },
    });
  }

  private normalizeTitle(title: string): string {
    const normalizedTitle = title.trim().replace(/\s+/g, " ");

    if (!normalizedTitle) {
      throw new BadRequestException({
        error: ENTRY_ERROR_CODES.TITLE_REQUIRED,
        message: "Entry title is required.",
      });
    }

    return normalizedTitle;
  }

  private normalizeRequiredText(value: string, message: string): string {
    const normalizedText = value.trim().replace(/\s+/g, " ");

    if (!normalizedText) {
      throw new BadRequestException({
        error: ENTRY_ERROR_CODES.CONTENT_INVALID,
        message,
      });
    }

    return normalizedText;
  }

  private normalizeOptionalText(value: string | null | undefined): string | null {
    const normalizedText = value?.trim().replace(/\s+/g, " ");

    return normalizedText || null;
  }

  private normalizeOptionalUrl(value: string | null | undefined): string | null {
    const normalizedUrl = value?.trim();

    if (!normalizedUrl) {
      return null;
    }

    try {
      const url = new URL(normalizedUrl);

      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw this.invalidSource("Only HTTP and HTTPS source URLs are supported.");
      }

      url.protocol = url.protocol.toLowerCase();
      url.hostname = url.hostname.toLowerCase();

      return url.toString();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw this.invalidSource("Source URL is invalid.");
    }
  }

  private normalizeOptionalDate(value: string | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw this.invalidSource("Source date is invalid.");
    }

    return date;
  }

  private validateImageFile(
    file: Express.Multer.File | undefined,
  ): asserts file is Express.Multer.File {
    if (!file) {
      throw this.invalidImageType("Image file is required.");
    }

    const maxSizeBytes = this.getMaxImageSizeBytes();

    if (file.size > maxSizeBytes || file.buffer.length > maxSizeBytes) {
      throw this.imageTooLarge();
    }

    if (!isSupportedImageFile(file)) {
      throw this.invalidImageType("Only valid JPEG, PNG, and WebP images are supported.");
    }
  }

  private ensureImagePermission(permissionConfirmed: boolean): void {
    if (!permissionConfirmed) {
      throw this.imagePermissionRequired();
    }
  }

  private getMaxImagesPerEntry(): number {
    return this.configService.get<number>("MAX_IMAGES_PER_ENTRY", 6);
  }

  private getMaxImageSizeBytes(): number {
    return this.configService.get<number>("MAX_IMAGE_SIZE_MB", 4) * 1024 * 1024;
  }

  private extractRequiredYouTubeVideoId(url: string): string {
    const videoId = extractYouTubeVideoId(url);

    if (!videoId) {
      throw this.invalidYouTubeUrl();
    }

    return videoId;
  }

  private async cleanupUploadedImage(publicId: string): Promise<void> {
    try {
      await this.mediaService.deleteImage(publicId);
    } catch (error) {
      this.logger.error(
        `Failed to clean up uploaded Cloudinary asset ${publicId} after database write failure.`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private normalizeQuery(query: OwnEntriesQueryDto): NormalizedEntryQuery {
    return {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      sortBy: query.sortBy ?? "updatedAt",
      sortDirection: query.sortDirection ?? "desc",
    };
  }

  private entryOrderBy(
    query: NormalizedEntryQuery,
  ): Prisma.CulturalEntryOrderByWithRelationInput[] {
    if (query.sortBy === "createdAt") {
      return [{ createdAt: query.sortDirection }, { updatedAt: "desc" }];
    }

    return [{ updatedAt: query.sortDirection }, { createdAt: "desc" }];
  }

  private skip(query: { page: number; limit: number }): number {
    return (query.page - 1) * query.limit;
  }

  private async withUniqueConstraintHandling<TResponse>(action: () => Promise<TResponse>) {
    try {
      return await action();
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new BadRequestException({
          error: ENTRY_ERROR_CODES.TAXONOMY_INVALID,
          message: "Entry violates a unique database constraint.",
        });
      }

      throw error;
    }
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: unknown }).code === "P2002"
    );
  }

  private ensureUniqueTagIds(tagIds: string[]): void {
    if (new Set(tagIds).size !== tagIds.length) {
      throw this.duplicateTags();
    }
  }

  private ensureUniqueSourceIds(sourceIds: string[]): void {
    if (new Set(sourceIds).size !== sourceIds.length) {
      throw this.invalidSource("Duplicate source IDs are not allowed.");
    }
  }

  private ensureUniqueDisplayOrders(displayOrders: number[]): void {
    if (new Set(displayOrders).size !== displayOrders.length) {
      throw this.duplicateSourceOrder();
    }
  }

  private ensureUniqueImageIds(imageIds: string[]): void {
    if (new Set(imageIds).size !== imageIds.length) {
      throw this.invalidImageType("Duplicate image IDs are not allowed.");
    }
  }

  private ensureUniqueImageDisplayOrders(displayOrders: number[]): void {
    if (new Set(displayOrders).size !== displayOrders.length) {
      throw this.duplicateImageOrder();
    }
  }

  private invalidTaxonomy(): BadRequestException {
    return new BadRequestException({
      error: ENTRY_ERROR_CODES.TAXONOMY_INVALID,
      message: "One or more taxonomy references are invalid.",
    });
  }

  private invalidGeography(message: string): BadRequestException {
    return new BadRequestException({
      error: ENTRY_ERROR_CODES.GEOGRAPHY_INVALID,
      message,
    });
  }

  private invalidPublicQuery(message: string): BadRequestException {
    return new BadRequestException({
      error: ENTRY_ERROR_CODES.QUERY_INVALID,
      message,
    });
  }

  private invalidPublicFilter(message: string): BadRequestException {
    return new BadRequestException({
      error: ENTRY_ERROR_CODES.FILTER_INVALID,
      message,
    });
  }

  private invalidStatus(message: string): ForbiddenException {
    return new ForbiddenException({
      error: ENTRY_ERROR_CODES.INVALID_STATUS,
      message,
    });
  }

  private duplicateTags(): BadRequestException {
    return new BadRequestException({
      error: ENTRY_ERROR_CODES.TAG_DUPLICATE,
      message: "Duplicate tags are not allowed.",
    });
  }

  private invalidTags(): BadRequestException {
    return new BadRequestException({
      error: ENTRY_ERROR_CODES.TAG_INVALID,
      message: "One or more tags are invalid.",
    });
  }

  private sourceNotFound(): NotFoundException {
    return new NotFoundException({
      error: ENTRY_ERROR_CODES.SOURCE_NOT_FOUND,
      message: "Source was not found.",
    });
  }

  private invalidSource(message: string): BadRequestException {
    return new BadRequestException({
      error: ENTRY_ERROR_CODES.SOURCE_INVALID,
      message,
    });
  }

  private duplicateSourceOrder(): BadRequestException {
    return new BadRequestException({
      error: ENTRY_ERROR_CODES.SOURCE_ORDER_DUPLICATE,
      message: "Duplicate source display order values are not allowed.",
    });
  }

  private imageLimitExceeded(): BadRequestException {
    return new BadRequestException({
      error: ENTRY_ERROR_CODES.IMAGE_LIMIT_EXCEEDED,
      message: "Maximum image count for this entry has been reached.",
    });
  }

  private imageTooLarge(): BadRequestException {
    return new BadRequestException({
      error: ENTRY_ERROR_CODES.IMAGE_TOO_LARGE,
      message: "Image file is too large.",
    });
  }

  private invalidImageType(message: string): BadRequestException {
    return new BadRequestException({
      error: ENTRY_ERROR_CODES.IMAGE_INVALID_TYPE,
      message,
    });
  }

  private imageNotFound(): NotFoundException {
    return new NotFoundException({
      error: ENTRY_ERROR_CODES.IMAGE_NOT_FOUND,
      message: "Image was not found.",
    });
  }

  private imagePermissionRequired(): BadRequestException {
    return new BadRequestException({
      error: ENTRY_ERROR_CODES.IMAGE_PERMISSION_REQUIRED,
      message: "Image permission confirmation is required.",
    });
  }

  private duplicateImageOrder(): BadRequestException {
    return new BadRequestException({
      error: ENTRY_ERROR_CODES.IMAGE_ORDER_DUPLICATE,
      message: "Duplicate image display order values are not allowed.",
    });
  }

  private duplicateReference(): BadRequestException {
    return new BadRequestException({
      error: ENTRY_ERROR_CODES.REFERENCE_DUPLICATE,
      message: "Duplicate internal entry references are not allowed.",
    });
  }

  private selfReference(): BadRequestException {
    return new BadRequestException({
      error: ENTRY_ERROR_CODES.REFERENCE_SELF,
      message: "An entry cannot reference itself.",
    });
  }

  private invalidReferenceTarget(): BadRequestException {
    return new BadRequestException({
      error: ENTRY_ERROR_CODES.REFERENCE_TARGET_INVALID,
      message: "Internal entry reference target is invalid.",
    });
  }

  private invalidReferenceAnchor(): BadRequestException {
    return new BadRequestException({
      error: ENTRY_ERROR_CODES.REFERENCE_ANCHOR_INVALID,
      message: "Internal entry reference anchor text is invalid.",
    });
  }

  private incompleteSubmission(message: string): BadRequestException {
    return new BadRequestException({
      error: ENTRY_ERROR_CODES.SUBMISSION_INCOMPLETE,
      message,
    });
  }

  private invalidSubmissionReference(message: string): BadRequestException {
    return new BadRequestException({
      error: ENTRY_ERROR_CODES.SUBMISSION_REFERENCE_INVALID,
      message,
    });
  }

  private submissionConflict(): ConflictException {
    return new ConflictException({
      error: ENTRY_ERROR_CODES.INVALID_STATUS,
      message: "Entry status changed before submission could be completed.",
    });
  }

  private invalidYouTubeUrl(): BadRequestException {
    return new BadRequestException({
      error: ENTRY_ERROR_CODES.YOUTUBE_URL_INVALID,
      message: "YouTube URL is invalid.",
    });
  }

  private youtubeVideoNotFound(): NotFoundException {
    return new NotFoundException({
      error: ENTRY_ERROR_CODES.YOUTUBE_VIDEO_NOT_FOUND,
      message: "YouTube video was not found.",
    });
  }

  private notFound(): NotFoundException {
    return new NotFoundException({
      error: ENTRY_ERROR_CODES.NOT_FOUND,
      message: "Entry was not found.",
    });
  }
}

export { EntriesService };
