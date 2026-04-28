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
        { error: 'Solo se pueden aprobar órdenes pendientes' },
        { status: 400 }
      )
    }

    // Actualizar orden a aprobada
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        notes: notes || null,
      })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // Descongelar y decrementar stock
    for (const item of order.order_items) {
      const product = item.products

      // Decrementar stock
      const newStock = product.stock - item.quantity
      const newReserved = product.reserved_stock - item.quantity

      await supabase
        .from('products')
        .update({
          stock: newStock,
          reserved_stock: newReserved,
        })
        .eq('id', product.id)
    }

    return NextResponse.json(
      {
        message: 'Orden aprobada exitosamente',
        order: {
          id: order.id,
          status: 'approved',
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error aprobando orden:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
