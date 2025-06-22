// src/app/api/admin/kullanicilar.js
// Sadece adminlerin erişebileceği kullanıcı yönetimi API endpointi
import { PrismaClient } from '@prisma/client';
import { parse } from 'cookie';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Oturum ve rol kontrolü
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  let oturum = null;
  try {
    oturum = cookies.oturum ? JSON.parse(cookies.oturum) : null;
  } catch (e) {}
  if (!oturum || oturum.rol !== 'admin') {
    return res.status(403).json({ mesaj: 'Yalnızca admin erişebilir.' });
  }
  if (req.method === 'GET') {
    // Tüm kullanıcıları listele
    const users = await prisma.user.findMany({ select: { id: true, ad: true, email: true, rol: true } });
    return res.status(200).json({ users });
  } else if (req.method === 'DELETE') {
    // Kullanıcı silme
    const { id } = req.body;
    if (id === oturum.id) {
      return res.status(400).json({ mesaj: 'Admin kendi hesabını silemez.' });
    }
    try {
      await prisma.user.delete({ where: { id } });
      return res.status(200).json({ mesaj: 'Kullanıcı silindi.' });
    } catch (e) {
      return res.status(500).json({ mesaj: 'Sunucu hatası', hata: e.message });
    }
  } else if (req.method === 'PUT') {
    // Kullanıcı rolü değiştirme
    const { id, rol } = req.body;
    if (id === oturum.id) {
      return res.status(400).json({ mesaj: 'Admin kendi rolünü değiştiremez.' });
    }
    try {
      await prisma.user.update({ where: { id }, data: { rol } });
      return res.status(200).json({ mesaj: 'Rol güncellendi.' });
    } catch (e) {
      return res.status(500).json({ mesaj: 'Sunucu hatası', hata: e.message });
    }
  } else {
    return res.status(405).json({ mesaj: 'GET, DELETE ve PUT desteklenir.' });
  }
}
