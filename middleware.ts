import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Extract the token from the cookies
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 2. Define all paths that require a login
  // We use .some() to check if the current path starts with any of these strings
  const protectedRoutes = ['/dashboard', '/users', '/formula'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  
  // 3. Define paths for unauthenticated users
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  // LOGIC A: If trying to access a protected route without a token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    // Optional: add a redirect parameter so they return to /formula after login
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // LOGIC B: If already logged in, redirect away from Login/Signup to Dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

// 4. Matcher Configuration
// This ensures the middleware runs for these specific routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login', 
    '/users/:path*',
    '/signup',
    '/formula/:path*',
  ],
};