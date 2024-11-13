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
      sameSite: 'none',
    });

    return response;
  } else {
    return NextResponse.json({ success: false }, { status: 401 });
  }
}
