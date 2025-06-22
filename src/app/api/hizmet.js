// src/app/api/hizmet.js
// Hizmetleri listeleme API endpointi
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Tüm hizmetleri getir
    try {
      const hizmetler = await prisma.hizmet.findMany();
      return res.status(200).json({ hizmetler });
    } catch (e) {
      return res.status(500).json({ mesaj: 'Sunucu hatası', hata: e.message });
    }
  } else {
    return res.status(405).json({ mesaj: 'Sadece GET desteklenir.' });
  }
}
