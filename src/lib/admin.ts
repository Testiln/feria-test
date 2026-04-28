import { NextRequest, NextResponse } from 'next/server'

/**
 * Valida que la solicitud sea de un admin válido
 * Verifica la cookie de autenticación de admin
 */
export function validateAdminAuth(request: NextRequest): boolean {
  try {
    const token = request.cookies.get('admin-token')?.value
    if (!token) return false

    // Validar que el token sea válido (base64 codificado)
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const [username, password] = decoded.split(':')
      
      // Validar credenciales de admin
      return username === 'admin' && password === 'admin'
    } catch {
      return false
    }
  } catch {
    return false
  }
}

/**
 * Retorna una respuesta no autorizada estándar
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'No autorizado. Se requiere autenticación de admin' },
    { status: 401 }
  )
}
