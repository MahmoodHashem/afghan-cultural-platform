import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { PrismaService } from "@/database/prisma.service";
import type { Prisma } from "@/generated/prisma/client";
import { EntryStatus } from "@/generated/prisma/enums";
import { CloudinaryMediaService } from "@/modules/media/cloudinary-media.service";
import { isSupportedImageFile } from "@/modules/media/image-file.utils";
import type {
  CreateDescribedTaxonomyDto,
  CreateDistrictDto,
  CreateProvinceDto,
  CreateTagDto,
  ReorderTaxonomyDto,
  SetTaxonomyActiveDto,
  UpdateDescribedTaxonomyDto,
  UpdateDistrictDto,
  UpdateProvinceDto,
  UpdateProvinceImageDto,
  UpdateTagDto,
} from "@/modules/taxonomy/dto/taxonomy-management.dto";
import type {
  AdminDistrictQueryDto,
  AdminTaxonomyQueryDto,
  DistrictQueryDto,
  TaxonomyQueryDto,
} from "@/modules/taxonomy/dto/taxonomy-query.dto";
import { TAXONOMY_ERROR_CODES } from "@/modules/taxonomy/taxonomy.constants";
import { normalizeTaxonomyName, resolveSlug } from "@/modules/taxonomy/taxonomy.utils";

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ListResponse<TItem> = {
  data: TItem[];
  meta: PaginationMeta;
};

type MessageResponse = {
  data: {
    message: string;
  };
};

type TaxonomyKind = "province" | "category" | "contentType";
type DescribedTaxonomyKind = "category" | "contentType";

