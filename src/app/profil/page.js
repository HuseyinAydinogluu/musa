"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilPage() {
  const router = useRouter();
  const [kullanici, setKullanici] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ad, setAd] = useState("");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [mesajTip, setMesajTip] = useState(""); // 'basari' veya 'hata'

  useEffect(() => {
    const k =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("kullanici"))
        : null;
    if (!k) {
      router.push("/login");
    } else {
      setKullanici(k);
      setAd(k.ad);
      setEmail(k.email);
      setLoading(false);
    }
  }, [router]);

  // Profil güncelleme formu gönderildiğinde çalışır
  async function handleGuncelle(e) {
    e.preventDefault();
    setMesaj("");
    setMesajTip("");
    try {
      const guncelleBody = { id: kullanici.id, ad, email };
      if (sifre) guncelleBody.sifre = sifre;

      const res = await fetch("/api/profil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        credentials: "include",
        body: JSON.stringify(guncelleBody),
      });

      const data = await res.json();

      if (res.ok) {
        // localStorage'daki kullanıcıyı güncelle
        const yeniKullanici = { ...kullanici, ...data.kullanici };
        localStorage.setItem("kullanici", JSON.stringify(yeniKullanici));
        setKullanici(yeniKullanici);
        setMesaj(data.mesaj || "Profil başarıyla güncellendi.");
        setMesajTip("basari");
        setSifre(""); // Şifre alanını temizle
      } else {
        setMesaj(data.mesaj || "Bir hata oluştu.");
        setMesajTip("hata");
        // Yetki hatası varsa login'e yönlendir
        if (res.status === 401) {
          router.push("/login");
        }
      }
    } catch (err) {
      console.error("Profil güncelleme hatası:", err);
      setMesaj("Sunucu hatası. Lütfen tekrar deneyin.");
      setMesajTip("hata");
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
        Yükleniyor...
      </div>
    );
  if (!kullanici) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-10 p-12 bg-white/95 rounded-3xl shadow-2xl border border-blue-200 backdrop-blur-md">
        {/* Profil Alanı */}
        <div className="flex-1 min-w-[340px] flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-200 flex items-center justify-center shadow-lg mb-4 border-4 border-white">
            <svg
              className="w-20 h-20 text-white opacity-80"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.25v-.667A4.583 4.583 0 019.083 14h5.834A4.583 4.583 0 0120.5 18.583v.667"
              />
            </svg>
          </div>
          <h2 className="text-4xl font-extrabold mb-2 text-center text-blue-700 tracking-tight drop-shadow">
            {kullanici.ad}
          </h2>
          <div className="text-blue-500 text-lg font-semibold mb-6">
            {kullanici.email}
          </div>
          <div className="flex flex-col gap-2 text-base text-gray-700 w-full max-w-xs mx-auto mb-8">
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-700">Rol:</span>
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider shadow-sm">
                {kullanici.rol}
              </span>
            </div>
          </div>
          {/* Başarı veya hata mesajı kutusu */}
          {mesaj && (
            <div
              className={`mb-4 px-4 py-2 rounded text-center font-semibold shadow-sm ${
                mesajTip === "basari"
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300"
              }`}
            >
              {mesaj}
            </div>
          )}
          <form
            onSubmit={handleGuncelle}
            className="flex flex-col gap-4 w-full max-w-xs mx-auto bg-blue-50/60 p-6 rounded-2xl border border-blue-100 shadow"
          >
            <label className="flex flex-col gap-1">
              <span className="font-bold text-blue-700">Ad</span>
              <input
                type="text"
                value={ad}
                onChange={(e) => setAd(e.target.value)}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 font-semibold text-black placeholder:text-blue-400 bg-white"
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-bold text-blue-700">E-posta</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 font-semibold text-black placeholder:text-blue-400 bg-white"
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-bold text-blue-700">
                Yeni Şifre (isteğe bağlı)
              </span>
              <input
                type="password"
                value={sifre}
                onChange={(e) => setSifre(e.target.value)}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 font-semibold text-black placeholder:text-blue-400 bg-white"
                placeholder="Yeni şifre girin"
                minLength={4}
              />
              <span className="text-xs text-gray-500">
                Şifreyi değiştirmek istemiyorsanız boş bırakın.
              </span>
            </label>
            <button
              type="submit"
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow transition-all duration-150"
            >
              Güncelle
            </button>
          </form>
          <div className="mt-8">
            <a
              href="/panel"
              className="text-blue-600 hover:underline font-semibold text-base"
            >
              Ana Sayfaya Dön
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Bildirimler bileşeni
function Bildirimler({ kullaniciId }) {
  const [bildirimler, setBildirimler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    async function fetchBildirimler() {
      setYukleniyor(true);
      try {
        const res = await fetch(`/api/bildirim?kullaniciId=${kullaniciId}`);
        const data = await res.json();
        if (res.ok) setBildirimler(data.bildirimler);
      } finally {
        setYukleniyor(false);
      }
    }
    if (kullaniciId) fetchBildirimler();
  }, [kullaniciId]);

  if (yukleniyor) return <div>Yükleniyor...</div>;
  if (!bildirimler.length)
    return (
      <div className="text-gray-500 text-center">Hiç bildiriminiz yok.</div>
    );

  return (
    <ul className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
      {bildirimler.map((b) => (
        <li
          key={b.id}
          className="bg-white border border-blue-100 rounded p-3 text-sm text-gray-800 shadow flex flex-col gap-1"
        >
          <span className="block font-semibold text-blue-700 text-xs">
            {new Date(b.createdAt).toLocaleString("tr-TR")}
          </span>
          <span className="leading-snug">{b.icerik}</span>
        </li>
      ))}
    </ul>
  );
}
