import { NextRequest, NextResponse } from 'next/server'

// Credenciales temporales hardcodeadas
const ADMIN_USER = 'admin'
const ADMIN_PASS = 'admin'

export async function POST(request: NextRequest) {
  try {
    // Validar que sea JSON válido
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json(
        { success: false, message: 'Formato de solicitud inválido' },
        { status: 400 }
      )
    }

    const { username, password } = body

    console.log(`[Login] Attempt with username: ${username}`)

    // Validar que los campos estén presentes
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Validar credenciales
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      console.log('[Login] Success')
      
      // Crear token simple (en producción usar JWT)
      const token = Buffer.from(`${username}:${password}`).toString('base64')
      
      const response = NextResponse.json(
        { success: true, token, message: 'Autenticación exitosa' },
        { status: 200 }
      )

      // Establecer cookie segura
      response.cookies.set({
        name: 'admin-token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 horas
        path: '/',
      })

      return response
    } else {
      console.log('[Login] Failed - Invalid credentials')
      return NextResponse.json(
        { success: false, message: 'Credenciales inválidas' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('[Login] Server error:', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
