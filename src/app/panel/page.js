"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PanelPage() {
  const router = useRouter();
  const [kullanici, setKullanici] = useState(null);

  useEffect(() => {
    const k = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("kullanici")) : null;
    if (!k) {
      router.push("/login");
    } else {
      setKullanici(k);
    }
  }, [router]);

  if (!kullanici) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100">Yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex flex-col">
      <header className="w-full bg-white shadow-md py-6 px-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-extrabold text-orange-700 tracking-tight">
            Musa Stil Club
          </span>
        </div>
        <nav className="flex gap-4 items-center">
          {kullanici.rol === 'admin' && (
            <a href="/admin" className="text-orange-700 font-semibold hover:underline flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Admin Panel
            </a>
          )}
          <a href="/randevularim" className="text-orange-700 font-semibold hover:underline">Randevularım</a>
          <a href="/profil" className="text-orange-700 font-semibold hover:underline">Profilim</a>
          <a href="/mesajlar" className="text-orange-700 font-semibold hover:underline">Mesajlarım</a>
          <button
            onClick={() => {
              localStorage.removeItem("kullanici");
              router.push("/"); // Anasayfaya yönlendir
            }}
            className="ml-4 px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded font-bold shadow transition"
          >
            Çıkış Yap
          </button>
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl font-extrabold text-orange-700 mb-4 drop-shadow">
          Hoş geldiniz, {kullanici.ad}!
        </h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Musa Stil Club Paneliniz
        </h2>
        <p className="mb-8 text-lg text-gray-700 max-w-2xl mx-auto">
          Randevularınızı kolayca yönetin, profil bilgilerinizi güncelleyin ve mesajlarınızı takip edin. Size özel fırsatlar ve duyurular için profilinizi düzenli takip edin!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <a href="/randevularim" className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-xl transition">
            <img src="/barber-chair.png" alt="Randevularım" className="w-20 h-20 mb-4" />
            <span className="text-xl font-bold text-orange-600 mb-2">Randevularım</span>
            <span className="text-gray-600">Tüm randevularınızı görüntüleyin ve yönetin.</span>
          </a>
          <a href="/profil" className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-xl transition">
            <img src="/profile.png" alt="Profilim" className="w-20 h-20 mb-4" />
            <span className="text-xl font-bold text-orange-600 mb-2">Profilim</span>
            <span className="text-gray-600">Kişisel bilgilerinizi ve tercihlerinizi düzenleyin.</span>
          </a>
          <a href="/mesajlar" className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-xl transition">
            <img src="/messages.png" alt="Mesajlarım" className="w-20 h-20 mb-4" />
            <span className="text-xl font-bold text-orange-600 mb-2">Mesajlarım</span>
            <span className="text-gray-600">Gelen ve giden mesajlarınızı takip edin.</span>
          </a>
        </div>
      </main>
      <footer className="bg-white py-4 text-center text-gray-500 text-sm shadow-inner mt-8">
        © 2025 Musa Stil Club | Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
