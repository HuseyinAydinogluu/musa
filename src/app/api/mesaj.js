// src/app/api/mesaj.js
// Kullanıcılar arası mesajlaşma API endpointi
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
    // Mesaj gönder
    const { aliciId, icerik } = req.body;
    if (!aliciId || !icerik) {
      return res.status(400).json({ mesaj: 'Tüm alanlar zorunludur.' });
    }
    try {
      await prisma.mesaj.create({
        data: {
          icerik,
          gonderenId: oturum.id,
          aliciId: aliciId
        }
      });
      return res.status(201).json({ mesaj: 'Mesaj gönderildi.' });
    } catch (e) {
      return res.status(500).json({ mesaj: 'Sunucu hatası', hata: e.message });
    }
  } else if (req.method === 'GET') {
    // Kullanıcının dahil olduğu mesajları getir
    try {
      const mesajlar = await prisma.mesaj.findMany({
        where: {
          OR: [
            { gonderenId: oturum.id },
            { aliciId: oturum.id }
          ]
        },
        orderBy: { createdAt: 'desc' },
        include: {
          gonderen: { select: { id: true, ad: true } },
          alici: { select: { id: true, ad: true } }
        }
      });
      return res.status(200).json({ mesajlar });
    } catch (e) {
      return res.status(500).json({ mesaj: 'Sunucu hatası', hata: e.message });
    }
  } else {
    return res.status(405).json({ mesaj: 'GET ve POST desteklenir.' });
  }
}
