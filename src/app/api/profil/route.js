import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// Kullanıcı profilini güncelleyen endpoint
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ad, email, sifre } = body;
    
    // ID kontrolü
    if (!id || !ad || !email) {
      return new Response(JSON.stringify({ mesaj: 'Tüm alanlar zorunludur.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Ad alanında özel karakterlerin kontrolü
    const ozelKarakterler = /[#%&*+\-=^_~|]/;
    if (ozelKarakterler.test(ad)) {
      return new Response(JSON.stringify({ mesaj: 'Ad alanında özel karakter (#, %, &, *, +, -, =, ^, _, ~, |) kullanılamaz.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Kullanıcı var mı kontrolü
    const kullanici = await prisma.user.findUnique({ 
      where: { id: parseInt(id) }
    });
    
    if (!kullanici) {
      return new Response(JSON.stringify({ mesaj: 'Kullanıcı bulunamadı.' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // E-posta başka kullanıcıya ait mi kontrolü
    const mevcut = await prisma.user.findUnique({ where: { email } });
    if (mevcut && mevcut.id !== parseInt(id)) {
      return new Response(JSON.stringify({ mesaj: 'Bu e-posta başka bir kullanıcıya ait.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Şifre güncellemesi isteniyorsa kuralları kontrol et ve hashle
    let updateData = { ad, email };
    if (sifre) {
      if (sifre.length < 4) {
        return new Response(JSON.stringify({ mesaj: 'Şifre en az 4 karakter olmalıdır.' }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      if (/^\d+$/.test(sifre)) {
        return new Response(JSON.stringify({ mesaj: 'Şifre sadece rakamlardan oluşamaz. Harf de içermelidir.' }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const sifreHash = await bcrypt.hash(sifre, 10);
      updateData.sifre = sifreHash;
    }

    const guncellenen = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        ad: true,
        email: true,
        rol: true
      }
    });

    return new Response(JSON.stringify({ 
      mesaj: 'Profil başarıyla güncellendi.', 
      kullanici: guncellenen 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (e) {
    console.error('Profil Güncelleme Hatası:', e);
    return new Response(JSON.stringify({ 
      mesaj: 'Sunucu hatası', 
      hata: e.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Tüm kullanıcıları veya profil bilgisini getiren endpoint
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  console.log("API isteği alındı, parametreler:", Object.fromEntries(searchParams)); // Debug için

  try {
    // Oturum kontrolü
    const cookieStore = await cookies();
    const oturumCookie = cookieStore.get('token') || cookieStore.get('oturum') || cookieStore.get('next-auth.session-token');
    
    if (!oturumCookie) {
      console.log("Oturum cookie'si bulunamadı"); // Debug için
      return new Response(JSON.stringify({ kullanicilar: [], mesaj: 'Giriş yapmalısınız.' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Kullanıcı listesi isteği
    if (searchParams.get("kullanicilar") === "1") {
      console.log("Kullanıcı listesi isteği işleniyor..."); // Debug için
      try {
        const kullanicilar = await prisma.user.findMany({
          select: { 
            id: true, 
            ad: true, 
            email: true,
            rol: true
          },
          orderBy: {
            ad: 'asc'
          }
        });

        console.log("Bulunan kullanıcı sayısı:", kullanicilar.length); // Debug için

        return new Response(JSON.stringify({ 
          kullanicilar,
          mesaj: kullanicilar.length ? undefined : 'Henüz başka kullanıcı bulunmuyor.'
        }), { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (e) {
        console.error("Kullanıcı listesi hatası:", e); // Debug için
        return new Response(JSON.stringify({ 
          kullanicilar: [],
          mesaj: 'Kullanıcı listesi alınırken hata oluştu', 
          hata: e.message 
        }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Kullanıcı profilini getiren işlemler
    const kullaniciIdRaw = searchParams.get('kullaniciId');
    if (!kullaniciIdRaw || isNaN(Number(kullaniciIdRaw))) {
      return new Response(JSON.stringify({ mesaj: 'Geçerli bir kullanıcı ID gerekli.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const kullaniciId = Number(kullaniciIdRaw);

    try {
      const user = await prisma.user.findUnique({
        where: { id: kullaniciId },
        select: {
          id: true,
          ad: true,
          email: true,
          rol: true,
          profil: true // profil ilişkisi yoksa hata vermez, null döner
        }
      });

      if (!user) {
        return new Response(JSON.stringify({ mesaj: 'Kullanıcı bulunamadı.' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ user }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      console.error('Profil API Hatası:', e);
      return new Response(JSON.stringify({ mesaj: 'Sunucu hatası', hata: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (e) {
    console.error("Genel API hatası:", e); // Debug için
    return new Response(JSON.stringify({ 
      mesaj: 'Sunucu hatası', 
      hata: e.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
