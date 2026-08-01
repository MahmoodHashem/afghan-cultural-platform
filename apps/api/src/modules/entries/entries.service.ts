import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { PrismaService } from "@/database/prisma.service";
import type { Prisma } from "@/generated/prisma/client";
import { EntryStatus } from "@/generated/prisma/enums";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";
import type {
  CreateEntryDraftDto,
  UpdateEntryDraftDto,
} from "@/modules/entries/dto/create-entry-draft.dto";
import type {
  ReorderEntryImagesDto,
  UpdateEntryImageMetadataDto,
  UploadEntryImageDto,
} from "@/modules/entries/dto/entry-images.dto";
import type { OwnEntriesQueryDto } from "@/modules/entries/dto/entry-query.dto";
import type { EntryReferenceSearchQueryDto } from "@/modules/entries/dto/entry-references.dto";
import type {
  CreateEntrySourceDto,
  ReorderEntrySourcesDto,
  UpdateEntrySourceDto,
} from "@/modules/entries/dto/entry-sources.dto";
import type { EntryTagsDto } from "@/modules/entries/dto/entry-tags.dto";
import type {
  UpdateEntryYouTubeVideoDto,
  UpsertEntryYouTubeVideoDto,
} from "@/modules/entries/dto/entry-youtube.dto";
import { ENTRY_ERROR_CODES } from "@/modules/entries/entries.constants";
import {
  entryReferenceTargetSelect,
  entrySelect,
  imageSelect,
  incomingEntryReferenceSelect,
  mapEntry,
  mapImage,
  mapIncomingEntryReference,
  mapOutgoingEntryReference,
  mapSource,
  mapYouTubeVideo,
  outgoingEntryReferenceSelect,
  sourceSelect,
  youtubeVideoSelect,
} from "@/modules/entries/entries.mapper";
import {
  createUniqueEntrySlug,
  normalizeEntrySearchText,
} from "@/modules/entries/utils/entry-slug.util";
import {
  extractInternalEntryReferences,
  extractPlainTextFromTiptap,
  type InternalEntryReference,
  TiptapValidationError,
} from "@/modules/entries/utils/tiptap-content.util";
import {
  createCanonicalYouTubeUrl,
  extractYouTubeVideoId,
} from "@/modules/entries/utils/youtube-url.util";
import { CloudinaryMediaService } from "@/modules/media/cloudinary-media.service";

type TaxonomyReference = {
  id: string;
  name: string;
  slug: string;
};

type DistrictReference = TaxonomyReference & {
  provinceId: string;
};

type ValidatedTaxonomy = {
  province: TaxonomyReference;
  district: DistrictReference | null;
  category: TaxonomyReference;
  contentType: TaxonomyReference;
};

type SearchTaxonomy = {
  province: TaxonomyReference;
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

type EntriesDbClient = Prisma.TransactionClient | PrismaService;
type SourceCreateData = Omit<Prisma.SourceUncheckedCreateInput, "entryId" | "displayOrder">;
type NormalizedEntryReference = {
  targetEntryId: string;
  anchorText: string;
};

const editableStatuses = new Set<EntryStatus>([EntryStatus.DRAFT, EntryStatus.CHANGES_REQUESTED]);
const MAX_REFERENCE_ANCHOR_LENGTH = 180;
const taxonomyReferenceSelect = {
  id: true,
  name: true,
  slug: true,
} as const;
const districtReferenceSelect = {
  ...taxonomyReferenceSelect,
  provinceId: true,
} as const;

@Injectable()
class EntriesService {
  private readonly logger = new Logger(EntriesService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(CloudinaryMediaService) private readonly mediaService: CloudinaryMediaService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  async createDraft(user: AuthenticatedUser, input: CreateEntryDraftDto) {
    const title = this.normalizeTitle(input.title);
    const summary = this.normalizeRequiredText(input.summary, "Summary is required.");
    const contentJson = this.validateContent(input.contentJson);
    const plainTextContent = extractPlainTextFromTiptap(contentJson);
    const entryReferences = extractInternalEntryReferences(contentJson);
    const taxonomy = await this.validateTaxonomy({
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
            provinceId: taxonomy.province.id,
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
    const provinceId = input.provinceId ?? existingEntry.provinceId;
    const districtId = input.districtId === undefined ? existingEntry.districtId : input.districtId;
    const categoryId = input.categoryId ?? existingEntry.categoryId;
    const contentTypeId = input.contentTypeId ?? existingEntry.contentTypeId;
    const villageOrLocation =
      input.villageOrLocation === undefined
        ? existingEntry.villageOrLocation
        : this.normalizeOptionalText(input.villageOrLocation);
    const taxonomy = await this.validateTaxonomy({
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
            provinceId: taxonomy.province.id,
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

  private async validateTaxonomy({
    provinceId,
    districtId,
    categoryId,
    contentTypeId,
  }: {
    provinceId: string | null | undefined;
    districtId?: string | null;
    categoryId: string | null | undefined;
    contentTypeId: string | null | undefined;
  }): Promise<ValidatedTaxonomy> {
    if (!provinceId || !categoryId || !contentTypeId) {
      throw this.invalidTaxonomy();
    }

    const [province, category, contentType, district] = await Promise.all([
      this.prisma.province.findFirst({
        where: { id: provinceId, isActive: true },
        select: taxonomyReferenceSelect,
      }),
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

    if (!province || !category || !contentType || (districtId && !district)) {
      throw this.invalidTaxonomy();
    }

    if (district && district.provinceId !== province.id) {
      throw new BadRequestException({
        error: ENTRY_ERROR_CODES.DISTRICT_PROVINCE_MISMATCH,
        message: "District does not belong to the selected province.",
      });
    }

    return {
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
      taxonomy.province.name,
      taxonomy.district?.name,
      taxonomy.category.name,
      taxonomy.contentType.name,
      ...tagNames,
    ]);
  }

  private async refreshEntrySearchText(client: EntriesDbClient, entryId: string): Promise<void> {
    const entry = await client.culturalEntry.findUnique({
      where: { id: entryId },
      select: {
        title: true,
        summary: true,
        plainTextContent: true,
        villageOrLocation: true,
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

    const detectedMimeType = this.detectImageMimeType(file.buffer);
    const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

    if (
      !detectedMimeType ||
      !allowedMimeTypes.has(file.mimetype) ||
      detectedMimeType !== file.mimetype
    ) {
      throw this.invalidImageType("Only valid JPEG, PNG, and WebP images are supported.");
    }
  }

  private detectImageMimeType(buffer: Buffer): string | null {
    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return "image/jpeg";
    }

    if (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return "image/png";
    }

    if (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    ) {
      return "image/webp";
    }

    return null;
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
    return this.configService.get<number>("MAX_IMAGE_SIZE_MB", 5) * 1024 * 1024;
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

  private skip(query: NormalizedEntryQuery): number {
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
