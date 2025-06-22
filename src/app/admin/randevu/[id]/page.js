"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RandevuDuzenle({ params }) {
  const router = useRouter();
  const [randevu, setRandevu] = useState(null);
  const [loading, setLoading] = useState(true);
  // ID'yi doğrudan params nesnesinden alıyoruz
  const id = params.id;

  useEffect(() => {
    async function fetchRandevu() {
      if (!id) {
        toast.error("Randevu ID bulunamadı");
        setLoading(false);
        return;
      }      try {
        const response = await fetch(`/api/admin/randevular/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.mesaj || "Randevu bilgisi alınamadı.");
        }

        const data = await response.json();

        if (!data || Object.keys(data).length === 0) {
          throw new Error("Randevu bulunamadı.");
        }

        setRandevu(data);
      } catch (error) {
        console.error("Fetch hatası:", error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRandevu();
  }, [id]);

  async function handleUpdate(e) {
    e.preventDefault();

    if (!randevu) {
      toast.error("Güncellenecek randevu bulunamadı");
      return;
    }

    try {
      const response = await fetch(`/api/admin/randevular/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(randevu),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mesaj || "Randevu güncellenemedi.");
      }

      // Randevu durumu 'onaylandi' ise, kullanıcıya bildirim gönder
      if (randevu.durum === "onaylandi") {
        try {
          await fetch(`/api/kullanici/${randevu.user.id}/bildirimler`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              mesaj: "Randevunuz onaylandı.",
              tarih: new Date().toISOString(),
            }),
          });
        } catch (error) {
          console.error("Bildirim ekleme hatası:", error);
        }
      }

      toast.success("Randevu başarıyla güncellendi.");
      setTimeout(() => {
        router.push("/admin");
      }, 2000);
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      toast.error(error.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!randevu) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <ToastContainer position="top-right" autoClose={3000} />
        <p className="text-xl text-red-500">Randevu bulunamadı</p>
        <button
          onClick={() => router.push("/admin")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Admin Paneline Dön
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Randevu Düzenle</h1>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Müşteri Adı
            </label>
            <input
              type="text"
              value={randevu.user?.ad || "Müşteri bilgisi bulunamadı"}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tarih ve Saat
            </label>
            <input
              type="datetime-local"
              value={
                randevu.tarih
                  ? new Date(randevu.tarih).toISOString().slice(0, 16)
                  : ""
              }
              onChange={(e) => setRandevu({ ...randevu, tarih: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Durum
            </label>            <select
              value={randevu.durum || "bekliyor"}
              onChange={(e) => setRandevu({ ...randevu, durum: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="bekliyor">Bekliyor</option>
              <option value="onaylandi">Onaylandı</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Not
            </label>
            <textarea
              value={randevu.not || ""}
              onChange={(e) => setRandevu({ ...randevu, not: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Güncelle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
