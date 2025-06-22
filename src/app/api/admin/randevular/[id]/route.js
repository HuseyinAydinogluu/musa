import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'gizli-anahtar';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return new Response(JSON.stringify({ 
        mesaj: 'Randevu ID\'si belirtilmemiş'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Token kontrolü
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    
    if (!token) {
      return new Response(JSON.stringify({ 
        mesaj: 'Yetkilendirme hatası'
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Token doğrulama
    let decoded;
    try {
      decoded = jwt.verify(token.value, JWT_SECRET);
    } catch (error) {
      return new Response(JSON.stringify({ 
        mesaj: 'Geçersiz token'
      }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Randevuyu getir
    const randevu = await prisma.randevu.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        user: true
      }
    });

    if (!randevu) {
      return new Response(JSON.stringify({ 
        mesaj: 'Randevu bulunamadı'
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return NextResponse.json(randevu);
  } catch (error) {
    console.error('API hatası:', error);
    return new Response(JSON.stringify({ 
      mesaj: 'Bir hata oluştu'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const veri = await request.json();
    
    if (!id) {
      return new Response(JSON.stringify({ 
        mesaj: 'Randevu ID\'si belirtilmemiş'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Token kontrolü
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    
    if (!token) {
      return new Response(JSON.stringify({ 
        mesaj: 'Yetkilendirme hatası'
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Token doğrulama
    let decoded;
    try {
      decoded = jwt.verify(token.value, JWT_SECRET);
    } catch (error) {
      return new Response(JSON.stringify({ 
        mesaj: 'Geçersiz token'
      }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Randevuyu güncelle
    const guncellenecekRandevu = await prisma.randevu.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!guncellenecekRandevu) {
      return new Response(JSON.stringify({ 
        mesaj: 'Güncellenecek randevu bulunamadı'
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const guncelRandevu = await prisma.randevu.update({
      where: {
        id: parseInt(id)
      },
      data: {
        tarih: veri.tarih || guncellenecekRandevu.tarih,
        durum: veri.durum || guncellenecekRandevu.durum,
        not: veri.not || guncellenecekRandevu.not
      }
    });

    return NextResponse.json(guncelRandevu);
  } catch (error) {
    console.error('API hatası:', error);
    return new Response(JSON.stringify({ 
      mesaj: 'Bir hata oluştu'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return new Response(JSON.stringify({ 
        mesaj: 'Randevu ID\'si belirtilmemiş'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Token kontrolü
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    
    if (!token) {
      return new Response(JSON.stringify({ 
        mesaj: 'Yetkilendirme hatası'
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Token doğrulama
    let decoded;
    try {
      decoded = jwt.verify(token.value, JWT_SECRET);
    } catch (error) {
      return new Response(JSON.stringify({ 
        mesaj: 'Geçersiz token'
      }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Randevuyu sil
    const silinecekRandevu = await prisma.randevu.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!silinecekRandevu) {
      return new Response(JSON.stringify({ 
        mesaj: 'Silinecek randevu bulunamadı'
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await prisma.randevu.delete({
      where: {
        id: parseInt(id)
      }
    });

    return new Response(JSON.stringify({ 
      mesaj: 'Randevu başarıyla silindi'
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('API hatası:', error);
    return new Response(JSON.stringify({ 
      mesaj: 'Bir hata oluştu'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
