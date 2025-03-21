import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { parse, serialize } from 'cookie';

export async function middleware(request: NextRequest) {
  const isAuthenticated = await checkAuthentication(request);

  if (
    !isAuthenticated &&
    request.nextUrl.pathname !== '/' &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return NextResponse.next();
}

async function checkAuthentication(request: NextRequest) {
  const cookies = parse(request.headers.get('cookie') || '');
  const sessionToken = cookies['connect.sid'];

  // console.log('Session Token:', sessionToken);

  // log all content of the cookie object
  // console.log('Cookies:', cookies);

  if (!sessionToken) {
    return false;
  }

  return true;

//   const userId = await verifySessionToken(sessionToken);
//   return userId !== null;
}

export const config = {
  matcher: ['/dashboard', '/create', '/edit'],
};

// @ts-expect-error req unused
export default function handler(req, res) {
  const cookie = serialize('connect.sid', '', {
    maxAge: -1,
    path: '/',
    httpOnly: true, // Ensure the cookie is HTTP only
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
  });

  res.setHeader('Set-Cookie', cookie);
  res.status(200).json({ message: 'Logged out' });
} 