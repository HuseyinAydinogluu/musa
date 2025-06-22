"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex flex-col">
      <header className="w-full bg-white shadow-md py-6 px-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-extrabold text-orange-700 tracking-tight">
            Musa Stil Club
          </span>
        </div>
        <nav className="flex gap-4">
          <Link
            href="/fiyat"
            className="text-orange-700 font-semibold hover:underline"
          >
            Fiyat Listesi
          </Link>
          <Link
            href="/register"
            className="text-orange-700 font-semibold hover:underline"
          >
            Kayıt Ol
          </Link>
          <Link
            href="/login"
            className="text-orange-700 font-semibold hover:underline"
          >
            Giriş Yap
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl font-extrabold text-orange-700 mb-4 drop-shadow">
          Modern Musa Stil Club Hizmetleri
        </h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Stiliniz, Güveniniz, Musa Stil Club!
        </h2>
        <p className="mb-8 text-lg text-gray-700 max-w-2xl mx-auto">
          Deneyimli ekibimizle saç ve sakal kesimi, bakım ve şekillendirme,
          hijyenik ortam ve müşteri memnuniyeti odaklı hizmet sunuyoruz. Randevu
          sistemi ile beklemeden, hızlı ve kaliteli hizmet alın. Kampanyalarımızı
          ve fırsatlarımızı kaçırmayın!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <img
              src="/barber-chair.png"
              alt="Berber Koltuğu"
              className="w-24 h-24 mb-4"
            />
            <h3 className="text-xl font-bold text-orange-600 mb-2">
              Saç & Sakal Kesimi
            </h3>
            <p className="text-gray-600">
              Kişiye özel modern ve klasik kesimler, profesyonel dokunuşlar.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <img
              src="/scissors.png"
              alt="Makas"
              className="w-24 h-24 mb-4"
            />
            <h3 className="text-xl font-bold text-orange-600 mb-2">
              Bakım & Şekillendirme
            </h3>
            <p className="text-gray-600">
              Saç ve sakal bakımı, şekillendirme ve özel ürünlerle hizmet.
            </p>
          </div>
        </div>
        <Link
          href="/register"
          className="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow hover:bg-orange-700 transition"
        >
          Hemen Kayıt Ol
        </Link>
      </main>

      <footer className="bg-white py-4 text-center text-gray-500 text-sm shadow-inner mt-8">
        © 2025 Musa Stil Club | Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
