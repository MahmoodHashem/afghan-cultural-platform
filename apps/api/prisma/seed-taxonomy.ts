import { categories, contentTypes, provinces } from "./seed-data/taxonomy";
import { createSeedPrismaClient } from "./seed-utils";

type SeedPrismaClient = ReturnType<typeof createSeedPrismaClient>;

async function seedTaxonomy(prisma: SeedPrismaClient): Promise<void> {
  for (const province of provinces) {
    await prisma.province.upsert({
      where: { slug: province.slug },
      update: {
        name: province.name,
        sortOrder: province.sortOrder,
      },
      create: {
        ...province,
        isActive: true,
      },
    });
  }

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        sortOrder: category.sortOrder,
      },
      create: {
        ...category,
        isActive: true,
      },
    });
  }

  for (const contentType of contentTypes) {
    await prisma.contentType.upsert({
      where: { slug: contentType.slug },
      update: {
        name: contentType.name,
        sortOrder: contentType.sortOrder,
      },
      create: {
        ...contentType,
        isActive: true,
      },
    });
  }
}

async function getTaxonomyCounts(prisma: SeedPrismaClient) {
  const [provinceCount, districtCount, categoryCount, contentTypeCount, tagCount] =
    await Promise.all([
      prisma.province.count(),
      prisma.district.count(),
      prisma.category.count(),
      prisma.contentType.count(),
      prisma.tag.count(),
    ]);

  return {
    provinces: provinceCount,
    districts: districtCount,
    categories: categoryCount,
    contentTypes: contentTypeCount,
    tags: tagCount,
  };
}

async function main(): Promise<void> {
  const prisma = createSeedPrismaClient();

  try {
    await seedTaxonomy(prisma);

    const counts = await getTaxonomyCounts(prisma);

    console.info("Initial taxonomy seed completed.");
    console.table(counts);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error("Initial taxonomy seed failed.");
    console.error(error);
    process.exitCode = 1;
  });
}

export { getTaxonomyCounts, seedTaxonomy };
