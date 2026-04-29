import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcryptjs from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    // Verificar credenciales
    console.log('=== DEBUG LOGIN ===')
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Configurada' : '✗ Falta')
    console.log('Service Role:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Configurada' : '✗ Falta')

    // Obtener todos los usuarios admin
    const { data: adminUsers, error: fetchError } = await supabaseAdmin
      .from('admin_users')
      .select('id, nombre, usuario, isActive')

    if (fetchError) {
      console.error('Error fetching admin_users:', fetchError)
      return NextResponse.json(
        {
          error: 'Error al acceder a la tabla admin_users',
          details: fetchError.message,
        },
        { status: 500 }
      )
    }

    // Buscar el usuario admin específicamente
    const { data: adminUser, error: userError } = await supabaseAdmin
      .from('admin_users')
      .select('id, nombre, usuario, pwd, isActive')
      .eq('usuario', 'admin')
      .single()

    console.log('Admin user found:', adminUser ? 'Sí' : 'No')

    if (userError) {
      console.error('Error searching user:', userError)
    }

    if (adminUser) {
      // Probar bcrypt
      const testPassword = 'admin123'
      const match = await bcryptjs.compare(testPassword, adminUser.pwd)
      console.log(`bcrypt.compare('${testPassword}', hash):`, match)

      return NextResponse.json({
        debug: true,
        supabase: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configurada' : 'falta',
          serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configurada' : 'falta',
        },
        adminUsers: adminUsers,
        currentUser: {
          id: adminUser.id,
          nombre: adminUser.nombre,
          usuario: adminUser.usuario,
          isActive: adminUser.isActive,
          pwd: adminUser.pwd ? '(hash presente)' : '(sin hash)',
        },
        bcryptTest: {
          password: 'admin123',
          matches: match,
          hash: adminUser.pwd,
        },
      })
    } else {
      return NextResponse.json({
        debug: true,
        error: 'Usuario admin no encontrado',
        adminUsers: adminUsers,
      })
    }
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      {
        error: 'Error en debug',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
