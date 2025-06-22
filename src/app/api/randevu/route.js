import prisma from '@/lib/prisma';

// Kullanıcının randevularını getiren endpoint
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const kullaniciId = parseInt(searchParams.get('kullaniciId'));
  const dateParam = searchParams.get('date');

  try {
    // Sadece tarih parametresi ile çağrılmışsa, o günün dolu saatlerini döndür
    if (dateParam && !kullaniciId) {
      const selectedDate = new Date(dateParam);
      if (isNaN(selectedDate.getTime())) {
        return new Response(JSON.stringify({ 
          mesaj: 'Geçersiz tarih formatı.' 
        }), { status: 400 });
      }

      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      // O gün için tüm randevuları bul
      const gunlukRandevular = await prisma.randevu.findMany({
        where: {
          tarih: {
            gte: startOfDay,
            lte: endOfDay,
          }
        },
        select: { tarih: true }
      });      // Dolu saatleri liste olarak hazırla
      const doluSaatler = gunlukRandevular.map(randevu => {
        const tarih = new Date(randevu.tarih);
        return `${tarih.getHours().toString().padStart(2, '0')}:${tarih.getMinutes().toString().padStart(2, '0')}`;
      });
      
      // Bugünün tarihi mi kontrol et
      const bugun = new Date();
      const bugunMu = selectedDate.getFullYear() === bugun.getFullYear() &&
                     selectedDate.getMonth() === bugun.getMonth() &&
                     selectedDate.getDate() === bugun.getDate();
                     
      // Eğer bugünse, geçmiş saatleri de dolu olarak işaretle
      let gecmisSaatler = [];
      if (bugunMu) {
        // Şu anki saatten sonraki ilk tam saati bul
        const simdikiSaat = bugun.getHours();
        const simdikiDakika = bugun.getMinutes();
        const sonrakiSaat = simdikiDakika > 0 ? simdikiSaat + 1 : simdikiSaat;
        
        // Şimdiki saatten önceki tüm saatleri dolu olarak işaretle
        for (let i = 9; i < sonrakiSaat; i++) {
          gecmisSaatler.push(`${i.toString().padStart(2, '0')}:00`);
        }
      }
      
      // Hem dolu hem de geçmiş saatleri birleştir
      const engellenenSaatler = [...new Set([...doluSaatler, ...gecmisSaatler])];
      
      return new Response(JSON.stringify({ doluSaatler: engellenenSaatler }), { status: 200 });
    }

    // Kullanıcı ID ile çağrı yapılmışsa, o kullanıcının randevularını döndür
    if (!kullaniciId) {
      return new Response(JSON.stringify({ mesaj: 'Kullanıcı ID gerekli.' }), { status: 400 });
    }

    const whereClause = { userId: kullaniciId };

    if (dateParam) {
      const selectedDate = new Date(dateParam);
      if (isNaN(selectedDate.getTime())) {
        return new Response(JSON.stringify({ mesaj: 'Geçersiz tarih formatı.' }), { status: 400 });
      }

      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.tarih = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const randevular = await prisma.randevu.findMany({
      where: whereClause,
      include: { hizmet: true },
      orderBy: { tarih: 'desc' },
    });

    return new Response(JSON.stringify({ randevular }), { status: 200 });
  } catch (e) {
    console.error('Randevu API Hatası:', e);
    return new Response(JSON.stringify({ mesaj: 'Sunucu hatası', hata: e.message }), { status: 500 });
  }
}

// Randevu alma endpointi
export async function POST(request) {
  try {
    const body = await request.json();
    const { tarih, kullaniciId, aciklama = null, hizmetId = null } = body;

    if (!tarih || !kullaniciId) {
      return new Response(JSON.stringify({ 
        mesaj: 'Lütfen tüm alanları doldurun. Randevu tarihi ve kullanıcı bilgisi zorunludur.' 
      }), { status: 400 });
    }

    const randevuTarihi = new Date(tarih);
    const simdi = new Date();
    simdi.setSeconds(0, 0); // Saniye ve milisaniyeyi sıfırla

    // Geçmiş tarih kontrolü
    if (randevuTarihi < simdi) {
      return new Response(JSON.stringify({ 
        mesaj: 'Geçmiş bir tarih için randevu alamazsınız.' 
      }), { status: 400 });
    }

    // Eğer tarih bugüne aitse, seçilen saatten önceki saatler kontrol edilir
    if (
      randevuTarihi.getFullYear() === simdi.getFullYear() &&
      randevuTarihi.getMonth() === simdi.getMonth() &&
      randevuTarihi.getDate() === simdi.getDate()
    ) {
      if (randevuTarihi.getTime() <= simdi.getTime()) {
        return new Response(JSON.stringify({ 
          mesaj: 'Bugün için geçmiş bir saat seçemezsiniz. Lütfen ileriki bir saat seçin.' 
        }), { status: 400 });
      }
    }

    // 1. Aynı tarih ve saat için başka kullanıcıya izin verme
    const ayniTarihVar = await prisma.randevu.findFirst({
      where: {
        tarih: randevuTarihi,
      },
    });

    if (ayniTarihVar) {
      return new Response(JSON.stringify({ 
        mesaj: 'Seçtiğiniz tarih ve saatte başka bir randevu mevcut. Lütfen farklı bir saat seçin.' 
      }), { status: 400 });
    }

    // Randevu oluştur
    const randevuData = {
      tarih: randevuTarihi,
      userId: kullaniciId,
      durum: 'bekliyor',
    };

    if (typeof aciklama === 'string' && aciklama.length > 0) {
      randevuData.aciklama = aciklama;
    }
    
    if (typeof hizmetId === 'number' && hizmetId) {
      randevuData.hizmetId = hizmetId;
    }

    const yeniRandevu = await prisma.randevu.create({
      data: randevuData,
      include: {
        hizmet: true,
        user: {
          select: {
            id: true,
            ad: true,
            email: true
          }
        }
      }
    });

    return new Response(JSON.stringify({ 
      mesaj: 'Randevunuz başarıyla oluşturuldu.', 
      randevu: yeniRandevu 
    }), { status: 201 });

  } catch (e) {
    console.error('Randevu API Hatası:', e);
    return new Response(JSON.stringify({ 
      mesaj: 'Sunucu hatası oluştu. Lütfen tekrar deneyin.', 
      hata: e.message 
    }), { status: 500 });
  }
}

// Randevu silme endpointi
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));
    if (!id) {
      return new Response(JSON.stringify({ mesaj: 'Randevu ID gerekli.' }), { status: 400 });
    }
    await prisma.randevu.delete({ where: { id } });
    return new Response(JSON.stringify({ mesaj: 'Randevunuz başarıyla iptal edildi.' }), { status: 200 });
  } catch (e) {
    console.error('Randevu Silme Hatası:', e);
    return new Response(JSON.stringify({ mesaj: 'Randevu iptal edilirken hata oluştu.', hata: e.message }), { status: 500 });
  }
}
