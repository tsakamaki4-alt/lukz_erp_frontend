import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Define routes
  const protectedRoutes = ['/dashboard', '/users', '/formula'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  // LOGIC A: Unauthorized access to protected route
  if (isProtectedRoute && !token) {
    // nextUrl automatically respects the basePath config
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('from', pathname);
    loginUrl.searchParams.set('reason', 'unauthorized');
    return NextResponse.redirect(loginUrl);
  }

  // LOGIC B: Logged-in user trying to access Login/Signup
  if (isAuthPage && token) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Add an exclusion for static files and api routes to boost performance
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};