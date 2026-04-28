import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Obtener la sesión del usuario
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'No hay sesión activa' },
        { status: 401 }
      )
    }

    // Obtener datos del usuario de la tabla users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (userError) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        user: userData,
        session: {
          access_token: session.access_token,
          expires_in: session.expires_in,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error obteniendo usuario actual:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
