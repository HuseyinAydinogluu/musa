import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const kullanicilar = await prisma.user.findMany({      select: {
        id: true,
        ad: true,
        email: true,
        rol: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
    return new Response(JSON.stringify({ kullanicilar }), { status: 200 });
  } catch (e) {
    console.error('Admin API Hatası:', e);
    return new Response(JSON.stringify({ mesaj: 'Sunucu hatası', hata: e.message }), { status: 500 });
  }
}

export async function PUT(request) {  try {
    const { userId, newRole } = await request.json();
    
    if (!userId || !newRole || !['user', 'admin'].includes(newRole)) {
      return new Response(JSON.stringify({ mesaj: 'Geçersiz veriler.' }), { status: 400 });
    }

    const kullanici = await prisma.user.update({
      where: { id: userId },
      data: { rol: newRole },
    });

    return new Response(JSON.stringify({ mesaj: 'Rol güncellendi.', kullanici }), { status: 200 });
  } catch (e) {
    console.error('Admin API Hatası:', e);
    return new Response(JSON.stringify({ mesaj: 'Sunucu hatası', hata: e.message }), { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));

    if (!id) {
      return new Response(JSON.stringify({ mesaj: 'Geçersiz ID.' }), { status: 400 });
    }

    // Artık cascade silme davranışı tanımlandığı için direkt kullanıcıyı silebiliriz
    // İlişkili tüm veriler (profil, randevular, mesajlar, bildirimler) otomatik silinecektir
    await prisma.user.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ mesaj: 'Kullanıcı ve ilişkili tüm veriler silindi.' }), { status: 200 });
  } catch (e) {
    console.error('Admin API Hatası:', e);
    
    // Hata yönetimi hala korunuyor
    if (e.code === 'P2003') {
      return new Response(JSON.stringify({ 
        mesaj: 'Kullanıcı silinemedi: İlişkili kayıtlar mevcut.',
        hata: 'İlişkili kayıtları silemiyoruz, sistem yöneticisiyle iletişime geçin.'
      }), { status: 400 });
    } else if (e.code === 'P2025') {
      return new Response(JSON.stringify({ 
        mesaj: 'Kullanıcı bulunamadı.',
        hata: 'Belirtilen ID ile kullanıcı bulunamadı.'
      }), { status: 404 });
    }
    
    return new Response(JSON.stringify({ mesaj: 'Sunucu hatası', hata: e.message }), { status: 500 });
  }
}
