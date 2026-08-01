import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "@/database/prisma.service";
import type { Prisma } from "@/generated/prisma/client";
import { EntryStatus } from "@/generated/prisma/enums";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";
import type {
  CreateEntryDraftDto,
  UpdateEntryDraftDto,
} from "@/modules/entries/dto/create-entry-draft.dto";
import type { OwnEntriesQueryDto } from "@/modules/entries/dto/entry-query.dto";
import type {
  CreateEntrySourceDto,
  ReorderEntrySourcesDto,
  UpdateEntrySourceDto,
} from "@/modules/entries/dto/entry-sources.dto";
import type { EntryTagsDto } from "@/modules/entries/dto/entry-tags.dto";
import { ENTRY_ERROR_CODES } from "@/modules/entries/entries.constants";
import { entrySelect, mapEntry, mapSource, sourceSelect } from "@/modules/entries/entries.mapper";
import {
  createUniqueEntrySlug,
  normalizeEntrySearchText,
} from "@/modules/entries/utils/entry-slug.util";
import {
  extractPlainTextFromTiptap,
  TiptapValidationError,
} from "@/modules/entries/utils/tiptap-content.util";

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

const editableStatuses = new Set<EntryStatus>([EntryStatus.DRAFT, EntryStatus.CHANGES_REQUESTED]);
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
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async createDraft(user: AuthenticatedUser, input: CreateEntryDraftDto) {
    const title = this.normalizeTitle(input.title);
    const summary = this.normalizeRequiredText(input.summary, "Summary is required.");
    const contentJson = this.validateContent(input.contentJson);
    const plainTextContent = extractPlainTextFromTiptap(contentJson);
    const taxonomy = await this.validateTaxonomy({
      provinceId: input.provinceId,
      districtId: input.districtId ?? null,
      categoryId: input.categoryId,
      contentTypeId: input.contentTypeId,
    });
    const slug = await this.generateUniqueSlug(title);
    const villageOrLocation = this.normalizeOptionalText(input.villageOrLocation);

    const entry = await this.withUniqueConstraintHandling(async () =>
      this.prisma.culturalEntry.create({
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
      this.prisma.culturalEntry.update({
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

  private notFound(): NotFoundException {
    return new NotFoundException({
      error: ENTRY_ERROR_CODES.NOT_FOUND,
      message: "Entry was not found.",
    });
  }
}

export { EntriesService };
