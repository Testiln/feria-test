import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Obtener orden con sus items
    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        order_items(
          *,
          products:product_id(*)
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que la orden pertenece al usuario
    if (data.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para ver esta orden' },
        { status: 403 }
      )
    }

    return NextResponse.json({ order: data }, { status: 200 })
  } catch (error) {
    console.error('Error obteniendo orden:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
