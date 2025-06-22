import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Tüm hizmetleri listeleyen endpoint
export async function GET() {
  try {
    const hizmetler = await prisma.hizmet.findMany();
    return new Response(JSON.stringify({ hizmetler }), { status: 200 });
  } catch (e) {
    console.error('Hizmet API Hatası:', e);
    return new Response(JSON.stringify({ mesaj: 'Sunucu hatası', hata: e.message }), { status: 500 });
  }
}
