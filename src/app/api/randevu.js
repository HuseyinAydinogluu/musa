// src/app/api/randevu.js
// Randevu oluşturma ve listeleme API endpointi
import { PrismaClient } from '@prisma/client';
import { parse } from 'cookie';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Oturum kontrolü
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  let oturum = null;
  try {
    oturum = cookies.oturum ? JSON.parse(cookies.oturum) : null;
  } catch (e) {}
  if (!oturum) {
    return res.status(401).json({ mesaj: 'Giriş yapmalısınız.' });
  }
  if (req.method === 'POST') {
    // Randevu oluştur
    const { tarih, aciklama, hizmetId } = req.body;
    if (!tarih || !hizmetId) {
      return res.status(400).json({ mesaj: 'Tarih ve hizmet zorunludur.' });
    }
    try {
      await prisma.randevu.create({
        data: {
          tarih: new Date(tarih),
          aciklama,
          userId: oturum.id,
          hizmetId
        }
      });
      return res.status(201).json({ mesaj: 'Randevu oluşturuldu.' });
    } catch (e) {
      return res.status(500).json({ mesaj: 'Sunucu hatası', hata: e.message });
    }
  } else if (req.method === 'GET') {
    // Kullanıcının randevularını getir
    try {
      const randevular = await prisma.randevu.findMany({
        where: { userId: oturum.id },
        include: { hizmet: true }
      });
      return res.status(200).json({ randevular });
    } catch (e) {
      return res.status(500).json({ mesaj: 'Sunucu hatası', hata: e.message });
    }
  } else {
    return res.status(405).json({ mesaj: 'GET ve POST desteklenir.' });
  }
}
