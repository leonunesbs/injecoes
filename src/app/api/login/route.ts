import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { password } = await request.json();
  const secretPassword = process.env.SECRET_PASSWORD;

  if (password === secretPassword) {
    const cookieStore = cookies();
    cookieStore.set('auth', password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 dias em segundos
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias em milissegundos
      sameSite: 'strict',
      domain: 'antivegf.vercel.app',
    });
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false }, { status: 401 });
  }
}
