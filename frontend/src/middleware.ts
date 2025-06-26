import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes qui nécessitent une authentification
const protectedRoutes = [
  '/dashboard',
  '/inventory',
  '/manage',
  '/settings',
  '/favourites',
  '/consumables',
]

// Routes accessibles uniquement aux utilisateurs non authentifiés
const authRoutes = [
  '/login',
  '/register',
  '/sign-in',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Récupérer le token depuis les cookies ou headers
  const token = request.cookies.get('access_token')?.value
  
  // Vérifier si la route nécessite une authentification
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Vérifier si c'est une route d'authentification
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Si c'est une route protégée et qu'il n'y a pas de token
  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }
  
  // Si l'utilisateur est authentifié et essaie d'accéder aux routes d'auth
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Rediriger la racine vers le dashboard si authentifié, sinon vers login
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|app-ico.svg).*)',
  ],
}
