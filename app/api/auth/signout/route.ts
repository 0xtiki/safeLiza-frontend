import { serialize } from 'cookie';

export async function POST() {
  const cookie = serialize('connect.sid', '', {
    maxAge: -1,
    path: '/',
  });

  // call backend to signout
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return new Response(JSON.stringify({ message: 'Sign-out failed' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  return new Response(JSON.stringify({ message: 'Sign-out successful' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookie,
    },
  });
} 