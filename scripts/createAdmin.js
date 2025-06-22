const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createAdminUser() {
  const email = 'admin@berber.com';
  const password = 'Admin123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const admin = await prisma.user.create({
      data: {
        email: email,
        ad: 'Admin',
        sifre: hashedPassword,
        rol: 'admin'
      }
    });
    console.log('Admin kullanıcısı oluşturuldu:', {
      email: admin.email,
      password: password // Şifreyi log'da göstermek için
    });
  } catch (error) {
    if (error.code === 'P2002') {
      console.error('Bu email zaten kullanımda:', email);
    } else {
      console.error('Hata:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
