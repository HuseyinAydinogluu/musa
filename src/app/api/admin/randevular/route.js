import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'gizli-anahtar';

export async function GET(request) {
  try {
    // Token kontrolü
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    
    if (!token) {
      return new Response(JSON.stringify({ 
        mesaj: 'Yetkilendirme hatası'
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Token'dan kullanıcı bilgilerini çıkar
    let decoded;
    try {
      decoded = jwt.verify(token?.value, JWT_SECRET);
    } catch (error) {
      return new Response(JSON.stringify({ 
        mesaj: 'Geçersiz veya eksik token'
      }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userId = decoded.id;

    const { searchParams } = new URL(request.url);
    const tarihAraligi = searchParams.get('tarihAraligi') || 'today';
    const durum = searchParams.get('durum') || 'all';
    const siralama = searchParams.get('siralama') || 'newest';
    const sayfa = parseInt(searchParams.get('sayfa') || '1');
    const limit = 10;
    const offset = (sayfa - 1) * limit;    // Tarih aralığı hesaplama
    const simdi = new Date();
    let baslangicTarihi = new Date(simdi);
    let bitisTarihi = new Date(simdi);
    
    baslangicTarihi.setHours(0, 0, 0, 0); // Günün başlangıcı
    bitisTarihi.setHours(23, 59, 59, 999); // Günün sonu
    
    switch (tarihAraligi) {
      case 'today':
        // Varsayılan değerler bugünü kapsıyor, değişikliğe gerek yok
        break;
      case 'tomorrow':
        // Yarın
        baslangicTarihi.setDate(simdi.getDate() + 1);
        bitisTarihi.setDate(simdi.getDate() + 1);
        break;
      case 'week':
        // Bugünden itibaren 7 gün
        bitisTarihi.setDate(simdi.getDate() + 7);
        break;
      case 'month':
        // Bugünden itibaren 30 gün
        bitisTarihi.setDate(simdi.getDate() + 30);
        break;
      default:
        // Varsayılan olarak bugünü göster
        break;
    }

    // Durum filtresi kaldırıldı, sadece whereCondition ve countWhereCondition kullanılacak

    // Sıralama
    const orderBy = siralama === 'newest' 
      ? { tarih: 'desc' } 
      : { tarih: 'asc' };    // Randevuları getirirken where koşulunu koşullu nesneyle oluştur
    let randevular;
    try {
      const whereCondition = {
        ...(tarihAraligi !== 'all' && {
          tarih: {
            gte: baslangicTarihi,
            lte: bitisTarihi,
          },
        }),
        ...(durum !== 'all' && { durum }),
      };
      randevular = await prisma.randevu.findMany({
        where: whereCondition,
        include: {
          user: true
        },
        orderBy,
        skip: offset,
        take: limit,
      });
      if (!randevular) {
        randevular = [];
      }
      randevular = randevular.map(randevu => {
        if (!randevu.user) {
          randevu.user = { ad: 'Bilinmeyen Kullanıcı', email: '-' };
        }
        return randevu;
      });
    } catch (error) {
      console.error('Randevu sorgusu sırasında hata:', error);
      return new Response(JSON.stringify({ 
        mesaj: 'Randevu sorgusu sırasında bir hata oluştu'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    // Toplam randevu sayısı için where koşulunu ayrı değişkende hazırla
    const toplam = await prisma.randevu.count({
      where: {
        ...(durum !== 'all' && { durum }),
        tarih: {
          gte: baslangicTarihi,
          lte: bitisTarihi,
        },
      },
    });

    return NextResponse.json({ 
      randevular,
      sayfalama: {
        toplam,
        sayfaSayisi: Math.ceil(toplam / limit),
        mevcutSayfa: sayfa,
        limit
      }
    });
  } catch (e) {
    console.error('Randevu API Hatası:', e);
    return NextResponse.json({ 
      mesaj: 'Sunucu hatası', 
      hata: e.message 
    }, { 
      status: 500
    });
  }
}

export async function PUT(request) {
  try {
    // Token kontrolü
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    
    if (!token) {
      return new Response(JSON.stringify({ 
        mesaj: 'Yetkilendirme hatası'
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Token'dan kullanıcı bilgilerini çıkar
    let decoded;
    try {
      decoded = jwt.verify(token?.value, JWT_SECRET);
    } catch (error) {
      return new Response(JSON.stringify({ 
        mesaj: 'Geçersiz veya eksik token'
      }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userId = decoded.id;

    const body = await request.json();
    const { id, durum } = body;

    if (!id || !durum) {
      return NextResponse.json({ 
        mesaj: 'ID ve durum gereklidir'
      }, { 
        status: 400
      });
    }    // Admin kullanıcı kontrolü
    const kullanici = await prisma.user.findUnique({
      where: { id: userId },
      select: { rol: true }
    });

    if (!kullanici || kullanici.rol !== 'admin') {
      return new Response(JSON.stringify({ 
        mesaj: 'Bu işlem için admin yetkisi gerekiyor'
      }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }    // Randevuyu güncelle
    const guncellenenRandevu = await prisma.randevu.update({
      where: { id },
      data: { 
        durum,
        ...(body.tarih ? { tarih: new Date(body.tarih) } : {})
      }
    });

    return new Response(JSON.stringify(guncellenenRandevu), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('Randevu güncelleme hatası:', e);
    return NextResponse.json({ 
      mesaj: 'Sunucu hatası', 
      hata: e.message 
    }, { 
      status: 500
    });
  }
}

export async function DELETE(request) {
  try {
    // Token kontrolü
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    
    if (!token) {
      return new Response(JSON.stringify({ 
        mesaj: 'Yetkilendirme hatası'
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Token'dan kullanıcı bilgilerini çıkar
    let decoded;
    try {
      decoded = jwt.verify(token?.value, JWT_SECRET);
    } catch (error) {
      return new Response(JSON.stringify({ 
        mesaj: 'Geçersiz veya eksik token'
      }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userId = decoded.id;

    // Admin kullanıcı kontrolü
    const kullanici = await prisma.user.findUnique({
      where: { id: userId },
      select: { rol: true }
    });

    if (!kullanici || kullanici.rol !== 'admin') {
      return new Response(JSON.stringify({ 
        mesaj: 'Bu işlem için admin yetkisi gerekiyor'
      }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));
    if (!id) {
      return new Response(JSON.stringify({ mesaj: 'ID gerekli.' }), { status: 400 });
    }

    await prisma.randevu.delete({
      where: { id }
    });

    return new Response(JSON.stringify({ mesaj: 'Randevu silindi.' }), { status: 200 });
  } catch (e) {
    console.error('Randevu Silme Hatası:', e);
    return new Response(JSON.stringify({ mesaj: 'Sunucu hatası', hata: e.message }), { status: 500 });
  }
}
