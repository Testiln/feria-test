import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  // Rutas que requieren autenticación
  const protectedPaths = ['/admin', '/api/admin']
  
  // Rutas públicas dentro de /admin (login, logout, config no requieren token)
  const publicPaths = ['/admin/login', '/api/admin/login', '/api/admin/logout', '/api/admin/config']

  const pathname = request.nextUrl.pathname

  // Permitir acceso a rutas públicas
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Verificar si es una ruta protegida
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      // Redirigir a login
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Validar token (verificar que sea base64 válido y tenga el formato correcto)
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      if (decoded === 'admin:admin') {
        return NextResponse.next()
      }
    } catch {
      // Token inválido
    }

    // Token inválido, redirigir a login
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
}
