import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if user is accessing a protected route
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                          request.nextUrl.pathname.startsWith('/certificates') ||
                          request.nextUrl.pathname.startsWith('/deceased') ||
                          request.nextUrl.pathname.startsWith('/documents') ||
                          request.nextUrl.pathname.startsWith('/users');

  // For now, allow all requests - authentication will be handled client-side
  // In production, you'd check for a session cookie or JWT token here
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/certificates/:path*', '/deceased/:path*', '/documents/:path*', '/users/:path*'],
};
