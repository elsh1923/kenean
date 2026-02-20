const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany();
  console.log('--- CATEGORIES ---');
  categories.forEach(c => {
    console.log(`${c.name} (${c.slug})`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
