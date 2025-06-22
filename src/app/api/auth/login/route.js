import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { email, sifre } = await request.json();
    
    if (!email || !sifre) {
      return NextResponse.json(
        { mesaj: 'Email ve şifre gereklidir.' },
        { status: 400 }
      );
    }

    const kullanici = await prisma.user.findUnique({ where: { email } });
    if (!kullanici) {
      return NextResponse.json(
        { mesaj: 'Geçersiz email veya şifre.' },
        { status: 401 }
      );
    }

    const sifreDogruMu = await bcrypt.compare(sifre, kullanici.sifre);
    if (!sifreDogruMu) {
      return NextResponse.json(
        { mesaj: 'Geçersiz email veya şifre.' },
        { status: 401 }
      );
    }

    // JWT token oluştur
    const token = jwt.sign(
      { 
        id: kullanici.id,
        email: kullanici.email,
        rol: kullanici.rol
      },
      process.env.JWT_SECRET || 'gizli-anahtar',
      { expiresIn: '1d' }
    );

    // Oturum bilgisini hazırla
    const oturumBilgisi = {
      id: kullanici.id,
      ad: kullanici.ad,
      email: kullanici.email,
      rol: kullanici.rol,
      token: token
    };

    // Cookie'yi ayarla
    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 gün
    });

    return NextResponse.json({
      mesaj: 'Giriş başarılı',
      kullanici: oturumBilgisi
    }, { 
      status: 200
    });

  } catch (error) {
    console.error('Login hatası:', error);
    return NextResponse.json(
      { mesaj: 'Bir hata oluştu', hata: error.message },
      { status: 500 }
    );
  }
}
