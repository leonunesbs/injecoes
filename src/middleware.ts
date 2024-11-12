// middleware.ts

import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth')?.value;

  // Se o usuário não estiver autenticado e tentar acessar páginas protegidas
  if (!authCookie && request.nextUrl.pathname === '/') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Se o usuário estiver autenticado e tentar acessar a página de login
  if (authCookie && request.nextUrl.pathname === '/login') {
    const dashboardUrl = new URL('/', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Permite que a requisição continue para outras rotas
  return NextResponse.next();
}

// Configuração do matcher para aplicar o middleware apenas em rotas específicas
export const config = {
  matcher: ['/', '/login'],
};
