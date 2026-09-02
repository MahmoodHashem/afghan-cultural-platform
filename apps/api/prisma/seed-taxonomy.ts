import { categories, contentTypes, provinces } from "./seed-data/taxonomy";
import { createSeedPrismaClient } from "./seed-utils";

type SeedPrismaClient = ReturnType<typeof createSeedPrismaClient>;

async function seedTaxonomy(prisma: SeedPrismaClient): Promise<void> {
  for (const province of provinces) {
    const matches = await prisma.province.findMany({
      where: { OR: [{ slug: province.slug }, { name: province.name }] },
      select: { id: true },
      take: 2,
    });

    assertSingleTaxonomyMatch("province", province.name, province.slug, matches);

    if (matches[0]) {
      await prisma.province.update({
        where: { id: matches[0].id },
        data: {
          name: province.name,
          slug: province.slug,
          sortOrder: province.sortOrder,
        },
      });
    } else {
      await prisma.province.create({
        data: {
          ...province,
          isActive: true,
        },
      });
    }
  }

  for (const category of categories) {
    const matches = await prisma.category.findMany({
      where: { OR: [{ slug: category.slug }, { name: category.name }] },
      select: { id: true },
      take: 2,
    });

    assertSingleTaxonomyMatch("category", category.name, category.slug, matches);

    if (matches[0]) {
      await prisma.category.update({
        where: { id: matches[0].id },
        data: {
          name: category.name,
          slug: category.slug,
          sortOrder: category.sortOrder,
        },
      });
    } else {
      await prisma.category.create({
        data: {
          ...category,
          isActive: true,
        },
      });
    }
  }

  for (const contentType of contentTypes) {
    const matches = await prisma.contentType.findMany({
      where: { OR: [{ slug: contentType.slug }, { name: contentType.name }] },
      select: { id: true },
      take: 2,
    });

    assertSingleTaxonomyMatch("content type", contentType.name, contentType.slug, matches);

    if (matches[0]) {
      await prisma.contentType.update({
        where: { id: matches[0].id },
        data: {
          name: contentType.name,
          slug: contentType.slug,
          sortOrder: contentType.sortOrder,
        },
      });
    } else {
      await prisma.contentType.create({
        data: {
          ...contentType,
          isActive: true,
        },
      });
    }
  }
}

function assertSingleTaxonomyMatch(
  kind: string,
  name: string,
  slug: string,
  matches: Array<{ id: string }>,
): void {
  if (matches.length > 1) {
    throw new Error(
      `Cannot reconcile ${kind} taxonomy seed for name "${name}" and slug "${slug}" because they belong to different records.`,
    );
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
