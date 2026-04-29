import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  // Rutas públicas dentro de /admin (login, logout, config no requieren token)
  const publicPaths = ['/admin/login', '/api/admin/login', '/api/admin/logout', '/api/admin/config', '/api/admin/me']

  const pathname = request.nextUrl.pathname

  // Permitir acceso a rutas públicas
  if (publicPaths.some(path => pathname.startsWith(path))) {
    // Si ya está autenticado y intenta acceder a login, redirigir al dashboard
    if (pathname === '/admin/login' || pathname === '/admin/login/') {
      const adminToken = request.cookies.get('admin-token')?.value
      if (adminToken) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    }
    return NextResponse.next()
  }

  // Verificar si es una ruta admin protegida
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      // Redirigir a login
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Validar que el token sea válido (debe ser base64 decodificable)
    try {
      Buffer.from(token, 'base64').toString('utf-8')
      return NextResponse.next()
    } catch {
      // Token inválido, redirigir a login
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
}
