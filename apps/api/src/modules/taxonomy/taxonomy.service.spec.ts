jest.mock("../../database/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";

import type { PrismaService } from "../../database/prisma.service";
import type { CloudinaryMediaService } from "../media/cloudinary-media.service";
import { TAXONOMY_ERROR_CODES } from "./taxonomy.constants";
import { TaxonomyService } from "./taxonomy.service";

type DelegateMock = {
  count: jest.Mock;
  create: jest.Mock;
  findFirst: jest.Mock;
  findMany: jest.Mock;
  findUnique: jest.Mock;
  update: jest.Mock;
};

type PrismaMock = {
  province: DelegateMock;
  district: DelegateMock;
  category: DelegateMock;
  contentType: DelegateMock;
  culturalEntry: DelegateMock;
  tag: DelegateMock;
  $transaction: jest.Mock;
};

const taxonomyItem = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "کابل",
  slug: "kabul",
  sortOrder: 1,
  isActive: true,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const provinceItem = {
  ...taxonomyItem,
  description: null,
  imageCloudinaryPublicId: null,
  imageSecureUrl: null,
  imageThumbnailUrl: null,
  imageAltText: null,
  imageWidth: null,
  imageHeight: null,
};

describe("TaxonomyService", () => {
  let prisma: PrismaMock;
  let service: TaxonomyService;
  let mediaService: {
    uploadProvinceImage: jest.Mock;
    deleteImage: jest.Mock;
  };

  beforeEach(() => {
    prisma = createPrismaMock();
    mediaService = {
      uploadProvinceImage: jest.fn(),
      deleteImage: jest.fn(),
    };
    service = new TaxonomyService(
      prisma as unknown as PrismaService,
      mediaService as unknown as CloudinaryMediaService,
      {
        get: jest.fn((_key: string, fallback: unknown) => fallback),
      } as unknown as ConfigService,
    );
  });

  it("lists only active public provinces", async () => {
    prisma.province.findMany.mockResolvedValue([provinceItem]);
    prisma.province.count.mockResolvedValue(1);

    const response = await service.listPublicProvinces({
      page: 1,
      limit: 20,
      sortBy: "sortOrder",
      sortDirection: "asc",
    });

    expect(prisma.province.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true },
        take: 20,
      }),
    );
    expect(response.meta.total).toBe(1);
    expect(response.data[0]).toMatchObject({ description: null, image: null });
    expect(response.data[0]).not.toHaveProperty("imageCloudinaryPublicId");
  });

  it("uses stable pagination and sorting defaults when query values are omitted", async () => {
    prisma.province.findMany.mockResolvedValue([provinceItem]);
    prisma.province.count.mockResolvedValue(1);

    const response = await service.listPublicProvinces({});

    expect(prisma.province.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        skip: 0,
        take: 50,
      }),
    );
    expect(response.meta).toEqual({
      page: 1,
      limit: 50,
      total: 1,
      totalPages: 1,
    });
  });

  it("generates a slug and creates a province when name and slug are unique", async () => {
    prisma.province.findFirst.mockResolvedValue(null);
    prisma.province.create.mockResolvedValue({
      ...provinceItem,
      name: "کابل",
      slug: "kabl",
    });

    const response = await service.createProvince({
      name: "کابل",
    });

    expect(prisma.province.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "کابل",
          slug: "kabl",
          isActive: true,
          sortOrder: 0,
        }),
      }),
    );
    expect(response.data.slug).toBe("kabl");
  });

  it("stores and returns a trimmed province description", async () => {
    prisma.province.findUnique.mockResolvedValue(provinceItem);
    prisma.province.update.mockResolvedValue({
      ...provinceItem,
      description: "ولایت کابل در مرکز افغانستان قرار دارد.",
    });

    const response = await service.updateProvince(taxonomyItem.id, {
      description: "  ولایت کابل در مرکز افغانستان قرار دارد.  ",
    });

    expect(prisma.province.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { description: "ولایت کابل در مرکز افغانستان قرار دارد." },
      }),
    );
    expect(response.data.description).toContain("مرکز افغانستان");
  });

  it("returns province usage counts in the Admin listing", async () => {
    prisma.province.findMany.mockResolvedValue([
      { ...provinceItem, _count: { entries: 8, districts: 3 } },
    ]);
    prisma.province.count.mockResolvedValue(1);

    const response = await service.listAdminProvinces({ page: 1, limit: 50 });

    expect(response.data[0]).toMatchObject({ entryCount: 8, districtCount: 3 });
    expect(response.data[0]).not.toHaveProperty("_count");
  });

  it("returns province detail aggregates without exposing Cloudinary identity", async () => {
    prisma.province.findUnique.mockResolvedValue({
      ...provinceItem,
      imageCloudinaryPublicId: "afghan-cultural-platform/provinces/kabul",
      imageSecureUrl: "https://res.cloudinary.com/demo/kabul.jpg",
      imageThumbnailUrl: "https://res.cloudinary.com/demo/kabul-thumb.jpg",
      imageAltText: "نمای ولایت کابل",
      _count: { entries: 9, districts: 4 },
    });
    prisma.culturalEntry.count.mockResolvedValue(6);
    prisma.district.count.mockResolvedValue(3);

    const response = await service.getAdminProvince(taxonomyItem.id);

    expect(response.data).toMatchObject({
      entryCount: 9,
      districtCount: 4,
      publishedEntryCount: 6,
      activeDistrictCount: 3,
      image: { altText: "نمای ولایت کابل" },
    });
    expect(response.data).not.toHaveProperty("imageCloudinaryPublicId");
  });

  it("rejects duplicate province names", async () => {
    prisma.province.findFirst.mockResolvedValue({ id: taxonomyItem.id });

    await expectAuthCode(
      () => service.createProvince({ name: "کابل", slug: "kabul" }),
      TAXONOMY_ERROR_CODES.DUPLICATE_NAME,
    );
  });

  it("requires an existing province when creating a district", async () => {
    prisma.province.findUnique.mockResolvedValue(null);

    await expect(
      service.createDistrict({
        provinceId: taxonomyItem.id,
        name: "مرکز",
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("creates a district scoped to its province", async () => {
    prisma.province.findUnique.mockResolvedValue(provinceItem);
    prisma.district.findFirst.mockResolvedValue(null);
    prisma.district.create.mockResolvedValue({
      ...taxonomyItem,
      provinceId: taxonomyItem.id,
      province: taxonomyItem,
    });

    await service.createDistrict({
      provinceId: taxonomyItem.id,
      name: "مرکز",
      slug: "markaz",
    });

    expect(prisma.district.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          provinceId: taxonomyItem.id,
        }),
      }),
    );
  });

  it("returns entry counts for Admin districts scoped to one province", async () => {
    prisma.district.findMany.mockResolvedValue([
      {
        ...taxonomyItem,
        provinceId: taxonomyItem.id,
        province: taxonomyItem,
        _count: { entries: 5 },
      },
    ]);
    prisma.district.count.mockResolvedValue(1);

    const response = await service.listAdminDistricts({ provinceId: taxonomyItem.id });

    expect(prisma.district.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ provinceId: taxonomyItem.id }) }),
    );
    expect(response.data[0]).toMatchObject({ entryCount: 5 });
  });

  it("uploads a valid province image and removes the replaced Cloudinary asset", async () => {
    prisma.province.findUnique.mockResolvedValue({
      ...provinceItem,
      imageCloudinaryPublicId: "afghan-cultural-platform/provinces/old",
    });
    mediaService.uploadProvinceImage.mockResolvedValue({
      publicId: "afghan-cultural-platform/provinces/new",
      secureUrl: "https://res.cloudinary.com/demo/new.jpg",
      thumbnailUrl: "https://res.cloudinary.com/demo/new-thumb.jpg",
      width: 1200,
      height: 800,
    });
    prisma.province.update.mockResolvedValue({
      ...provinceItem,
      imageCloudinaryPublicId: "afghan-cultural-platform/provinces/new",
      imageSecureUrl: "https://res.cloudinary.com/demo/new.jpg",
      imageThumbnailUrl: "https://res.cloudinary.com/demo/new-thumb.jpg",
      imageAltText: "نمای فرهنگی کابل",
      imageWidth: 1200,
      imageHeight: 800,
    });

    const response = await service.uploadProvinceImage(
      taxonomyItem.id,
      { altText: " نمای فرهنگی کابل " },
      createImageFile("image/jpeg", Buffer.from([0xff, 0xd8, 0xff, 0x00])),
    );

    expect(response.data.image).toMatchObject({ altText: "نمای فرهنگی کابل" });
    expect(mediaService.deleteImage).toHaveBeenCalledWith("afghan-cultural-platform/provinces/old");
  });

  it("rejects files whose declared MIME does not match their signature", async () => {
    prisma.province.findUnique.mockResolvedValue(provinceItem);

    await expect(
      service.uploadProvinceImage(
        taxonomyItem.id,
        { altText: "نمای کابل" },
        createImageFile("image/png", Buffer.from([0xff, 0xd8, 0xff, 0x00])),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(mediaService.uploadProvinceImage).not.toHaveBeenCalled();
  });

  it("cleans up a newly uploaded province image when the database write fails", async () => {
    prisma.province.findUnique.mockResolvedValue(provinceItem);
    mediaService.uploadProvinceImage.mockResolvedValue({
      publicId: "afghan-cultural-platform/provinces/new",
      secureUrl: "https://res.cloudinary.com/demo/new.jpg",
      thumbnailUrl: "https://res.cloudinary.com/demo/new-thumb.jpg",
    });
    prisma.province.update.mockRejectedValue(new Error("database unavailable"));

    await expect(
      service.uploadProvinceImage(
        taxonomyItem.id,
        { altText: "نمای کابل" },
        createImageFile("image/jpeg", Buffer.from([0xff, 0xd8, 0xff, 0x00])),
      ),
    ).rejects.toThrow("database unavailable");
    expect(mediaService.deleteImage).toHaveBeenCalledWith("afghan-cultural-platform/provinces/new");
  });

  it("deletes the Cloudinary province image before clearing its metadata", async () => {
    prisma.province.findUnique.mockResolvedValue({
      ...provinceItem,
      imageCloudinaryPublicId: "afghan-cultural-platform/provinces/kabul",
    });
    prisma.province.update.mockResolvedValue(provinceItem);

    await service.deleteProvinceImage(taxonomyItem.id);

    expect(mediaService.deleteImage).toHaveBeenCalledWith(
      "afghan-cultural-platform/provinces/kabul",
    );
    expect(prisma.province.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ imageSecureUrl: null }) }),
    );
  });

  it("normalizes tag names for duplicate checks", async () => {
    prisma.tag.findFirst.mockResolvedValue(null);
    prisma.tag.create.mockResolvedValue({
      id: taxonomyItem.id,
      name: "فرهنگ كابل",
      slug: "farhang-kabl",
      normalizedName: "فرهنگ کابل",
      isActive: true,
      createdAt: taxonomyItem.createdAt,
      updatedAt: taxonomyItem.updatedAt,
    });

    await service.createTag({
      name: "فرهنگ كابل",
      slug: "farhang-kabl",
    });

    expect(prisma.tag.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          normalizedName: "فرهنگ کابل",
        }),
      }),
    );
  });

  it("uses soft disable instead of deleting taxonomy records", async () => {
    prisma.category.findUnique.mockResolvedValue({ id: taxonomyItem.id });
    prisma.category.update.mockResolvedValue({
      ...taxonomyItem,
      description: null,
      isActive: false,
    });

    const response = await service.setCategoryActive(taxonomyItem.id, { isActive: false });

    expect(prisma.category.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { isActive: false },
      }),
    );
    expect(response.data.isActive).toBe(false);
    expect(prisma.category).not.toHaveProperty("delete");
  });

  it("returns entry usage counts only in the admin category listing", async () => {
    prisma.category.findMany.mockResolvedValue([
      { ...taxonomyItem, description: "بناها و مکان‌های تاریخی", _count: { entries: 4 } },
    ]);
    prisma.category.count.mockResolvedValue(1);

    const response = await service.listAdminCategories({ page: 1, limit: 20 });

    expect(prisma.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          _count: { select: { entries: true } },
        }),
      }),
    );
    expect(response.data[0]).toMatchObject({ entryCount: 4 });
    expect(response.data[0]).not.toHaveProperty("_count");
  });

  it("returns entry usage counts in the admin content-type listing", async () => {
    prisma.contentType.findMany.mockResolvedValue([
      { ...taxonomyItem, description: "مقاله فرهنگی", _count: { entries: 7 } },
    ]);
    prisma.contentType.count.mockResolvedValue(1);

    const response = await service.listAdminContentTypes({ page: 1, limit: 20 });

    expect(prisma.contentType.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({ _count: { select: { entries: true } } }),
      }),
    );
    expect(response.data[0]).toMatchObject({ entryCount: 7 });
  });

  it("returns assignment counts and normalized search in the admin tag listing", async () => {
    prisma.tag.findMany.mockResolvedValue([
      {
        id: taxonomyItem.id,
        name: "فرهنگ کابل",
        slug: "farhang-kabul",
        normalizedName: "فرهنگ کابل",
        isActive: true,
        createdAt: taxonomyItem.createdAt,
        updatedAt: taxonomyItem.updatedAt,
        _count: { entries: 3 },
      },
    ]);
    prisma.tag.count.mockResolvedValue(1);

    const response = await service.listAdminTags({ search: "فرهنگ كابل" });

    expect(prisma.tag.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([{ normalizedName: { contains: "فرهنگ کابل" } }]),
        }),
        select: expect.objectContaining({ _count: { select: { entries: true } } }),
      }),
    );
    expect(response.data[0]).toMatchObject({ entryCount: 3 });
  });

  it("rejects duplicate reorder items", async () => {
    await expect(
      service.reorderCategories({
        items: [
          { id: taxonomyItem.id, sortOrder: 1 },
          { id: taxonomyItem.id, sortOrder: 2 },
        ],
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

function createPrismaMock(): PrismaMock {
  const prisma: PrismaMock = {
    province: createDelegateMock(),
    district: createDelegateMock(),
    category: createDelegateMock(),
    contentType: createDelegateMock(),
    culturalEntry: createDelegateMock(),
    tag: createDelegateMock(),
    $transaction: jest.fn(),
  };

  prisma.$transaction.mockImplementation((queries: Array<Promise<unknown>>) =>
    Promise.all(queries),
  );

  return prisma;
}

function createDelegateMock(): DelegateMock {
  return {
    count: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  };
}

async function expectAuthCode(action: () => Promise<unknown>, expectedCode: string): Promise<void> {
  try {
    await action();
    throw new Error("Expected taxonomy error was not thrown");
  } catch (error) {
    if (!(error instanceof ConflictException || error instanceof NotFoundException)) {
      throw error;
    }

    expect(error.getResponse()).toMatchObject({
      error: expectedCode,
    });
  }
}

function createImageFile(mimetype: string, buffer: Buffer): Express.Multer.File {
  return {
    fieldname: "image",
    originalname: "province.jpg",
    encoding: "7bit",
    mimetype,
    size: buffer.length,
    destination: "",
    filename: "province.jpg",
    path: "",
    buffer,
    stream: undefined as never,
  };
}
