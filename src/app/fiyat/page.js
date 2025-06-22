"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function FiyatListesiPage() {
  const [fiyatListesi, setFiyatListesi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hata, setHata] = useState(null);

  useEffect(() => {
    const fetchFiyatlar = async () => {
      try {
        const res = await fetch('/api/admin/hizmetler');
        if (!res.ok) {
          throw new Error(`Hata: ${res.status} - ${res.statusText}`);
        }
        const data = await res.json();
        if (!data.hizmetler || data.hizmetler.length === 0) {
          throw new Error("Hiçbir hizmet bulunamadı.");
        }
        setFiyatListesi(data.hizmetler);
      } catch (error) {
        console.error('Fiyat listesi yüklenirken hata:', error);
        setHata(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFiyatlar();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Başlık ve Geri Dön Butonu */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-orange-700">Berber Fiyat Listesi</h1>
          <Link
            href="/"
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Anasayfaya Dön
          </Link>
        </div>

        {/* Fiyat Listesi Tablosu */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
          ) : hata ? (
            <div className="flex justify-center items-center py-12">
              <p className="text-red-600 font-semibold">{hata}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                      <th className="py-4 px-6 text-left font-semibold tracking-wider">Hizmet</th>
                      <th className="py-4 px-6 text-right font-semibold tracking-wider">Fiyat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {fiyatListesi.map((item) => (
                      <tr key={item.id} className="hover:bg-orange-50 transition-colors duration-200">
                        <td className="py-4 px-6 text-gray-800">{item.ad}</td>
                        <td className="py-4 px-6 text-right font-semibold text-orange-600">
                          {item.fiyat} ₺
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-gray-600 text-sm">
                    * Fiyatlarımız güncel olup, değişiklik hakkı saklıdır.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <span>Hemen Randevu Al</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
