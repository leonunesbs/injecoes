// src/app/api/logout/route.ts

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Obtém o gerenciador de cookies
  const cookieStore = cookies();

  // Remove o cookie 'auth' definindo-o com uma data de expiração no passado
  cookieStore.set('auth', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0), // Expira o cookie imediatamente
  });

  // Redireciona para a página de login
  const { origin } = new URL(request.url);
  const loginUrl = new URL('/login', origin);
  return NextResponse.redirect(loginUrl);
}
