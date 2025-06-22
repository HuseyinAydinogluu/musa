const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    const hizmetler = await prisma.hizmet.findMany();
    console.log('Hizmetler:', hizmetler);
  } catch (error) {
    console.error('Prisma bağlantı hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
