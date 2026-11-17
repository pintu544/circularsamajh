import path from "node:path";

// Load DATABASE_URL + FASTROUTER_API_KEY from .env.local for the seed run.
process.loadEnvFile(path.join(process.cwd(), ".env.local"));

import { prisma } from "../src/lib/db";
import { processCircular } from "../src/lib/pipeline";
import { SAMPLES } from "../src/lib/samples";

async function main() {
  // Start from a clean slate so the seed is safe to re-run.
  await prisma.readStatus.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.actionItem.deleteMany();
  await prisma.circular.deleteMany();
  await prisma.user.deleteMany();

  const teacher = await prisma.user.create({
    data: { name: "Anita Sharma", role: "TEACHER", language: "en" },
  });
  await prisma.user.create({
    data: { name: "Rajesh Verma", role: "PARENT", language: "en" },
  });
  await prisma.user.create({
    data: { name: "Sunita Devi", role: "PARENT", language: "hi" },
  });
  console.log("Seeded users: 1 teacher, 2 parents (English + Hindi preference).");

  // Sample circulars go through the real pipeline — real extraction calls.
  for (const [i, sample] of SAMPLES.entries()) {
    const id = await processCircular({
      sourceType: "TEXT",
      originalText: sample.text,
      createdById: teacher.id,
      isSample: true,
    });
    const saved = await prisma.circular.findUnique({ where: { id } });
    console.log(
      `Sample ${i + 1}: "${saved?.title ?? "(extraction failed)"}" — extractionFailed=${saved?.extractionFailed}`,
    );
  }

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
