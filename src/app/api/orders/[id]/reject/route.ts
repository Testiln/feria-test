import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Validar que sea admin
    const { id } = await params
    const body = await request.json()
    const { notes } = body

    // Obtener la orden
    const { data: order, error: orderError } = await supabase
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

    if (orderError) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: 'Solo se pueden rechazar órdenes pendientes' },
        { status: 400 }
      )
    }

    // Actualizar orden a rechazada
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        notes: notes || 'Orden rechazada',
      })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // Liberar stock congelado (no se decrementa el stock real)
    for (const item of order.order_items) {
      const product = item.products
      const newReserved = Math.max(0, product.reserved_stock - item.quantity)

      await supabase
        .from('products')
        .update({
          reserved_stock: newReserved,
        })
        .eq('id', product.id)
    }

    return NextResponse.json(
      {
        message: 'Orden rechazada exitosamente',
        order: {
          id: order.id,
          status: 'rejected',
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error rechazando orden:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
