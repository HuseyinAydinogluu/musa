const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const adminUser = await prisma.user.create({
    data: {
      ad: 'Admin',
      email: 'admin@example.com',
      sifre: 'admin123', // Şifreyi hashlemek önerilir
      rol: 'admin',
    },
  });

  console.log('Admin kullanıcı oluşturuldu:', adminUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
