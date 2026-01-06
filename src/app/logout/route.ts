import { NextResponse } from 'next/server'

const SESSION_COOKIE = {
  name: 'luxo-session',
  value: 'admin-auth',
}

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL('/login', request.url))
  response.cookies.set(SESSION_COOKIE.name, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  })
  return response
}

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/login', request.url))
  response.cookies.set(SESSION_COOKIE.name, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  })
  return response
}