const taxonomySelect = {
  id: true,
  name: true,
  slug: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

const provinceSelect = {
  ...taxonomySelect,
  description: true,
  imageCloudinaryPublicId: true,
  imageSecureUrl: true,
  imageThumbnailUrl: true,
  imageAltText: true,
  imageWidth: true,
  imageHeight: true,
} as const;

const adminProvinceSelect = {
  ...provinceSelect,
  _count: {
    select: {
      entries: true,
      districts: true,
    },
  },
} as const;

const describedTaxonomySelect = {
  ...taxonomySelect,
  description: true,
} as const;

const adminDescribedTaxonomySelect = {
  ...describedTaxonomySelect,
  _count: {
    select: {
      entries: true,
    },
  },
} as const;

const districtSelect = {
  ...taxonomySelect,
  provinceId: true,
  province: {
    select: taxonomySelect,
  },
} as const;

const adminDistrictSelect = {
  ...districtSelect,
  _count: {
    select: {
      entries: true,
    },
  },
} as const;

const tagSelect = {
  id: true,
  name: true,
  slug: true,
  normalizedName: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

const adminTagSelect = {
  ...tagSelect,
  _count: {
    select: {
      entries: true,
    },
  },
} as const;

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;
const DEFAULT_SORT_BY = "sortOrder";
const DEFAULT_SORT_DIRECTION = "asc";

type NormalizedTaxonomyQuery = {
  page: number;
  limit: number;
  sortBy: "name" | "slug" | "sortOrder" | "createdAt" | "updatedAt";
  sortDirection: "asc" | "desc";
};

@Injectable()
class TaxonomyService {
  private readonly logger = new Logger(TaxonomyService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(CloudinaryMediaService) private readonly mediaService: CloudinaryMediaService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  async listPublicProvinces(query: TaxonomyQueryDto) {
    const response = await this.listProvinces({
      ...query,
      isActive: true,
    });

    return {
      ...response,
      data: response.data.map((province) => this.mapProvince(province)),
    };
  }

  async listAdminProvinces(query: AdminTaxonomyQueryDto) {
    const normalizedQuery = this.normalizeQuery(query);
    const where: Prisma.ProvinceWhereInput = {
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...this.searchWhere(query.search),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.province.findMany({
        where,
        select: adminProvinceSelect,
        orderBy: this.provinceOrderBy(normalizedQuery),
        skip: this.skip(normalizedQuery),
        take: normalizedQuery.limit,
      }),
      this.prisma.province.count({ where }),
    ]);

    return this.listResponse(
      items.map(({ _count, ...province }) => ({
        ...this.mapProvince(province),
        entryCount: _count.entries,
        districtCount: _count.districts,
      })),
      total,
      normalizedQuery,
    );
  }

  async getAdminProvince(id: string) {
    const [province, publishedEntryCount, activeDistrictCount] = await this.prisma.$transaction([
      this.prisma.province.findUnique({
        where: { id },
        select: adminProvinceSelect,
      }),
      this.prisma.culturalEntry.count({
        where: { provinceId: id, status: EntryStatus.PUBLISHED },
      }),
      this.prisma.district.count({
        where: { provinceId: id, isActive: true },
      }),
    ]);

    if (!province) {
      throw this.notFound(TAXONOMY_ERROR_CODES.PROVINCE_NOT_FOUND, "Province was not found.");
    }

    const { _count, ...provinceData } = province;

    return {
      data: {
        ...this.mapProvince(provinceData),
        entryCount: _count.entries,
        districtCount: _count.districts,
        publishedEntryCount,
        activeDistrictCount,
      },
    };
  }

  async createProvince(input: CreateProvinceDto) {
    const data = {
      ...this.createBaseData(input),
      description: input.description?.trim() || null,
    };

    await this.ensureTaxonomyNameAndSlugAreUnique("province", data.name, data.slug);

    return this.withUniqueConstraintHandling(async () => {
      const province = await this.prisma.province.create({
        data,
        select: provinceSelect,
      });

      return { data: this.mapProvince(province) };
    });
  }

  async updateProvince(id: string, input: UpdateProvinceDto) {
    await this.ensureProvinceExists(id);

    const data = {
      ...this.createBaseUpdateData(input),
      ...(input.description === undefined
        ? {}
        : { description: input.description?.trim() || null }),
    };

    if (data.name || data.slug) {
      await this.ensureTaxonomyNameAndSlugAreUnique("province", data.name, data.slug, id);
    }

    return this.withUniqueConstraintHandling(async () => {
      const province = await this.prisma.province.update({
        where: { id },
        data,
        select: provinceSelect,
      });

      return { data: this.mapProvince(province) };
    });
  }

  async setProvinceActive(id: string, input: SetTaxonomyActiveDto) {
    await this.ensureProvinceExists(id);

    const province = await this.prisma.province.update({
      where: { id },
      data: { isActive: input.isActive },
      select: provinceSelect,
    });

    return {
      data: this.mapProvince(province),
    };
  }

  async uploadProvinceImage(
    id: string,
    input: UpdateProvinceImageDto,
    file: Express.Multer.File | undefined,
  ) {
    const province = await this.ensureProvinceExists(id);
    this.validateProvinceImageFile(file);
    const altText = this.normalizeProvinceImageAltText(input.altText);
    const uploadedImage = await this.mediaService.uploadProvinceImage(file);

    try {
      const updatedProvince = await this.prisma.province.update({
        where: { id },
        data: {
          imageCloudinaryPublicId: uploadedImage.publicId,
          imageSecureUrl: uploadedImage.secureUrl,
          imageThumbnailUrl: uploadedImage.thumbnailUrl,
          imageAltText: altText,
          imageWidth: uploadedImage.width ?? null,
          imageHeight: uploadedImage.height ?? null,
        },
        select: provinceSelect,
      });

      if (
        province.imageCloudinaryPublicId &&
        province.imageCloudinaryPublicId !== uploadedImage.publicId
      ) {
        await this.cleanupCloudinaryImage(province.imageCloudinaryPublicId);
      }

      return { data: this.mapProvince(updatedProvince) };
    } catch (error) {
      await this.cleanupCloudinaryImage(uploadedImage.publicId);
      throw error;
    }
  }

  async updateProvinceImage(id: string, input: UpdateProvinceImageDto) {
    const province = await this.ensureProvinceExists(id);

    if (!province.imageCloudinaryPublicId) {
      throw this.notFound(
        TAXONOMY_ERROR_CODES.PROVINCE_IMAGE_NOT_FOUND,
        "Province image was not found.",
      );
    }

    const updatedProvince = await this.prisma.province.update({
      where: { id },
      data: { imageAltText: this.normalizeProvinceImageAltText(input.altText) },
      select: provinceSelect,
    });

    return { data: this.mapProvince(updatedProvince) };
  }

  async deleteProvinceImage(id: string): Promise<MessageResponse> {
    const province = await this.ensureProvinceExists(id);

    if (!province.imageCloudinaryPublicId) {
      throw this.notFound(
        TAXONOMY_ERROR_CODES.PROVINCE_IMAGE_NOT_FOUND,
        "Province image was not found.",
      );
    }

    await this.prisma.province.update({
      where: { id },
      data: {
        imageCloudinaryPublicId: null,
        imageSecureUrl: null,
        imageThumbnailUrl: null,
        imageAltText: null,
        imageWidth: null,
        imageHeight: null,
      },
    });

    await this.cleanupCloudinaryImage(province.imageCloudinaryPublicId);

    return { data: { message: "Province image deleted successfully." } };
  }

  async reorderProvinces(input: ReorderTaxonomyDto): Promise<MessageResponse> {
    await this.reorderItems("province", input);

    return this.reorderMessage();
  }

  async listPublicDistricts(query: DistrictQueryDto) {
    return this.listDistricts(
      {
        ...query,
        isActive: true,
      },
      false,
    );
  }

  async listAdminDistricts(query: AdminDistrictQueryDto) {
    return this.listDistricts(query, true);
  }

  async createDistrict(input: CreateDistrictDto) {
    await this.ensureProvinceExists(input.provinceId);
    const data = {
      ...this.createBaseData(input),
      provinceId: input.provinceId,
    };

    await this.ensureDistrictNameAndSlugAreUnique(data.provinceId, data.name, data.slug);

    return this.withUniqueConstraintHandling(async () => ({
      data: await this.prisma.district.create({
        data,
        select: districtSelect,
      }),
    }));
  }

  async updateDistrict(id: string, input: UpdateDistrictDto) {
    const existingDistrict = await this.ensureDistrictExists(id);
    const provinceId = input.provinceId ?? existingDistrict.provinceId;

    if (input.provinceId) {
      await this.ensureProvinceExists(input.provinceId);
    }

    const data = {
      ...this.createBaseUpdateData(input),
      ...(input.provinceId ? { provinceId: input.provinceId } : {}),
    };

    if (data.name || data.slug || input.provinceId) {
      await this.ensureDistrictNameAndSlugAreUnique(provinceId, data.name, data.slug, id);
    }

    return this.withUniqueConstraintHandling(async () => ({
      data: await this.prisma.district.update({
        where: { id },
        data,
        select: districtSelect,
      }),
    }));
  }

  async setDistrictActive(id: string, input: SetTaxonomyActiveDto) {
    await this.ensureDistrictExists(id);

    return {
      data: await this.prisma.district.update({
        where: { id },
        data: { isActive: input.isActive },
        select: districtSelect,
      }),
    };
  }

  async reorderDistricts(input: ReorderTaxonomyDto): Promise<MessageResponse> {
    await this.reorderItems("district", input);

    return this.reorderMessage();
  }

  async listPublicCategories(query: TaxonomyQueryDto) {
    return this.listDescribedTaxonomies("category", {
      ...query,
      isActive: true,
    });
  }

  async listAdminCategories(query: AdminTaxonomyQueryDto) {
    const normalizedQuery = this.normalizeQuery(query);
    const where: Prisma.CategoryWhereInput = {
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...this.searchWhere(query.search),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where,
        select: adminDescribedTaxonomySelect,
        orderBy: this.categoryOrderBy(normalizedQuery),
        skip: this.skip(normalizedQuery),
        take: normalizedQuery.limit,
      }),
      this.prisma.category.count({ where }),
    ]);

    return this.listResponse(
      items.map(({ _count, ...item }) => ({ ...item, entryCount: _count.entries })),
      total,
      normalizedQuery,
    );
  }

  async createCategory(input: CreateDescribedTaxonomyDto) {
    return this.createDescribedTaxonomy("category", input);
  }

  async updateCategory(id: string, input: UpdateDescribedTaxonomyDto) {
    return this.updateDescribedTaxonomy("category", id, input);
  }

  async setCategoryActive(id: string, input: SetTaxonomyActiveDto) {
    return this.setDescribedTaxonomyActive("category", id, input);
  }

  async reorderCategories(input: ReorderTaxonomyDto): Promise<MessageResponse> {
    await this.reorderItems("category", input);

    return this.reorderMessage();
  }

  async listPublicContentTypes(query: TaxonomyQueryDto) {
    return this.listDescribedTaxonomies("contentType", {
      ...query,
      isActive: true,
    });
  }

  async listAdminContentTypes(query: AdminTaxonomyQueryDto) {
    const normalizedQuery = this.normalizeQuery(query);
    const where: Prisma.ContentTypeWhereInput = {
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...this.searchWhere(query.search),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.contentType.findMany({
        where,
        select: adminDescribedTaxonomySelect,
        orderBy: this.contentTypeOrderBy(normalizedQuery),
        skip: this.skip(normalizedQuery),
        take: normalizedQuery.limit,
      }),
      this.prisma.contentType.count({ where }),
    ]);

    return this.listResponse(
      items.map(({ _count, ...item }) => ({ ...item, entryCount: _count.entries })),
      total,
      normalizedQuery,
    );
  }

  async createContentType(input: CreateDescribedTaxonomyDto) {
    return this.createDescribedTaxonomy("contentType", input);
  }

  async updateContentType(id: string, input: UpdateDescribedTaxonomyDto) {
    return this.updateDescribedTaxonomy("contentType", id, input);
  }

  async setContentTypeActive(id: string, input: SetTaxonomyActiveDto) {
    return this.setDescribedTaxonomyActive("contentType", id, input);
  }

  async reorderContentTypes(input: ReorderTaxonomyDto): Promise<MessageResponse> {
    await this.reorderItems("contentType", input);

    return this.reorderMessage();
  }

  async listPublicTags(query: TaxonomyQueryDto) {
    return this.listTags({
      ...query,
      isActive: true,
    });
  }

  async listAdminTags(query: AdminTaxonomyQueryDto) {
    const normalizedQuery = this.normalizeQuery(query);
    const where = this.tagWhere(query);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.tag.findMany({
        where,
        select: adminTagSelect,
        orderBy: this.tagOrderBy(normalizedQuery),
        skip: this.skip(normalizedQuery),
        take: normalizedQuery.limit,
      }),
      this.prisma.tag.count({ where }),
    ]);

    return this.listResponse(
      items.map(({ _count, ...item }) => ({ ...item, entryCount: _count.entries })),
      total,
      normalizedQuery,
    );
  }

  async createTag(input: CreateTagDto) {
    const name = input.name.trim();
    const slug = resolveSlug(name, input.slug);
    const normalizedName = normalizeTaxonomyName(name);

    await this.ensureTagNameAndSlugAreUnique(normalizedName, slug);

    return this.withUniqueConstraintHandling(async () => ({
      data: await this.prisma.tag.create({
        data: {
          name,
          slug,
          normalizedName,
          isActive: input.isActive ?? true,
        },
        select: tagSelect,
      }),
    }));
  }

  async updateTag(id: string, input: UpdateTagDto) {
    await this.ensureTagExists(id);

    const name = input.name?.trim();
    const slug =
      name || input.slug ? resolveSlug(name ?? input.slug ?? "tag", input.slug) : undefined;
    const normalizedName = name ? normalizeTaxonomyName(name) : undefined;

    if (slug || normalizedName) {
      await this.ensureTagNameAndSlugAreUnique(normalizedName, slug, id);
    }

    return this.withUniqueConstraintHandling(async () => ({
      data: await this.prisma.tag.update({
        where: { id },
        data: {
          ...(name ? { name, normalizedName } : {}),
          ...(slug ? { slug } : {}),
          ...(input.isActive === undefined ? {} : { isActive: input.isActive }),
        },
        select: tagSelect,
      }),
    }));
  }

  async setTagActive(id: string, input: SetTaxonomyActiveDto) {
    await this.ensureTagExists(id);

    return {
      data: await this.prisma.tag.update({
        where: { id },
        data: { isActive: input.isActive },
        select: tagSelect,
      }),
    };
  }

  private async listProvinces(
    query: AdminTaxonomyQueryDto,
  ): Promise<ListResponse<Prisma.ProvinceGetPayload<{ select: typeof provinceSelect }>>> {
    const normalizedQuery = this.normalizeQuery(query);
    const where: Prisma.ProvinceWhereInput = {
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...this.searchWhere(query.search),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.province.findMany({
        where,
        select: provinceSelect,
        orderBy: this.provinceOrderBy(normalizedQuery),
        skip: this.skip(normalizedQuery),
        take: normalizedQuery.limit,
      }),
      this.prisma.province.count({ where }),
    ]);

    return this.listResponse(items, total, normalizedQuery);
  }

  private async listDistricts(query: AdminDistrictQueryDto, includeEntryCount: boolean) {
    const normalizedQuery = this.normalizeQuery(query);
    const provinceId = await this.resolveProvinceId(query.provinceId, query.provinceSlug);
    const where: Prisma.DistrictWhereInput = {
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...(provinceId ? { provinceId } : {}),
      ...this.searchWhere(query.search),
    };
    if (includeEntryCount) {
      const [items, total] = await this.prisma.$transaction([
        this.prisma.district.findMany({
          where,
          select: adminDistrictSelect,
          orderBy: this.districtOrderBy(normalizedQuery),
          skip: this.skip(normalizedQuery),
          take: normalizedQuery.limit,
        }),
        this.prisma.district.count({ where }),
      ]);

      return this.listResponse(
        items.map(({ _count, ...district }) => ({
          ...district,
          entryCount: _count.entries,
        })),
        total,
        normalizedQuery,
      );
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.district.findMany({
        where,
        select: districtSelect,
        orderBy: this.districtOrderBy(normalizedQuery),
        skip: this.skip(normalizedQuery),
        take: normalizedQuery.limit,
      }),
      this.prisma.district.count({ where }),
    ]);

    return this.listResponse(items, total, normalizedQuery);
  }

  private async listDescribedTaxonomies(kind: DescribedTaxonomyKind, query: AdminTaxonomyQueryDto) {
    const normalizedQuery = this.normalizeQuery(query);
    const where: Prisma.CategoryWhereInput = {
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...this.searchWhere(query.search),
    };

    if (kind === "category") {
      const [items, total] = await this.prisma.$transaction([
        this.prisma.category.findMany({
          where,
          select: describedTaxonomySelect,
          orderBy: this.categoryOrderBy(normalizedQuery),
          skip: this.skip(normalizedQuery),
          take: normalizedQuery.limit,
        }),
        this.prisma.category.count({ where }),
      ]);

      return this.listResponse(items, total, normalizedQuery);
    }

    const contentTypeWhere: Prisma.ContentTypeWhereInput = {
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...this.searchWhere(query.search),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.contentType.findMany({
        where: contentTypeWhere,
        select: describedTaxonomySelect,
        orderBy: this.contentTypeOrderBy(normalizedQuery),
        skip: this.skip(normalizedQuery),
        take: normalizedQuery.limit,
      }),
      this.prisma.contentType.count({ where: contentTypeWhere }),
    ]);

    return this.listResponse(items, total, normalizedQuery);
  }

  private async listTags(
    query: AdminTaxonomyQueryDto,
  ): Promise<ListResponse<Prisma.TagGetPayload<{ select: typeof tagSelect }>>> {
    const normalizedQuery = this.normalizeQuery(query);
    const where = this.tagWhere(query);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.tag.findMany({
        where,
        select: tagSelect,
        orderBy: this.tagOrderBy(normalizedQuery),
        skip: this.skip(normalizedQuery),
        take: normalizedQuery.limit,
      }),
      this.prisma.tag.count({ where }),
    ]);

    return this.listResponse(items, total, normalizedQuery);
  }

  private tagWhere(query: AdminTaxonomyQueryDto): Prisma.TagWhereInput {
    return {
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search.trim() } },
              { slug: { contains: query.search.trim() } },
              { normalizedName: { contains: normalizeTaxonomyName(query.search) } },
            ],
          }
        : {}),
    };
  }

  private async createDescribedTaxonomy(
    kind: DescribedTaxonomyKind,
    input: CreateDescribedTaxonomyDto,
  ) {
    const data = {
      ...this.createBaseData(input),
      description: input.description?.trim() || null,
    };

    await this.ensureTaxonomyNameAndSlugAreUnique(kind, data.name, data.slug);

    if (kind === "category") {
      return this.withUniqueConstraintHandling(async () => ({
        data: await this.prisma.category.create({
          data,
          select: describedTaxonomySelect,
        }),
      }));
    }

    return this.withUniqueConstraintHandling(async () => ({
      data: await this.prisma.contentType.create({
        data,
        select: describedTaxonomySelect,
      }),
    }));
  }

  private async updateDescribedTaxonomy(
    kind: DescribedTaxonomyKind,
    id: string,
    input: UpdateDescribedTaxonomyDto,
  ) {
    await this.ensureTaxonomyExists(kind, id);
    const data = {
      ...this.createBaseUpdateData(input),
      ...(input.description === undefined
        ? {}
        : { description: input.description?.trim() || null }),
    };

    if (data.name || data.slug) {
      await this.ensureTaxonomyNameAndSlugAreUnique(kind, data.name, data.slug, id);
    }

    if (kind === "category") {
      return this.withUniqueConstraintHandling(async () => ({
        data: await this.prisma.category.update({
          where: { id },
          data,
          select: describedTaxonomySelect,
        }),
      }));
    }

    return this.withUniqueConstraintHandling(async () => ({
      data: await this.prisma.contentType.update({
        where: { id },
        data,
        select: describedTaxonomySelect,
      }),
    }));
  }

  private async setDescribedTaxonomyActive(
    kind: DescribedTaxonomyKind,
    id: string,
    input: SetTaxonomyActiveDto,
  ) {
    await this.ensureTaxonomyExists(kind, id);

    if (kind === "category") {
      return {
        data: await this.prisma.category.update({
          where: { id },
          data: { isActive: input.isActive },
          select: describedTaxonomySelect,
        }),
      };
    }

    return {
      data: await this.prisma.contentType.update({
        where: { id },
        data: { isActive: input.isActive },
        select: describedTaxonomySelect,
      }),
    };
  }

  private createBaseData(input: CreateProvinceDto) {
    const name = input.name.trim();

    return {
      name,
      slug: resolveSlug(name, input.slug),
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
    };
  }

  private createBaseUpdateData(input: UpdateProvinceDto) {
    const name = input.name?.trim();

    return {
      ...(name ? { name } : {}),
      ...(name || input.slug
        ? { slug: resolveSlug(name ?? input.slug ?? "item", input.slug) }
        : {}),
      ...(input.sortOrder === undefined ? {} : { sortOrder: input.sortOrder }),
      ...(input.isActive === undefined ? {} : { isActive: input.isActive }),
    };
  }

  private async ensureTaxonomyNameAndSlugAreUnique(
    kind: TaxonomyKind,
    name: string | undefined,
    slug: string | undefined,
    excludeId?: string,
  ) {
    if (name) {
      const duplicateName = await this.findDuplicateTaxonomyName(kind, name, excludeId);

      if (duplicateName) {
        throw this.conflict(TAXONOMY_ERROR_CODES.DUPLICATE_NAME, "Taxonomy name already exists.");
      }
    }

    if (slug) {
      const duplicateSlug = await this.findDuplicateTaxonomySlug(kind, slug, excludeId);

      if (duplicateSlug) {
        throw this.conflict(TAXONOMY_ERROR_CODES.DUPLICATE_SLUG, "Taxonomy slug already exists.");
      }
    }
  }

  private async ensureDistrictNameAndSlugAreUnique(
    provinceId: string,
    name: string | undefined,
    slug: string | undefined,
    excludeId?: string,
  ) {
    if (name) {
      const duplicateName = await this.prisma.district.findFirst({
        where: {
          provinceId,
          name,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
        select: { id: true },
      });

      if (duplicateName) {
        throw this.conflict(TAXONOMY_ERROR_CODES.DUPLICATE_NAME, "District name already exists.");
      }
    }

    if (slug) {
      const duplicateSlug = await this.prisma.district.findFirst({
        where: {
          provinceId,
          slug,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
        select: { id: true },
      });

      if (duplicateSlug) {
        throw this.conflict(TAXONOMY_ERROR_CODES.DUPLICATE_SLUG, "District slug already exists.");
      }
    }
  }

  private async ensureTagNameAndSlugAreUnique(
    normalizedName: string | undefined,
    slug: string | undefined,
    excludeId?: string,
  ) {
    if (normalizedName) {
      const duplicateName = await this.prisma.tag.findFirst({
        where: {
          normalizedName,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
        select: { id: true },
      });

      if (duplicateName) {
        throw this.conflict(TAXONOMY_ERROR_CODES.DUPLICATE_NAME, "Tag name already exists.");
      }
    }

    if (slug) {
      const duplicateSlug = await this.prisma.tag.findFirst({
        where: {
          slug,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
        select: { id: true },
      });

      if (duplicateSlug) {
        throw this.conflict(TAXONOMY_ERROR_CODES.DUPLICATE_SLUG, "Tag slug already exists.");
      }
    }
  }

  private async ensureProvinceExists(id: string) {
    const province = await this.prisma.province.findUnique({
      where: { id },
      select: provinceSelect,
    });

    if (!province) {
      throw this.notFound(TAXONOMY_ERROR_CODES.PROVINCE_NOT_FOUND, "Province was not found.");
    }

    return province;
  }

  private async ensureDistrictExists(id: string) {
    const district = await this.prisma.district.findUnique({
      where: { id },
      select: districtSelect,
    });

    if (!district) {
      throw this.notFound(TAXONOMY_ERROR_CODES.NOT_FOUND, "District was not found.");
    }

    return district;
  }

  private async ensureTaxonomyExists(kind: TaxonomyKind, id: string) {
    const item = await this.findTaxonomyById(kind, id);

    if (!item) {
      throw this.notFound(TAXONOMY_ERROR_CODES.NOT_FOUND, "Taxonomy item was not found.");
    }
  }

  private async ensureTagExists(id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!tag) {
      throw this.notFound(TAXONOMY_ERROR_CODES.NOT_FOUND, "Tag was not found.");
    }
  }

  private findDuplicateTaxonomyName(kind: TaxonomyKind, name: string, excludeId?: string) {
    const where = {
      name,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    };

    if (kind === "province") {
      return this.prisma.province.findFirst({ where, select: { id: true } });
    }

    if (kind === "category") {
      return this.prisma.category.findFirst({ where, select: { id: true } });
    }

    return this.prisma.contentType.findFirst({ where, select: { id: true } });
  }

  private findDuplicateTaxonomySlug(kind: TaxonomyKind, slug: string, excludeId?: string) {
    const where = {
      slug,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    };

    if (kind === "province") {
      return this.prisma.province.findFirst({ where, select: { id: true } });
    }

    if (kind === "category") {
      return this.prisma.category.findFirst({ where, select: { id: true } });
    }

    return this.prisma.contentType.findFirst({ where, select: { id: true } });
  }

  private findTaxonomyById(kind: TaxonomyKind, id: string) {
    if (kind === "province") {
      return this.prisma.province.findUnique({ where: { id }, select: { id: true } });
    }

    if (kind === "category") {
      return this.prisma.category.findUnique({ where: { id }, select: { id: true } });
    }

    return this.prisma.contentType.findUnique({ where: { id }, select: { id: true } });
  }

  private async resolveProvinceId(provinceId?: string, provinceSlug?: string) {
    if (provinceId) {
      return provinceId;
    }

    if (!provinceSlug) {
      return undefined;
    }

    const province = await this.prisma.province.findUnique({
      where: { slug: provinceSlug },
      select: { id: true },
    });

    if (!province) {
      throw this.notFound(TAXONOMY_ERROR_CODES.PROVINCE_NOT_FOUND, "Province was not found.");
    }

    return province.id;
  }

  private async reorderItems(kind: TaxonomyKind | "district", input: ReorderTaxonomyDto) {
    const ids = input.items.map((item) => item.id);
    const uniqueIds = new Set(ids);

    if (uniqueIds.size !== ids.length) {
      throw this.conflict(
        TAXONOMY_ERROR_CODES.INVALID_REORDER_ITEMS,
        "Reorder list contains duplicate items.",
      );
    }

    if (kind === "province") {
      await this.prisma.$transaction(
        input.items.map((item) =>
          this.prisma.province.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
          }),
        ),
      );
      return;
    }

    if (kind === "district") {
      await this.prisma.$transaction(
        input.items.map((item) =>
          this.prisma.district.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
          }),
        ),
      );
      return;
    }

    if (kind === "category") {
      await this.prisma.$transaction(
        input.items.map((item) =>
          this.prisma.category.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
          }),
        ),
      );
      return;
    }

    await this.prisma.$transaction(
      input.items.map((item) =>
        this.prisma.contentType.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  }

  private searchWhere(search: string | undefined) {
    const normalizedSearch = search ? normalizeTaxonomyName(search) : undefined;

    if (!normalizedSearch) {
      return {};
    }

    return {
      OR: [{ name: { contains: normalizedSearch } }, { slug: { contains: normalizedSearch } }],
    };
  }

  private normalizeQuery(query: TaxonomyQueryDto): NormalizedTaxonomyQuery {
    return {
      page: query.page ?? DEFAULT_PAGE,
      limit: query.limit ?? DEFAULT_LIMIT,
      sortBy: query.sortBy ?? DEFAULT_SORT_BY,
      sortDirection: query.sortDirection ?? DEFAULT_SORT_DIRECTION,
    };
  }

  private skip(query: NormalizedTaxonomyQuery) {
    return (query.page - 1) * query.limit;
  }

  private provinceOrderBy(
    query: NormalizedTaxonomyQuery,
  ): Prisma.ProvinceOrderByWithRelationInput[] {
    switch (query.sortBy) {
      case "createdAt":
        return [{ createdAt: query.sortDirection }, { name: "asc" }];
      case "updatedAt":
        return [{ updatedAt: query.sortDirection }, { name: "asc" }];
      case "name":
        return [{ name: query.sortDirection }];
      case "slug":
        return [{ slug: query.sortDirection }, { name: "asc" }];
      default:
        return [{ sortOrder: query.sortDirection }, { name: "asc" }];
    }
  }

  private districtOrderBy(
    query: NormalizedTaxonomyQuery,
  ): Prisma.DistrictOrderByWithRelationInput[] {
    switch (query.sortBy) {
      case "createdAt":
        return [{ createdAt: query.sortDirection }, { name: "asc" }];
      case "updatedAt":
        return [{ updatedAt: query.sortDirection }, { name: "asc" }];
      case "name":
        return [{ name: query.sortDirection }];
      case "slug":
        return [{ slug: query.sortDirection }, { name: "asc" }];
      default:
        return [{ sortOrder: query.sortDirection }, { name: "asc" }];
    }
  }

  private categoryOrderBy(
    query: NormalizedTaxonomyQuery,
  ): Prisma.CategoryOrderByWithRelationInput[] {
    switch (query.sortBy) {
      case "createdAt":
        return [{ createdAt: query.sortDirection }, { name: "asc" }];
      case "updatedAt":
        return [{ updatedAt: query.sortDirection }, { name: "asc" }];
      case "name":
        return [{ name: query.sortDirection }];
      case "slug":
        return [{ slug: query.sortDirection }, { name: "asc" }];
      default:
        return [{ sortOrder: query.sortDirection }, { name: "asc" }];
    }
  }

  private contentTypeOrderBy(
    query: NormalizedTaxonomyQuery,
  ): Prisma.ContentTypeOrderByWithRelationInput[] {
    switch (query.sortBy) {
      case "createdAt":
        return [{ createdAt: query.sortDirection }, { name: "asc" }];
      case "updatedAt":
        return [{ updatedAt: query.sortDirection }, { name: "asc" }];
      case "name":
        return [{ name: query.sortDirection }];
      case "slug":
        return [{ slug: query.sortDirection }, { name: "asc" }];
      default:
        return [{ sortOrder: query.sortDirection }, { name: "asc" }];
    }
  }

  private tagOrderBy(query: NormalizedTaxonomyQuery): Prisma.TagOrderByWithRelationInput[] {
    switch (query.sortBy) {
      case "createdAt":
        return [{ createdAt: query.sortDirection }, { name: "asc" }];
      case "updatedAt":
        return [{ updatedAt: query.sortDirection }, { name: "asc" }];
      case "name":
        return [{ name: query.sortDirection }];
      case "slug":
        return [{ slug: query.sortDirection }, { name: "asc" }];
      default:
        return [{ name: "asc" }];
    }
  }

  private listResponse<TItem>(
    data: TItem[],
    total: number,
    query: NormalizedTaxonomyQuery,
  ): ListResponse<TItem> {
    return {
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  private reorderMessage(): MessageResponse {
    return {
      data: {
        message: "Taxonomy order updated successfully.",
      },
    };
  }

  private mapProvince(province: Prisma.ProvinceGetPayload<{ select: typeof provinceSelect }>) {
    const {
      imageCloudinaryPublicId: _imageCloudinaryPublicId,
      imageSecureUrl,
      imageThumbnailUrl,
      imageAltText,
      imageWidth,
      imageHeight,
      ...provinceData
    } = province;

    return {
      ...provinceData,
      image:
        imageSecureUrl && imageThumbnailUrl && imageAltText
          ? {
              secureUrl: imageSecureUrl,
              thumbnailUrl: imageThumbnailUrl,
              altText: imageAltText,
              width: imageWidth,
              height: imageHeight,
            }
          : null,
    };
  }

  private validateProvinceImageFile(
    file: Express.Multer.File | undefined,
  ): asserts file is Express.Multer.File {
    if (!file) {
      throw this.badRequest(TAXONOMY_ERROR_CODES.IMAGE_INVALID_TYPE, "Image file is required.");
    }

    const maxImageSizeBytes = this.configService.get<number>("MAX_IMAGE_SIZE_MB", 5) * 1024 * 1024;

    if (file.size > maxImageSizeBytes || file.buffer.length > maxImageSizeBytes) {
      throw this.badRequest(TAXONOMY_ERROR_CODES.IMAGE_TOO_LARGE, "Image file is too large.");
    }

    if (!isSupportedImageFile(file)) {
      throw this.badRequest(
        TAXONOMY_ERROR_CODES.IMAGE_INVALID_TYPE,
        "Only valid JPEG, PNG, and WebP images are supported.",
      );
    }
  }

  private normalizeProvinceImageAltText(value: string): string {
    const altText = value.trim();

    if (altText.length < 2) {
      throw this.badRequest(
        TAXONOMY_ERROR_CODES.PROVINCE_IMAGE_ALT_REQUIRED,
        "Province image alt text is required.",
      );
    }

    return altText;
  }

  private async cleanupCloudinaryImage(publicId: string): Promise<void> {
    try {
      await this.mediaService.deleteImage(publicId);
    } catch (error) {
      this.logger.error(
        `Failed to clean up province Cloudinary asset ${publicId}.`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private async withUniqueConstraintHandling<TResponse>(action: () => Promise<TResponse>) {
    try {
      return await action();
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw this.conflict(
          TAXONOMY_ERROR_CODES.DUPLICATE_SLUG,
          "Taxonomy item violates a unique constraint.",
        );
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

  private conflict(code: string, message: string) {
    return new ConflictException({
      error: code,
      message,
    });
  }

  private badRequest(code: string, message: string) {
    return new BadRequestException({
      error: code,
      message,
    });
  }

  private notFound(code: string, message: string) {
    return new NotFoundException({
      error: code,
      message,
    });
  }
}

export { TaxonomyService };
