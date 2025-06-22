"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SAATLER = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
];

export default function RandevularimPage() {
  const router = useRouter();
  const [randevular, setRandevular] = useState([]);
  const [tarih, setTarih] = useState("");
  const [saat, setSaat] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [mesajTipi, setMesajTipi] = useState("");
  const [saatler, setSaatler] = useState(SAATLER);

  useEffect(() => {
    const kullanici = JSON.parse(localStorage.getItem("kullanici"));
    if (!kullanici) {
      router.push("/login");
      return;
    }
    fetch(`/api/randevu?kullaniciId=${kullanici.id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error("API yanıtı başarısız: " + res.status);
        }
        return res.json();
      })
      .then(data => setRandevular(data.randevular || []))
      .catch(error => {
        console.error("Randevular yüklenirken hata:", error);
        setMesaj("Randevular yüklenirken bir hata oluştu.");
        setMesajTipi("hata");
      });
  }, [router]);

  useEffect(() => {
    if (!tarih) {
      setSaat("");
      setSaatler(SAATLER);
      return;
    }

    const seciliTarih = new Date(tarih);
    const simdi = new Date();

    fetch(`/api/randevu?date=${seciliTarih.toISOString()}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("API yanıtı başarısız: " + res.status);
        }
        return res.json();
      })
      .then((data) => {
        const doluSaatler = data.doluSaatler || [];
        const uygunSaatler = SAATLER.filter((saat) => {
          const [saatSaat, saatDakika] = saat.split(":").map(Number);
          const saatDate = new Date(seciliTarih);
          saatDate.setHours(saatSaat, saatDakika, 0, 0);

          return !doluSaatler.includes(saat) && saatDate > simdi;
        });

        setSaatler(uygunSaatler);
        setSaat(uygunSaatler[0] || "");
      })
      .catch((error) => {
        console.error("Saatler yüklenirken hata:", error);
        setMesaj("Saatler yüklenirken bir hata oluştu.");
        setMesajTipi("hata");
      });
  }, [tarih]);

  const handleRandevuAl = async (e) => {
    e.preventDefault();
    setMesaj("");
    setMesajTipi("");
    const kullanici = JSON.parse(localStorage.getItem("kullanici"));
    if (!tarih || !saat) {
      setMesaj("Lütfen tarih ve saat seçiniz.");
      setMesajTipi("hata");
      return;
    }
    const randevuTarihi = new Date(`${tarih}T${saat}`);
    const simdi = new Date();

    if (randevuTarihi <= simdi) {
      setMesaj("Bugün için geçmiş bir saat seçemezsiniz.");
      setMesajTipi("hata");
      return;
    }

    const res = await fetch("/api/randevu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tarih: randevuTarihi,
        kullaniciId: kullanici.id,
      }),
    });
    const data = await res.json();
    setMesaj(data.mesaj);
    setMesajTipi(res.ok ? "basari" : "hata");
    if (res.ok) {
      fetch(`/api/randevu?kullaniciId=${kullanici.id}`)
        .then((res) => res.json())
        .then((data) => setRandevular(data.randevular || []));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg p-8 mb-8 border border-gray-200">
        <h1 className="text-3xl font-extrabold mb-6 text-blue-800">Randevu Al</h1>
        <form onSubmit={handleRandevuAl} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Tarih</label>
            <input
              type="date"
              value={tarih}
              onChange={(e) => setTarih(e.target.value)}
              className="w-full px-4 py-3 border-2 border-blue-500 rounded-lg shadow-md text-lg bg-blue-50 text-gray-800 font-semibold placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-700"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Saat</label>
            <select
              value={saat}
              onChange={(e) => setSaat(e.target.value)}
              className="w-full px-4 py-3 border-2 border-blue-500 rounded-lg shadow-md text-lg bg-blue-50 text-gray-800 font-semibold placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-700"
            >
              {saatler.map((saat) => (
                <option key={saat} value={saat}>{saat}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Randevu Al
          </button>
        </form>

        {mesaj && (
          <p className={`mt-4 text-sm font-medium ${mesajTipi === "hata" ? "text-red-500" : "text-green-500"}`}>{mesaj}</p>
        )}
      </div>

      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg p-8 border border-gray-200">
        <h1 className="text-3xl font-extrabold mb-6 text-blue-800">Randevularım</h1>
        {randevular.length > 0 ? (
          randevular.map((randevu) => (
            <div key={randevu.id} className={`bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 ${randevu.durum === "onaylandı" ? "border-green-500" : "border-yellow-500"}`}>
              <p className="text-lg font-semibold text-gray-800">{randevu.user?.ad || "Siz"}</p>
              <p className="text-sm text-gray-600">{new Date(randevu.tarih).toLocaleString()}</p>
              <p className={`text-sm font-medium ${randevu.durum === "onaylandı" ? "text-green-500" : "text-gray-700"}`}>Durum: {randevu.durum}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">Henüz randevunuz bulunmamaktadır.</p>
        )}
      </div>
    </div>
  );
}
