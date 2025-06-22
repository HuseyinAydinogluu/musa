"use client";
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function HizmetlerPage() {
  const [fiyatListesi, setFiyatListesi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editedItems, setEditedItems] = useState({}); // Değişiklikleri takip etmek için

  useEffect(() => {
    const fetchFiyatlar = async () => {
      try {
        const res = await fetch("/api/admin/hizmetler");
        if (!res.ok) {
          throw new Error(`API yanıtı başarısız: ${res.status}`);
        }
        const data = await res.json();
        if (!data.hizmetler) {
          throw new Error("Hizmetler verisi boş.");
        }
        setFiyatListesi(data.hizmetler);
      } catch (error) {
        console.error("Fiyat listesi yüklenirken hata:", error);
        toast.error("Fiyat listesi yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchFiyatlar();
  }, []);

  const handleInputChange = (id, yeniFiyat) => {
    setEditedItems((prev) => ({
      ...prev,
      [id]: yeniFiyat,
    }));
  };

  const handleUpdate = async (id, ad, yeniFiyat) => {
    try {
      const res = await fetch("/api/admin/hizmetler", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ad, fiyat: yeniFiyat }), // 'isim' yerine 'ad' kullanıldı
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.mesaj || "Hizmet güncellenemedi.");
      }

      toast.success("Hizmet başarıyla güncellendi.");
      setFiyatListesi((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ad, fiyat: yeniFiyat } : item
        )
      );
    } catch (error) {
      console.error("Hizmet güncelleme hatası:", error);
      toast.error(error.message);
    }
  };

  const handleAddHizmet = async (ad, fiyat) => {
    try {
      console.log("handleAddHizmet çağrıldı:", { ad, fiyat }); // Hata ayıklama için
      const res = await fetch("/api/admin/hizmetler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ad, fiyat }), // 'isim' yerine 'ad' kullanıldı
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.mesaj || "Hizmet eklenemedi.");
      }

      toast.success("Hizmet başarıyla eklendi.");
      const yeniHizmetObjesi = await res.json();
      setFiyatListesi((prev) => [...prev, yeniHizmetObjesi]);
    } catch (error) {
      console.error("Hizmet ekleme hatası:", error);
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/admin/hizmetler`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.mesaj || "Hizmet silinemedi.");
      }

      toast.success("Hizmet başarıyla silindi.");
      setFiyatListesi((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Hizmet silme hatası:", error);
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <ToastContainer position="top-right" autoClose={3000} />
        <h1 className="text-4xl font-bold text-blue-700 mb-8">Hizmet/Fiyat Yönetimi</h1>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 bg-gray-50 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Yeni Hizmet Ekle</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const ad = e.target.ad.value.trim(); // 'hizmet' yerine 'ad' kullanıldı
                const fiyat = parseFloat(e.target.fiyat.value);
                console.log("Form verileri:", { ad, fiyat }); // Hata ayıklama için
                if (!ad || isNaN(fiyat)) {
                  toast.error("Tüm alanlar gereklidir ve fiyat geçerli bir sayı olmalıdır.");
                  return;
                }
                handleAddHizmet(ad, fiyat);
                e.target.reset();
              }}
              className="flex gap-4 items-center"
            >
              <input
                type="text"
                name="ad"
                placeholder="Hizmet Adı (örn: Saç Kesimi)"
                className="border border-gray-300 rounded-md px-2 py-1 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="number"
                name="fiyat"
                placeholder="Fiyat (örn: 100)"
                className="border border-gray-300 rounded-md px-2 py-1 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Ekle
              </button>
            </form>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hizmet Adı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fiyat
                    </th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fiyatListesi.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-6 text-gray-800">{item.ad}</td>
                      <td className="py-4 px-6 text-right text-gray-800">
                        <input
                          type="number"
                          defaultValue={item.fiyat}
                          onChange={(e) => handleInputChange(item.id, parseFloat(e.target.value))}
                          className="border border-gray-300 rounded-md px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                        />
                      </td>
                      <td className="py-4 px-6 text-right flex gap-2">
                        <button
                          onClick={() => handleUpdate(item.id, item.ad, editedItems[item.id] || item.fiyat)}
                          disabled={!editedItems[item.id] || editedItems[item.id] === item.fiyat}
                          className={`px-4 py-2 rounded-md text-white ${
                            editedItems[item.id] && editedItems[item.id] !== item.fiyat
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "bg-gray-400 cursor-not-allowed"
                          }`}
                        >
                          Güncelle
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
