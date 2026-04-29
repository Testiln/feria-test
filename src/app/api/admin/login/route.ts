import { NextRequest, NextResponse } from 'next/server'
import bcryptjs from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

// Crear cliente de Supabase con service role para leer admin_users
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    // Validar que sea JSON válido
    let body
    try {
      body = await request.json()
      console.log(`Body ${body.password}`)
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

    // Buscar el usuario admin en la base de datos
    const { data: adminUser, error: dbError } = await supabaseAdmin
      .from('admin_users')
      .select('id, nombre, usuario, pwd, isactive')
      .eq('usuario', username)
      .single()

    console.log('[Login] DB Query Result:', { adminUser, error: dbError })

    if (dbError || !adminUser) {
      console.log(`[Login] User not found: ${username}, DB Error:`, dbError?.message)
      return NextResponse.json(
        { success: false, message: 'Credenciales inválidas', debug: { dbError: dbError?.message } },
        { status: 401 }
      )
    }

    // Verificar que el usuario esté activo (undefined o true = activo)
    if (adminUser.isactive === false) {
      console.log(`[Login] User inactive: ${username}`)
      return NextResponse.json(
        { success: false, message: 'Usuario inactivo' },
        { status: 401 }
      )
    }

    // Comparar contraseñas con bcrypt
    const passwordMatch = await bcryptjs.compare(password, adminUser.pwd)

    if (!passwordMatch) {
      console.log(`[Login] Invalid password for user: ${username}`)
      return NextResponse.json(
        { success: false, message: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    console.log(`[Login] Success for user: ${username}`)

    // Crear token simple con el ID del usuario (en producción usar JWT)
    const token = Buffer.from(`${adminUser.id}:${adminUser.usuario}`).toString('base64')

    const response = NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: adminUser.id,
          nombre: adminUser.nombre,
          usuario: adminUser.usuario,
        },
        message: 'Autenticación exitosa',
      },
      { status: 200 }
    )

    // Establecer cookie segura
    response.cookies.set({
      name: 'admin-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[Login] Server error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
