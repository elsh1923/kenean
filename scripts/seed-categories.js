const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Videos', slug: 'videos', description: 'Video lessons and lectures' },
    { name: 'Books', slug: 'books', description: 'Orthodox Christian books and literature' },
  ];

  console.log('--- SEEDING CATEGORIES ---');

  for (const cat of categories) {
    const existing = await prisma.category.findUnique({
      where: { slug: cat.slug },
    });

    if (!existing) {
      await prisma.category.create({
        data: cat,
      });
      console.log(`Created: ${cat.name}`);
    } else {
      console.log(`Exists: ${cat.name}`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
