"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MesajlarPage() {
  const router = useRouter();
  const [mesajlar, setMesajlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kullanici, setKullanici] = useState(null);
  const [kullanicilar, setKullanicilar] = useState([]);
  const [secilenKullanici, setSecilenKullanici] = useState("");
  const [mesajIcerik, setMesajIcerik] = useState("");
  const [bildirim, setBildirim] = useState({ mesaj: "", tip: "" });

  useEffect(() => {
    const k = JSON.parse(localStorage.getItem("kullanici"));
    if (!k) {
      router.push("/login");
      return;
    }
    setKullanici(k);
    console.log("Oturum bilgisi:", k); // Debug için

    // Gelen mesajları getir
    fetch(`/api/mesaj?kullaniciId=${k.id}`, { 
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      const gelenMesajlar = (data.mesajlar || []).filter(m => m.aliciId === k.id);
      setMesajlar(gelenMesajlar);
      console.log("Gelen mesajlar:", gelenMesajlar); // Debug için
      setLoading(false);
    })
    .catch(err => {
      console.error("Mesaj yükleme hatası:", err);
      setLoading(false);
    });

    // Tüm kullanıcıları getir
    console.log("Kullanıcı listesi isteği yapılıyor..."); // Debug için
    fetch("/api/profil?kullanicilar=1", { 
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(async res => {
      const text = await res.text();
      console.log("API yanıtı:", text); // Debug için
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error("JSON parse hatası:", e);
        throw new Error('API yanıtı JSON formatında değil');
      }
    })
    .then(data => {
      console.log("Kullanıcı listesi verisi:", data); // Debug için
      if (data && data.kullanicilar) {
        const filtrelenmisKullanicilar = data.kullanicilar.filter(u => u.id !== k.id);
        console.log("Filtrelenmiş kullanıcılar:", filtrelenmisKullanicilar);
        setKullanicilar(filtrelenmisKullanicilar);
      } else {
        console.error("Kullanıcı listesi bulunamadı:", data);
      }
    })
    .catch(err => {
      console.error("Kullanıcı listesi yükleme hatası:", err);
      setBildirim({ 
        mesaj: "Kullanıcı listesi yüklenirken bir hata oluştu: " + err.message, 
        tip: "hata" 
      });
    });
  }, [router]);

  const handleMesajGonder = async (e) => {
    e.preventDefault();
    if (!secilenKullanici || !mesajIcerik.trim()) {
      setBildirim({ mesaj: "Lütfen bir alıcı seçin ve mesaj yazın", tip: "hata" });
      return;
    }

    try {
      const res = await fetch("/api/mesaj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          gonderenId: kullanici.id,
          aliciId: parseInt(secilenKullanici),
          icerik: mesajIcerik
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setBildirim({ mesaj: "Mesaj başarıyla gönderildi", tip: "basari" });
        setMesajIcerik(""); // Mesaj alanını temizle
        setSecilenKullanici(""); // Seçili kullanıcıyı sıfırla
      } else {
        setBildirim({ mesaj: data.mesaj || "Bir hata oluştu", tip: "hata" });
      }
    } catch (error) {
      setBildirim({ mesaj: "Sunucu hatası oluştu", tip: "hata" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-lg font-semibold text-blue-800">Mesajlarınız Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Sayfa Başlığı */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-blue-800 mb-2">Mesajlarım</h1>
          <p className="text-gray-600">Mesajlarınızı yönetin ve yeni mesaj gönderin</p>
        </div>

        {/* Mesaj Gönderme Formu */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-blue-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-blue-800">Yeni Mesaj</h2>
          </div>
          
          <form onSubmit={handleMesajGonder} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Alıcı
              </label>
              <div className="relative">
                <select
                  value={secilenKullanici}
                  onChange={(e) => setSecilenKullanici(e.target.value)}
                  className="w-full p-3 pl-4 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-black appearance-none bg-white shadow-sm"
                  required
                >
                  <option value="">Alıcı seçin</option>
                  {kullanicilar.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.ad} ({k.email})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mesaj İçeriği
              </label>
              <textarea
                value={mesajIcerik}
                onChange={(e) => {
                  const yeniIcerik = e.target.value;
                  if (yeniIcerik.length <= 200) {
                    setMesajIcerik(yeniIcerik);
                  }
                }}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-black resize-none shadow-sm"
                rows="4"
                placeholder="Mesajınızı buraya yazın (3-200 karakter)..."
                minLength={3}
                maxLength={200}
                required
              />
              <div className="mt-2 flex justify-between items-center text-sm">
                <span className="text-gray-500">
                  Minimum 3 karakter gerekli
                </span>
                <span className={`font-medium ${
                  mesajIcerik.length > 180 ? 'text-orange-500' : 
                  mesajIcerik.length > 190 ? 'text-red-500' : 
                  'text-gray-500'
                }`}>
                  {mesajIcerik.length}/200
                </span>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02]"
            >
              Mesajı Gönder
            </button>
          </form>

          {bildirim.mesaj && (
            <div className={`mt-6 p-4 rounded-xl ${
              bildirim.tip === 'basari' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            } flex items-center gap-3 animate-fade-in`}>
              <div className={bildirim.tip === 'basari' ? 'text-green-500' : 'text-red-500'}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  {bildirim.tip === 'basari' 
                    ? <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  }
                </svg>
              </div>
              {bildirim.mesaj}
            </div>
          )}
        </div>

        {/* Gelen Mesajlar */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-blue-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-blue-800">Gelen Mesajlar</h2>
          </div>

          {mesajlar.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="inline-block p-4 rounded-full bg-blue-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Gelen Kutusu Boş</h3>
              <p className="text-gray-500">Henüz hiç mesajınız bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mesajlar.map((mesaj) => (
                <div
                  key={mesaj.id}
                  className="bg-blue-50/50 rounded-xl p-6 border border-blue-100 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-semibold text-lg">
                          {mesaj.gonderen?.ad.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-blue-800 group-hover:text-blue-600 transition-colors truncate">
                          {mesaj.gonderen?.ad}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {mesaj.gonderen?.email}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 flex-shrink-0">
                      {new Date(mesaj.createdAt).toLocaleString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="text-gray-700 ml-13 pl-[52px] break-words whitespace-pre-wrap">
                    {mesaj.icerik}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
