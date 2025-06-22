// src/app/api/auth/register.js
// Kullanıcı kayıt API endpointi
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ mesaj: 'Sadece POST isteği desteklenir.' });
  }
  const { ad, email, sifre } = req.body;
  if (!ad || !email || !sifre) {
    return res.status(400).json({ mesaj: 'Tüm alanlar zorunludur.' });
  }
  try {
    const mevcut = await prisma.user.findUnique({ where: { email } });
    if (mevcut) {
      return res.status(409).json({ mesaj: 'Bu e-posta ile kayıtlı kullanıcı var.' });
    }
    const sifreHash = await bcrypt.hash(sifre, 10);
    const yeniKullanici = await prisma.user.create({
      data: { ad, email, sifre: sifreHash, rol: 'kullanici' },
    });
    return res.status(201).json({ mesaj: 'Kayıt başarılı', kullanici: { id: yeniKullanici.id, ad, email } });
  } catch (e) {
    return res.status(500).json({ mesaj: 'Sunucu hatası', hata: e.message });
  }
}
