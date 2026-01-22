import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * In Next.js 16+, the exported function name must be 'proxy'
 * when using the proxy.ts file convention.

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isPublicPath = pathname === '/login' || pathname === '/signup' || pathname === '/';

  console.log(`MW: ${pathname} | Auth: ${!!token}`);

  if (!isPublicPath && !token) {
    const loginUrl = new URL('/lukz_erp_frontend/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicPath && token && pathname !== '/') {
    return NextResponse.redirect(new URL('/lukz_erp_frontend/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {

  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

 */

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Define Public Paths
  const isPublicPath = pathname === '/login' || pathname === '/signup' || pathname === '/';

  // 2. PROTECTION LOGIC
  // If not public and no token -> redirect to login
  if (!isPublicPath && !token) {
    // Note: REMOVED /lukz_erp_frontend/ prefix for root hosting
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. PREVENT BACK-TRACKING
  if (isPublicPath && token && pathname !== '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};