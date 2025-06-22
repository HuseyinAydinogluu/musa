// Türkçe açıklamalı örnek Prisma seed dosyası
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Örnek hizmetler ekleniyor
  await prisma.hizmet.createMany({
    data: [
      { ad: 'Saç Kesimi', fiyat: 150 },
      { ad: 'Sakal Tıraşı', fiyat: 100 },
      { ad: 'Çocuk Saç Kesimi', fiyat: 120 }
    ],
    skipDuplicates: true // Aynı isimde hizmet varsa eklemez
  });
  console.log('Örnek hizmetler başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
