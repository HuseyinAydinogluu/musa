// src/app/api/auth/logout.js
// Kullanıcı çıkış API endpointi
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ mesaj: 'Sadece POST isteği desteklenir.' });
  }
  // Oturum çerezini siliyoruz
  const cookie = serialize('oturum', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  res.setHeader('Set-Cookie', cookie);
  return res.status(200).json({ mesaj: 'Çıkış başarılı' });
}
