// src/app/api/logout/route.ts

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Obtém o gerenciador de cookies
  const cookieStore = cookies();

  cookieStore.delete({
    name: 'auth',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'none',
    domain: 'antivegf.vercel.app',
    maxAge: 0,
  });

  // Redireciona para a página de login
  const { origin } = new URL(request.url);
  const loginUrl = new URL('/login', origin);
  return NextResponse.redirect(loginUrl);
}
