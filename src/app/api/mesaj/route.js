import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Kullanıcının mesajlarını getiren endpoint
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const kullaniciId = parseInt(searchParams.get('kullaniciId'));
  if (!kullaniciId) {
    return new Response(JSON.stringify({ mesaj: 'Kullanıcı ID gerekli.' }), { status: 400 });
  }
  try {
    const mesajlar = await prisma.mesaj.findMany({
      where: {
        OR: [
          { gonderenId: kullaniciId },
          { aliciId: kullaniciId }
        ]
      },
      include: { gonderen: true, alici: true },
      orderBy: { createdAt: 'desc' }
    });
    return new Response(JSON.stringify({ mesajlar }), { status: 200 });
  } catch (e) {
    console.error('Mesaj API Hatası:', e);
    return new Response(JSON.stringify({ mesaj: 'Sunucu hatası', hata: e.message }), { status: 500 });
  }
}

// Mesaj gönderme endpointi
export async function POST(request) {
  try {
    const body = await request.json();
    const { gonderenId, aliciId, icerik } = body;
    if (!gonderenId || !aliciId || !icerik) {
      return new Response(JSON.stringify({ mesaj: 'Tüm alanlar zorunludur.' }), { status: 400 });
    }

    // Mesaj uzunluğu kontrolü
    if (icerik.length < 3 || icerik.length > 200) {
      return new Response(JSON.stringify({ 
        mesaj: 'Mesaj en az 3, en fazla 200 karakter olmalıdır.' 
      }), { status: 400 });
    }

    // Kullanıcılar var mı kontrolü
    const gonderen = await prisma.user.findUnique({ where: { id: gonderenId } });
    const alici = await prisma.user.findUnique({ where: { id: aliciId } });
    if (!gonderen || !alici) {
      return new Response(JSON.stringify({ mesaj: 'Gönderen veya alıcı bulunamadı.' }), { status: 404 });
    }    const yeniMesaj = await prisma.mesaj.create({
      data: { gonderenId, aliciId, icerik }
    });
    return new Response(JSON.stringify({ mesaj: 'Mesaj gönderildi.', yeniMesaj }), { status: 201 });
  } catch (e) {
    console.error('Mesaj Gönderme Hatası:', e);
    return new Response(JSON.stringify({ mesaj: 'Sunucu hatası', hata: e.message }), { status: 500 });
  }
}
