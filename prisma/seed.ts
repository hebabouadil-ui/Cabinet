import { PrismaClient } from "@prisma/client";
import { runSeed } from "../src/lib/seed-data";

const prisma = new PrismaClient();

runSeed(prisma)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
