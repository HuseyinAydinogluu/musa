import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const fiyatlar = [
      { id: 1, hizmet: "Saç Kesimi", fiyat: 150, sure: "30-45 dk" },
      { id: 2, hizmet: "Sakal Kesimi", fiyat: 100, sure: "20-30 dk" },
      { id: 3, hizmet: "Saç & Sakal Kesimi", fiyat: 200, sure: "45-60 dk" },
      { id: 4, hizmet: "Çocuk Saç Kesimi", fiyat: 100, sure: "20-30 dk" },
      { id: 5, hizmet: "Saç Yıkama", fiyat: 50, sure: "15-20 dk" },
      { id: 6, hizmet: "Saç Boyama", fiyat: 300, sure: "90-120 dk" },
      { id: 7, hizmet: "Sakal Boyama", fiyat: 150, sure: "30-45 dk" },
      { id: 8, hizmet: "Cilt Bakımı", fiyat: 200, sure: "30-45 dk" },
      { id: 9, hizmet: "Manikür", fiyat: 120, sure: "30-40 dk" },
      { id: 10, hizmet: "Pedikür", fiyat: 150, sure: "40-50 dk" }
    ];
    
    return new Response(JSON.stringify({ fiyatlar }), { status: 200 });
  } catch (e) {
    console.error('Fiyat Listesi API Hatası:', e);
    return new Response(JSON.stringify({ mesaj: 'Sunucu hatası', hata: e.message }), { status: 500 });
  }
}
