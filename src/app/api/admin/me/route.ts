import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Verificar si existe la cookie de autenticación
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      return NextResponse.json(
        { isAdmin: false, message: 'No autenticado' },
        { status: 401 }
      )
    }

    // Verificar que sea un token válido
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const [username, password] = decoded.split(':')

      // Validar credenciales
      if (username === 'admin' && password === 'admin') {
        return NextResponse.json(
          { isAdmin: true, username },
          { status: 200 }
        )
      }
    } catch (error) {
      console.error('Error decodificando token:', error)
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
