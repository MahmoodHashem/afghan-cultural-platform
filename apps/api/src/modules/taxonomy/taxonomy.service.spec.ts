jest.mock("@/database/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

import { ConflictException, NotFoundException } from "@nestjs/common";

import type { PrismaService } from "@/database/prisma.service";
import { TAXONOMY_ERROR_CODES } from "@/modules/taxonomy/taxonomy.constants";
import { TaxonomyService } from "@/modules/taxonomy/taxonomy.service";

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

describe("TaxonomyService", () => {
  let prisma: PrismaMock;
  let service: TaxonomyService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new TaxonomyService(prisma as unknown as PrismaService);
  });

  it("lists only active public provinces", async () => {
    prisma.province.findMany.mockResolvedValue([taxonomyItem]);
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
  });

  it("uses stable pagination and sorting defaults when query values are omitted", async () => {
    prisma.province.findMany.mockResolvedValue([taxonomyItem]);
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
      ...taxonomyItem,
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
    prisma.province.findUnique.mockResolvedValue(taxonomyItem);
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
