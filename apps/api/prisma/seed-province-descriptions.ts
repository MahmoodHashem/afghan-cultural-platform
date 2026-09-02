import { loadProvinceDescriptions } from "./seed-data/province-content";
import { provinces } from "./seed-data/taxonomy";
import { createSeedPrismaClient } from "./seed-utils";

type SeedPrismaClient = ReturnType<typeof createSeedPrismaClient>;

async function seedProvinceDescriptions(prisma: SeedPrismaClient): Promise<number> {
  const configuredProvinces = new Map(provinces.map((province) => [province.name, province]));
  const descriptions = loadProvinceDescriptions();

  if (descriptions.length !== provinces.length) {
    throw new Error(
      `Expected ${provinces.length} province descriptions, but found ${descriptions.length}.`,
    );
  }

  const seenNames = new Set<string>();

  return prisma.$transaction(
    async (transaction) => {
      for (const item of descriptions) {
        if (seenNames.has(item.name)) {
          throw new Error(`Duplicate province description found for "${item.name}".`);
        }

        seenNames.add(item.name);

        const configuredProvince = configuredProvinces.get(item.name);
        if (!configuredProvince) {
          throw new Error(`Province content does not match a configured province: "${item.name}".`);
        }

        const result = await transaction.province.updateMany({
          where: {
            OR: [{ slug: configuredProvince.slug }, { name: configuredProvince.name }],
          },
          data: { description: item.description },
        });

        if (result.count !== 1) {
          throw new Error(
            `Expected one database province for "${item.name}", but updated ${result.count}. Run the taxonomy seed first and check for conflicting records.`,
          );
        }
      }

      return descriptions.length;
    },
    {
      maxWait: 15_000,
      timeout: 30_000,
    },
  );
}

async function main(): Promise<void> {
  const directUrl = process.env.DIRECT_URL?.trim();
  const prisma = createSeedPrismaClient(directUrl || undefined);

  try {
    console.info(`Using ${directUrl ? "DIRECT_URL" : "DATABASE_URL"} for province descriptions.`);
    const updatedCount = await seedProvinceDescriptions(prisma);
    console.info(`Province description seed completed. Updated ${updatedCount} provinces.`);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error("Province description seed failed.");
    console.error(error);
    process.exitCode = 1;
  });
}

export { seedProvinceDescriptions };
