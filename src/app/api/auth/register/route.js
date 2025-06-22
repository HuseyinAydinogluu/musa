import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// PrismaClient örneği oluşturuluyor
const prisma = new PrismaClient();

// Kayıt olma endpointi
export async function POST(request) {
  try {
    const body = await request.json();
    const { ad, email, sifre } = body;

    // Zorunlu alan kontrolü
    if (!ad || !email || !sifre) {
      return new Response(JSON.stringify({ mesaj: 'Tüm alanlar zorunludur.' }), { status: 400 });
    }

    // E-posta ile kullanıcı var mı kontrolü
    const mevcut = await prisma.user.findUnique({ where: { email } });
    if (mevcut) {
      return new Response(JSON.stringify({ mesaj: 'Bu e-posta ile kayıtlı kullanıcı var.' }), { status: 400 });
    }

    // Şifre kuralları: En az 4 karakter ve sadece rakam olmamalı
    if (sifre.length < 4) {
      return new Response(JSON.stringify({ mesaj: 'Şifre en az 4 karakter olmalıdır.' }), { status: 400 });
    }
    if (/^\d+$/.test(sifre)) {
      return new Response(JSON.stringify({ mesaj: 'Şifre sadece rakamlardan oluşamaz. Harf de içermelidir.' }), { status: 400 });
    }

    // Şifreyi hashle
    const sifreHash = await bcrypt.hash(sifre, 10);

    // Yeni kullanıcı oluştur
    const yeniKullanici = await prisma.user.create({
      data: { ad, email, sifre: sifreHash, rol: 'kullanici' }
    });

    return new Response(JSON.stringify({ mesaj: 'Kayıt başarılı.', kullanici: yeniKullanici }), { status: 201 });
  } catch (e) {
    // Hata detayını sunucu terminaline yazdır
    console.error('Kayıt API Hatası:', e);
    return new Response(JSON.stringify({ mesaj: 'Sunucu hatası', hata: e.message }), { status: 500 });
  }
}