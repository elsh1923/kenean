const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { volumes: true } } }
  });
  const volumes = await prisma.volume.findMany({
    include: { _count: { select: { lessons: true } } }
  });

  console.log('--- DATABASE STATUS ---');
  console.log('Categories:', categories.length);
  categories.forEach(c => {
    console.log(`  - ${c.name} (${c.slug}): ${c._count.volumes} volumes`);
  });

  console.log('\nVolumes:', volumes.length);
  volumes.forEach(v => {
    console.log(`  - ${v.title} (Volume ${v.volumeNumber}): ${v._count.lessons} lessons`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
