// src/app/api/auth/login.js
// Kullanıcı giriş API endpointi
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ mesaj: 'Sadece POST isteği desteklenir.' });
  }
  const { email, sifre } = req.body;
  if (!email || !sifre) {
    return res.status(400).json({ mesaj: 'Tüm alanlar zorunludur.' });
  }
  try {
    const kullanici = await prisma.user.findUnique({ where: { email } });
    if (!kullanici) {
      return res.status(401).json({ mesaj: 'Geçersiz e-posta veya şifre.' });
    }
    const dogruMu = await bcrypt.compare(sifre, kullanici.sifre);
    if (!dogruMu) {
      return res.status(401).json({ mesaj: 'Geçersiz e-posta veya şifre.' });
    }
    // Basit bir oturum için kullanıcı id ve rolünü cookie'ye yazıyoruz
    const cookie = serialize('oturum', JSON.stringify({ id: kullanici.id, rol: kullanici.rol }), {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24,
    });
    res.setHeader('Set-Cookie', cookie);
    return res.status(200).json({ mesaj: 'Giriş başarılı', kullanici: { id: kullanici.id, ad: kullanici.ad, rol: kullanici.rol } });
  } catch (e) {
    return res.status(500).json({ mesaj: 'Sunucu hatası', hata: e.message });
  }
}
