import { NextRequest, NextResponse } from 'next/server'
import { validateAdminAuth } from '@/lib/admin'

export async function GET(request: NextRequest) {
  try {
    // Validar autenticación contra base de datos
    const isAuthenticated = await validateAdminAuth(request)

    if (!isAuthenticated) {
      return NextResponse.json(
        { isAdmin: false, message: 'No autenticado' },
        { status: 401 }
      )
    }

    // Obtener información del usuario desde el token
    const token = request.cookies.get('admin-token')?.value
    if (token) {
      try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8')
        const [userId, username] = decoded.split(':')

        return NextResponse.json(
          {
            success: true,
            isAdmin: true,
            user: {
              id: userId,
              usuario: username,
            },
          },
          { status: 200 }
        )
      } catch (err) {
        console.error('Error decodificando token:', err)
      }
    }

    return NextResponse.json(
      { isAdmin: false, message: 'Token inválido' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Error en /api/admin/me:', error)
    return NextResponse.json(
      { isAdmin: false, message: 'Error del servidor' },
      { status: 500 }
    )
  }
}
