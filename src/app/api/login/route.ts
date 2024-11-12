// src/app/api/login/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { password } = await request.json();
  const secretPassword = process.env.SECRET_PASSWORD;

  if (password === secretPassword) {
    const response = NextResponse.json({ success: true });

    // Define o cookie 'auth' com a senha e expiração de 7 dias
    response.cookies.set('auth', password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 dias em segundos
    });

    return response;
  } else {
    return NextResponse.json({ success: false }, { status: 401 });
  }
}
