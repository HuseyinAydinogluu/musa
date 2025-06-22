'use client';
// src/app/register/page.js
// Kullanıcı kayıt sayfası
import { useState } from 'react';

export default function RegisterPage() {
  const [ad, setAd] = useState('');
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [mesaj, setMesaj] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setYukleniyor(true);
    setMesaj('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad, email, sifre })
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setMesaj('Sunucu beklenmeyen bir yanıt döndürdü.');
        setYukleniyor(false);
        return;
      }
      setYukleniyor(false);
      setMesaj(data.mesaj || 'Bilinmeyen hata');
      if (res.ok) {
        window.location.href = '/login';
      }
    } catch (err) {
      setMesaj('İstek gönderilemedi: ' + err.message);
      setYukleniyor(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="w-full max-w-md p-10 bg-white/95 rounded-3xl shadow-2xl border border-blue-200 backdrop-blur-md relative">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full p-2 shadow-lg">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M8 12l2 2 4-4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-700 tracking-tight drop-shadow">Kayıt Ol</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input type="text" placeholder="Adınız" value={ad} onChange={e => setAd(e.target.value)} className="w-full p-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-700 placeholder:font-semibold shadow-sm text-black font-semibold bg-white/90 transition-all duration-200" required />
          <input type="email" placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-700 placeholder:font-semibold shadow-sm text-black font-semibold bg-white/90 transition-all duration-200" required />
          <input type="password" placeholder="Şifre" value={sifre} onChange={e => setSifre(e.target.value)} className="w-full p-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-700 placeholder:font-semibold shadow-sm text-black font-semibold bg-white/90 transition-all duration-200" required />
          <button type="submit" className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white py-3 rounded-xl font-bold shadow-xl hover:from-blue-800 hover:to-blue-600 transition-all duration-200 text-lg tracking-wide disabled:opacity-60 disabled:cursor-not-allowed mt-2">
            {yukleniyor ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </button>
        </form>
        {mesaj && <div className="mt-8 text-center text-base text-blue-700 font-semibold drop-shadow animate-pulse">{mesaj}</div>}
      </div>
    </div>
  );
}
