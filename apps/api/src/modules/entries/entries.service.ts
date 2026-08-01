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
import { ENTRY_ERROR_CODES } from "@/modules/entries/entries.constants";
import { entrySelect, mapEntry } from "@/modules/entries/entries.mapper";
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

type NormalizedEntryQuery = {
  page: number;
  limit: number;
  sortBy: "createdAt" | "updatedAt";
  sortDirection: "asc" | "desc";
};

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
  }: {
    title: string;
    summary: string;
    plainTextContent: string;
    villageOrLocation: string | null;
    taxonomy: ValidatedTaxonomy;
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
    ]);
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

  private notFound(): NotFoundException {
    return new NotFoundException({
      error: ENTRY_ERROR_CODES.NOT_FOUND,
      message: "Entry was not found.",
    });
  }
}

export { EntriesService };
