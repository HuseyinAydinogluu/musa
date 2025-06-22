const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateUserRole() {
  try {
    const updatedUser = await prisma.user.update({
      where: { email: 'admin@admin.com' },
      data: { rol: 'admin' }
    });
    console.log('Kullanıcı admin rolüne yükseltildi:', updatedUser);
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole();
