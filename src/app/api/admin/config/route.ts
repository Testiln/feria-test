import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('configuration')
      .select('*')

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Convertir a objeto para fácil acceso
    const config = data?.reduce(
      (acc, item) => {
        acc[item.key] = item.value
        return acc
      },
      {} as Record<string, string>
    )

    return NextResponse.json({ config }, { status: 200 })
  } catch (error) {
    console.error('Error obteniendo configuración:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // TODO: Validar que sea admin
    const body = await request.json()
    const { key, value } = body

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key y value son requeridos' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('configuration')
      .update({
        value: String(value),
        updated_at: new Date().toISOString(),
      })
      .eq('key', key)
      .select()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        message: 'Configuración actualizada',
        config: data[0],
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error actualizando configuración:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
