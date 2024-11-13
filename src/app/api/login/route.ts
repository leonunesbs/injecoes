import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { password } = await request.json();
  const secretPassword = process.env.SECRET_PASSWORD;

  if (password === secretPassword) {
    const response = NextResponse.json({ success: true });

    // Definir o cookie com `cookies.set()`
    response.cookies.set('auth', password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 dias em segundos
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias em milissegundos
      sameSite: 'none',
    });

    // Se precisar definir o cabeçalho Set-Cookie manualmente:
    const cookieHeader = `auth=${password}; HttpOnly; Secure; Path=/; Max-Age=604800; Expires=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()}; SameSite=None`;
    response.headers.set('Set-Cookie', cookieHeader);

    return response;
  } else {
    return NextResponse.json({ success: false }, { status: 401 });
  }
}
