// src/middleware.ts

// import { NextResponse } from 'next/server';

// import type { NextRequest } from 'next/server';

// export function middleware(request: NextRequest) {
//   const cookiePassword = request.cookies.get('auth')?.value;
//   const secretPassword = process.env.SECRET_PASSWORD;

//   // Verifica se o cookie 'auth' existe, corresponde à senha secreta e não está expirado
//   if (!cookiePassword || cookiePassword !== secretPassword) {
//     // Redireciona para a página de login se o cookie estiver ausente ou inválido
//     return NextResponse.redirect(new URL('/login', request.url));
//   }

//   // Se o cookie estiver válido, permite o acesso à página solicitada
//   return NextResponse.next();
// }

// // Especifica as rotas que devem utilizar o middleware
// export const config = {
//   matcher: ['/'],
// };
