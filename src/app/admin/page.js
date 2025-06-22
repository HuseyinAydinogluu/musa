"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminPage() {
  const [kullanicilar, setKullanicilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('kullanicilar');
  const [randevular, setRandevular] = useState([]);
  const [randevuFiltresi, setRandevuFiltresi] = useState({
    tarihAraligi: 'today',
    durum: 'all',
    siralama: 'newest',
    sayfa: 1
  });
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userJSON = localStorage.getItem("kullanici");
        if (!userJSON) {
          router.push("/login");
          return;
        }

        const userData = JSON.parse(userJSON);
        if (!userData || userData.rol !== "admin") {
          router.push("/panel");
          return;
        }
        setUser(userData);

        // Kullanıcıları getir
        const resUsers = await fetch("/api/admin/kullanicilar");
        if (!resUsers.ok) {
          throw new Error('Kullanıcılar getirilemedi');
        }
        const dataUsers = await resUsers.json();
        setKullanicilar(dataUsers.kullanicilar || []);

        // Randevuları getir
        if (activeTab === 'randevular') {
          await fetchRandevular();
        }
      } catch (error) {
        console.error("Veri yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);
  const fetchRandevular = async () => {
    try {
      const queryString = new URLSearchParams({
        tarihAraligi: randevuFiltresi.tarihAraligi,
        durum: randevuFiltresi.durum,
        siralama: randevuFiltresi.siralama,
        sayfa: randevuFiltresi.sayfa.toString()
      }).toString();      const res = await fetch(`/api/admin/randevular?${queryString}`);
      
      // Response içeriğini yalnızca bir kez okuyabildiğimiz için önce tüm veriyi alıyoruz
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.mesaj || 'Randevular getirilemedi');
      }
      setRandevular(data.randevular || []);
    } catch (error) {
      console.error("Randevular yüklenirken hata:", error);
      toast.error(`Randevular yüklenirken hata oluştu: ${error.message}`);
      // Hata olsa bile boş liste gösterelim ki UI düzgün çalışsın
      setRandevular([]);
    }
  };

  useEffect(() => {
    if (activeTab === 'randevular') {
      fetchRandevular();
    }
  }, [randevuFiltresi]);

  const handleRoleChange = async (userId, newRole) => {
    if (!userId || !newRole) return;

    try {
      const res = await fetch("/api/admin/kullanicilar", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, newRole }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        alert(data.mesaj || 'Rol güncellenirken hata oluştu');
        return;
      }

      setKullanicilar(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, rol: newRole } : user
        )
      );
    } catch (error) {
      console.error("Rol güncellenirken hata:", error);
      alert('Rol güncellenirken hata oluştu');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!userId || !window.confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/kullanicilar?id=${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.mesaj || 'Kullanıcı silinirken hata oluştu');
        return;
      }

      setKullanicilar(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error("Kullanıcı silinirken hata:", error);
      alert('Kullanıcı silinirken hata oluştu');
    }
  };
  const handleRandevuGuncelle = async (id, durum) => {
    try {
      const updateData = {
        id,
        durum
      };

      const res = await fetch("/api/admin/randevular", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });
      
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.mesaj || 'Randevu güncellenirken hata oluştu');
        return;
      }

      toast.success(`Randevu durumu "${durum}" olarak güncellendi`);
      await fetchRandevular();
    } catch (error) {
      console.error("Randevu güncellenirken hata:", error);
      toast.error('Randevu güncellenirken hata oluştu');
    }
  };
  
  const handleRandevuSil = async (id) => {
    if (!window.confirm("Bu randevuyu silmek istediğinizden emin misiniz?")) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/randevular/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.mesaj || 'Randevu silinirken hata oluştu');
        return;
      }

      toast.success("Randevu başarıyla silindi");
      await fetchRandevular();
    } catch (error) {
      console.error("Randevu silinirken hata:", error);
      toast.error('Randevu silinirken hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-extrabold text-center text-blue-700 mb-8">Admin Paneli</h1>

        {/* Tab Menüsü */}
        <div className="mb-8">
          <div className="border-b">
            <nav className="flex justify-center gap-6">
              <button
                onClick={() => setActiveTab('kullanicilar')}
                className={`py-3 px-6 rounded-lg transition-all shadow-md ${
                  activeTab === 'kullanicilar'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white text-blue-600 hover:bg-blue-100'
                }`}
              >
                Kullanıcı Yönetimi
              </button>
              <button
                onClick={() => setActiveTab('randevular')}
                className={`py-3 px-6 rounded-lg transition-all shadow-md ${
                  activeTab === 'randevular'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white text-blue-600 hover:bg-blue-100'
                }`}
              >
                Randevu Takibi
              </button>
            </nav>
          </div>
        </div>

        {/* Kullanıcı Yönetimi */}
        {activeTab === 'kullanicilar' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-blue-700 mb-6">Kullanıcı Listesi</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead><tr className="bg-blue-50">
                    <th className="px-6 py-3 border border-gray-300 text-left text-sm font-semibold text-blue-600 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 border border-gray-300 text-left text-sm font-semibold text-blue-600 uppercase tracking-wider">Ad</th>
                    <th className="px-6 py-3 border border-gray-300 text-left text-sm font-semibold text-blue-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 border border-gray-300 text-left text-sm font-semibold text-blue-600 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-3 border border-gray-300 text-left text-sm font-semibold text-blue-600 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {kullanicilar.map((kullanici) => (
                    <tr key={kullanici.id}>
                      <td className="px-6 py-4 border border-gray-300 whitespace-nowrap text-blue-700 font-medium">
                        {kullanici.id}
                      </td>
                      <td className="px-6 py-4 border border-gray-300 whitespace-nowrap text-blue-700 font-medium">
                        {kullanici.ad}
                      </td>
                      <td className="px-6 py-4 border border-gray-300 whitespace-nowrap text-blue-700 font-medium">
                        {kullanici.email}
                      </td>
                      <td className="px-6 py-4 border border-gray-300 whitespace-nowrap">
                        <select
                          value={kullanici.rol}
                          onChange={(e) => handleRoleChange(kullanici.id, e.target.value)}
                          disabled={kullanici.id === user?.id}
                          className="border rounded px-2 py-1 text-blue-700"
                        >
                          <option value="kullanici">Kullanıcı</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 border border-gray-300 whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteUser(kullanici.id)}
                          disabled={kullanici.id === user?.id}
                          className={`text-red-600 hover:text-red-800 ${
                            kullanici.id === user?.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Randevu Takibi */}
        {activeTab === 'randevular' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-blue-700 mb-6">Randevu Listesi</h2>
            
            {/* Filtreler */}
            <div className="mb-6 flex gap-4">
              <select
                value={randevuFiltresi.tarihAraligi}
                onChange={(e) => setRandevuFiltresi((prev) => ({
                  ...prev,
                  tarihAraligi: e.target.value,
                }))}
                className="border rounded px-3 py-2 text-blue-700"
              >
                <option value="today">Bugün</option>
                <option value="tomorrow">Yarın</option>
                <option value="week">Bu Hafta</option>
                <option value="month">Bu Ay</option>
              </select>              <select
                value={randevuFiltresi.durum}
                onChange={(e) => setRandevuFiltresi((prev) => ({
                  ...prev,
                  durum: e.target.value,
                }))}
                className="border rounded px-3 py-2 text-blue-700"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="bekliyor">Bekliyor</option>
                <option value="onaylandi">Onaylandı</option>
              </select>
            </div>

            {/* Randevu Tablosu */}
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead><tr className="bg-blue-50">
                    <th className="px-6 py-3 border border-gray-300 text-left text-sm font-semibold text-blue-600 uppercase tracking-wider">Müşteri</th>
                    <th className="px-6 py-3 border border-gray-300 text-left text-sm font-semibold text-blue-600 uppercase tracking-wider">Tarih</th>
                    <th className="px-6 py-3 border border-gray-300 text-left text-sm font-semibold text-blue-600 uppercase tracking-wider">Saat</th>
                    <th className="px-6 py-3 border border-gray-300 text-left text-sm font-semibold text-blue-600 uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-3 border border-gray-300 text-left text-sm font-semibold text-blue-600 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {randevular.map((randevu) => (
                    <tr key={randevu.id}>
                      <td className="px-6 py-4 border border-gray-300 whitespace-nowrap text-blue-700 font-medium">
                        {randevu.user.ad}
                      </td>
                      <td className="px-6 py-4 border border-gray-300 whitespace-nowrap text-blue-700 font-medium">
                        {new Date(randevu.tarih).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 border border-gray-300 whitespace-nowrap text-blue-700 font-medium">
                        {new Date(randevu.tarih).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 border border-gray-300 whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 text-sm rounded-full ${
                            randevu.durum === 'bekliyor' ? 'bg-yellow-100 text-yellow-800' :
                            randevu.durum === 'onaylandi' ? 'bg-green-100 text-green-800' :
                            randevu.durum === 'iptal' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'}`}
                        >
                          {randevu.durum.charAt(0).toUpperCase() + randevu.durum.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 border border-gray-300 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRandevuGuncelle(randevu.id, "onaylandi")}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition"
                            disabled={randevu.durum === "onaylandi" || randevu.durum === "tamamlandi"}
                          >
                            Onayla
                          </button>
                          <button
                            onClick={() => handleRandevuSil(randevu.id)}
                            className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Hizmet/Fiyat Güncelleme Butonu */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/admin/hizmetler")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all shadow-md"
          >
            Hizmet/Fiyat Güncelleme
          </button>
        </div>
      </div>
    </div>
  );
}
