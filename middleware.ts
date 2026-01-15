import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Define Public Paths (Routes that DO NOT need a token)
  const isPublicPath = pathname === '/login' || pathname === '/signup' || pathname === '/';

  // 2. LOGGING (Check your terminal!)
  console.log(`MW: ${pathname} | Auth: ${!!token}`);

  // 3. PROTECTION LOGIC
  // If the user is NOT on a public path and has NO token, kick them to login
  if (!isPublicPath && !token) {
    const loginUrl = new URL('/lukz_erp_frontend/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. PREVENT BACK-TRACKING
  // If user is ALREADY logged in, don't let them see the login page
  if (isPublicPath && token && pathname !== '/') {
    return NextResponse.redirect(new URL('/lukz_erp_frontend/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths except for:
   * 1. api (API routes)
   * 2. _next/static (static files)
   * 3. _next/image (image optimization files)
   * 4. favicon.ico (favicon file)
   */
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};