import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req, { params }) {
  const { id } = params;
  const { mesaj, tarih } = await req.json();

  if (!id || !mesaj || !tarih) {
    return new Response(JSON.stringify({ mesaj: 'Eksik bilgi gönderildi.' }), {
      status: 400,
    });
  }

  try {
    const bildirim = await prisma.bildirim.create({
      data: {
        kullaniciId: parseInt(id, 10),
        mesaj,
        tarih: new Date(tarih),
      },
    });

    return new Response(JSON.stringify(bildirim), {
      status: 201,
    });
  } catch (error) {
    console.error('Bildirim ekleme hatası:', error);
    return new Response(JSON.stringify({ mesaj: 'Bildirim eklenemedi.' }), {
      status: 500,
    });
  }
}
