import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    console.log("GET /api/admin/hizmetler çağrıldı.");

    const hizmetler = await prisma.hizmet.findMany();
    console.log("Prisma'dan dönen hizmetler:", hizmetler);

    if (!hizmetler || hizmetler.length === 0) {
      console.warn("Hizmetler tablosu boş.");
      return new Response(JSON.stringify({ hizmetler: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Hizmetler başarıyla alındı:", hizmetler);
    return new Response(JSON.stringify({ hizmetler }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET /api/admin/hizmetler Hatası:", error);
    console.error("Prisma Hata Detayları:", error.meta);
    return new Response(JSON.stringify({ mesaj: "Hizmetler alınırken bir hata oluştu.", hata: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PUT(req) {
  try {
    const { id, ad, fiyat } = await req.json();

    if (!id || !ad || fiyat === undefined) {
      console.warn("Eksik alanlar:", { id, ad, fiyat });
      return new Response(
        JSON.stringify({ mesaj: "Tüm alanlar gereklidir. Lütfen id, ad ve fiyat alanlarını eksiksiz doldurun." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (typeof fiyat !== "number" || fiyat <= 0) {
      console.warn("Geçersiz fiyat değeri:", fiyat);
      return new Response(
        JSON.stringify({ mesaj: "Fiyat pozitif bir sayı olmalıdır." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const guncellenenHizmet = await prisma.hizmet.update({
      where: { id },
      data: { ad, fiyat },
    });

    return new Response(
      JSON.stringify({ mesaj: "Hizmet başarıyla güncellendi.", hizmet: guncellenenHizmet }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("PUT /api/admin/hizmetler Hatası:", error);
    return new Response(
      JSON.stringify({ mesaj: "Hizmet güncellenirken bir hata oluştu.", hata: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function POST(req) {
  try {
    const { ad, fiyat } = await req.json();

    if (!ad || fiyat === undefined) {
      return new Response(
        JSON.stringify({ mesaj: "Tüm alanlar gereklidir." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (typeof fiyat !== "number" || fiyat <= 0) {
      console.warn("Geçersiz fiyat değeri:", fiyat);
      return new Response(
        JSON.stringify({ mesaj: "Fiyat pozitif bir sayı olmalıdır." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const yeniHizmet = await prisma.hizmet.create({
      data: { ad, fiyat },
    });

    return new Response(JSON.stringify(yeniHizmet), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST /api/admin/hizmetler Hatası:", error);
    return new Response(
      JSON.stringify({ mesaj: "Hizmet eklenirken bir hata oluştu.", hata: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      console.warn("Eksik id alanı:", { id });
      return new Response(
        JSON.stringify({ mesaj: "Silme işlemi için id gereklidir." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    await prisma.hizmet.delete({
      where: { id },
    });

    return new Response(
      JSON.stringify({ mesaj: "Hizmet başarıyla silindi." }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("DELETE /api/admin/hizmetler Hatası:", error);
    return new Response(
      JSON.stringify({ mesaj: "Hizmet silinirken bir hata oluştu.", hata: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
