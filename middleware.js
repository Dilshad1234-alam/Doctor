import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value || request.cookies.get('auth_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;
  const { pathname } = request.nextUrl;

  // 1. Admin Routes Guard
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login' || pathname === '/admin/register') {
      return NextResponse.next();
    }
    if (!token || userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 2. Prevent Admin from accessing Doctor onboarding
  if (pathname.startsWith('/dashboard') && userRole === 'ADMIN') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
