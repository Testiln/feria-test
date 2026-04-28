import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { validateAdminAuth, unauthorizedResponse } from '@/lib/admin'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validar que sea admin
    if (!validateAdminAuth(request)) {
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
        { error: 'Solo se pueden aprobar órdenes pendientes' },
        { status: 400 }
      )
    }

    // Actualizar orden a aprobada
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        notes: notes || null,
      })
      .eq('id', id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // Decrementar stock de los productos
    for (const item of order.order_items) {
      const product = item.products

      const newStock = Math.max(0, product.stock - item.quantity)
      const newReserved = Math.max(0, product.reserved_stock - item.quantity)

      const { error: stockError } = await supabaseAdmin
        .from('products')
        .update({
          stock: newStock,
          reserved_stock: newReserved,
        })
        .eq('id', product.id)

      if (stockError) {
        console.error('Stock update error:', stockError)
      }
    }

    return NextResponse.json(
      {
        message: 'Orden aprobada exitosamente',
        order: {
          id: order.id,
          status: 'approved',
          user_name: order.users?.full_name,
          user_document: order.users?.document_id,
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
