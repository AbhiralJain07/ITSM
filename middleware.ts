import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/admin', '/agent', '/user', '/dashboard', '/kb', '/profile'];
const publicRoutes = ['/login', '/signup', '/'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  const sessionCookie = req.cookies.get('itsm_session')?.value;
  let session = null;
  
  if (sessionCookie) {
    try {
      session = JSON.parse(sessionCookie);
    } catch (e) {
      session = null;
    }
  }

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // Redirect to respective dashboard if logged in and accessing login page
  if (isPublicRoute && session && path === '/login') {
    const role = session.role;
    return NextResponse.redirect(new URL(`/${role}`, req.nextUrl));
  }

  // Role-based authorization
  if (path.startsWith('/admin') && session?.role !== 'admin') {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }
  
  if (path.startsWith('/user') && session?.role !== 'user') {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }
  
  if (path.startsWith('/agent') && !['agent', 'admin'].includes(session?.role)) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
