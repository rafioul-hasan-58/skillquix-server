import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting email verification status migration...");
  const result = await prisma.user.updateMany({
    data: {
      isEmailVerified: true,
    },
  });
  console.log(`Successfully migrated ${result.count} existing users to isEmailVerified = true.`);
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
