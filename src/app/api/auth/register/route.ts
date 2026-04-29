import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { isValidEmail, isValidPhone, isValidDocumentId } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, full_name, document_id, position, phone } = body

    // Validaciones
    if (!email || !password || !full_name || !document_id) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    if (!isValidDocumentId(document_id)) {
      return NextResponse.json(
        { error: 'Cédula inválida' },
        { status: 400 }
      )
    }

    if (phone && !isValidPhone(phone)) {
      return NextResponse.json(
        { error: 'Teléfono inválido' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
        },
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'No se pudo crear el usuario' },
        { status: 500 }
      )
    }

    // Crear registro en tabla users usando admin para bypass RLS
    const { error: userError, data: userData } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id: authData.user.id,
          full_name,
          document_id,
          position: position || null,
          email,
          phone: phone || null,
        },
      ])
      .select()

    if (userError) {
      // Eliminar usuario de Auth si falla la creación en BD
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Error al crear el registro de usuario: ' + userError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Usuario registrado exitosamente',
        user: userData?.[0] || {
          id: authData.user.id,
          email: authData.user.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error en registro:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
