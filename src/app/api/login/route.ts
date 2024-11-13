// src/app/api/login/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { password } = await request.json();
  const secretPassword = process.env.SECRET_PASSWORD;

  if (password === secretPassword) {
    const response = NextResponse.json({ success: true });

    response.cookies.set('auth', password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 dias em segundos
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias em milissegundos
      sameSite: 'strict',
      domain: 'antivegf.vercel.app',
    });

    return response;
  } else {
    return NextResponse.json({ success: false }, { status: 401 });
  }
}
