import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { validateAdminAuth, unauthorizedResponse } from '@/lib/admin'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validar que sea admin
    if (!(await validateAdminAuth(request))) {
      return unauthorizedResponse()
    }

    const { id } = await params
    const body = await request.json()
    const { notes } = body

    // Obtener la orden con todos sus datos usando supabaseAdmin
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(
        `
        *,
        users(
          id,
          full_name,
          email,
          document_id,
          phone,
          position
        ),
        order_items(
          *,
          products(
            id,
            name,
            stock,
            reserved_stock
          )
        )
      `
      )
      .eq('id', id)
      .single()

    if (orderError || !order) {
      console.error('Order fetch error:', orderError)
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
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        notes: notes || 'Orden rechazada por el administrador',
      })
      .eq('id', id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // Liberar stock congelado (no se decrementa el stock real)
    for (const item of order.order_items) {
      const product = item.products
      const newReserved = Math.max(0, product.reserved_stock - item.quantity)

      const { error: stockError } = await supabaseAdmin
        .from('products')
        .update({
          reserved_stock: newReserved,
        })
        .eq('id', product.id)

      if (stockError) {
        console.error('Stock update error:', stockError)
      }
    }

    return NextResponse.json(
      {
        message: 'Orden rechazada exitosamente',
        order: {
          id: order.id,
          status: 'rejected',
          user_name: order.users?.full_name,
          user_document: order.users?.document_id,
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
