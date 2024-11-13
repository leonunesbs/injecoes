import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth')?.value;

  if (authCookie !== process.env.SECRET_PASSWORD) {
    // Remove o cookie 'auth' definindo-o com uma data de expiração no passado e redireciona para a página de login

    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);

    response.cookies.delete({
      name: 'auth',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    });
  }

  if (!authCookie && request.nextUrl.pathname === '/') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (authCookie && request.nextUrl.pathname === '/login') {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login'],
};
