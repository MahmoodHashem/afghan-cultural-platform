import { loadDistrictContent } from "./seed-data/district-content";
import { provinces } from "./seed-data/taxonomy";
import { createSeedPrismaClient } from "./seed-utils";

type SeedPrismaClient = ReturnType<typeof createSeedPrismaClient>;

type DistrictSeedResult = {
  created: number;
  unchanged: number;
  updated: number;
};

type DistrictCreateRecord = {
  isActive: boolean;
  name: string;
  provinceId: string;
  slug: string;
  sortOrder: number;
};

type DistrictUpdateRecord = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
};

async function seedDistricts(prisma: SeedPrismaClient): Promise<DistrictSeedResult> {
  const content = loadDistrictContent();
  const configuredProvinces = new Map(provinces.map((province) => [province.name, province]));

  if (content.length !== provinces.length) {
    throw new Error(`Expected ${provinces.length} province sections, but found ${content.length}.`);
  }

  const databaseProvinces = await prisma.province.findMany({
    select: {
      districts: {
        select: {
          id: true,
          name: true,
          slug: true,
          sortOrder: true,
        },
      },
      id: true,
      name: true,
      slug: true,
    },
  });
  const seenProvinces = new Set<string>();
  const creates: DistrictCreateRecord[] = [];
  const updates: DistrictUpdateRecord[] = [];
  let unchanged = 0;

  for (const provinceContent of content) {
    if (seenProvinces.has(provinceContent.provinceName)) {
      throw new Error(`Duplicate district section found for "${provinceContent.provinceName}".`);
    }

    seenProvinces.add(provinceContent.provinceName);

    const configuredProvince = configuredProvinces.get(provinceContent.provinceName);
    if (!configuredProvince) {
      throw new Error(
        `District content does not match a configured province: "${provinceContent.provinceName}".`,
      );
    }

    const databaseMatches = databaseProvinces.filter(
      (province) =>
        province.name === configuredProvince.name || province.slug === configuredProvince.slug,
    );

    if (databaseMatches.length !== 1) {
      throw new Error(
        `Expected one database province for "${configuredProvince.name}", but found ${databaseMatches.length}. Run the taxonomy seed first and check for conflicting records.`,
      );
    }

    const databaseProvince = databaseMatches[0];
    if (!databaseProvince) {
      throw new Error(`Database province was not found for "${configuredProvince.name}".`);
    }

    for (const district of provinceContent.districts) {
      const nameMatch = databaseProvince.districts.find((item) => item.name === district.name);
      const slugMatch = databaseProvince.districts.find((item) => item.slug === district.slug);

      if (nameMatch && slugMatch && nameMatch.id !== slugMatch.id) {
        throw new Error(
          `District name and slug for "${district.name}" in "${configuredProvince.name}" belong to different records.`,
        );
      }

      const existingDistrict = nameMatch ?? slugMatch;

      if (!existingDistrict) {
        creates.push({
          isActive: true,
          name: district.name,
          provinceId: databaseProvince.id,
          slug: district.slug,
          sortOrder: district.sortOrder,
        });
        continue;
      }

      if (
        existingDistrict.name === district.name &&
        existingDistrict.slug === district.slug &&
        existingDistrict.sortOrder === district.sortOrder
      ) {
        unchanged += 1;
        continue;
      }

      updates.push({
        id: existingDistrict.id,
        name: district.name,
        slug: district.slug,
        sortOrder: district.sortOrder,
      });
    }
  }

  if (creates.length === 0 && updates.length === 0) {
    return { created: 0, unchanged, updated: 0 };
  }

  return prisma.$transaction(
    async (transaction) => {
      if (creates.length > 0) {
        await transaction.district.createMany({ data: creates });
      }

      for (const update of updates) {
        await transaction.district.update({
          where: { id: update.id },
          data: {
            name: update.name,
            slug: update.slug,
            sortOrder: update.sortOrder,
          },
        });
      }

      return {
        created: creates.length,
        unchanged,
        updated: updates.length,
      };
    },
    {
      maxWait: 15_000,
      timeout: 60_000,
    },
  );
}

async function main(): Promise<void> {
  const directUrl = process.env.DIRECT_URL?.trim();
  const prisma = createSeedPrismaClient(directUrl || undefined);

  try {
    console.info(`Using ${directUrl ? "DIRECT_URL" : "DATABASE_URL"} for district seeding.`);
    const result = await seedDistricts(prisma);
    console.info(
      `District seed completed. Created ${result.created}, updated ${result.updated}, unchanged ${result.unchanged}.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error("District seed failed.");
    console.error(error);
    process.exitCode = 1;
  });
}

export { seedDistricts };
