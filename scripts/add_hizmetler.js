const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const hizmetler = [
  { ad: 'Saç Kesimi', fiyat: 50 },
  { ad: 'Sakal Kesimi', fiyat: 30 },
  { ad: 'Saç Boyama', fiyat: 100 },
  { ad: 'Bakım & Şekillendirme', fiyat: 70 },
];

async function main() {
  for (const hizmet of hizmetler) {
    await prisma.hizmet.create({
      data: hizmet,
    });
  }
  console.log('Hizmetler başarıyla eklendi.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
