import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas de autenticación (no accesibles si ya está autenticado)
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Obtener el token de las cookies
  const token = request.cookies.get('auth-token')?.value;
  const isAuthenticated = !!token;

  // Verificar si la ruta actual es de autenticación
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Si está autenticado y trata de acceder a rutas de autenticación
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Si está autenticado y accede a la ruta raíz, redirigir al dashboard
  if (isAuthenticated && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Si no está autenticado y accede a la ruta raíz, redirigir al login
  if (!isAuthenticated && pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
