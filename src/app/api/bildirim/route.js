import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Kullanıcıya ait bildirimleri getiren endpoint
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const kullaniciId = parseInt(searchParams.get('kullaniciId'));
  if (!kullaniciId) {
    return new Response(JSON.stringify({ mesaj: 'Kullanıcı ID gerekli.' }), { status: 400 });
  }
  try {
    const bildirimler = await prisma.bildirim.findMany({
      where: { userId: kullaniciId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    return new Response(JSON.stringify({ bildirimler }), { status: 200 });
  } catch (e) {
    console.error('Bildirimler API Hatası:', e);
    return new Response(JSON.stringify({ mesaj: 'Sunucu hatası', hata: e.message }), { status: 500 });
  }
}
