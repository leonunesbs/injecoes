// src/app/api/logout/route.ts

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Construct the absolute URL for redirection
  const { origin } = new URL(request.url);
  const loginUrl = new URL('/login', origin);

  // Create the response with redirection
  const response = NextResponse.redirect(loginUrl);

  // Set the 'auth' cookie to expire immediately
  response.cookies.set('auth', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0), // Expire the cookie immediately
  });

  return response;
}
