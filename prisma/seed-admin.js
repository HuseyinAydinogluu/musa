// Admin kullanıcı seed dosyası (Türkçe açıklamalı)
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  const sifreHash = await bcrypt.hash('admin1234', 10); // Admin şifresi: admin1234
  const admin = await prisma.user.upsert({
    where: { email: 'admin@berber.com' },
    update: {},
    create: {
      ad: 'Admin',
      email: 'admin@berber.com',
      sifre: sifreHash,
      rol: 'admin'
    }
  });
  console.log('Admin kullanıcı oluşturuldu:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
