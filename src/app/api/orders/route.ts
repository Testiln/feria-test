import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Obtener sesión del usuario
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Obtener órdenes del usuario
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
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ orders: data }, { status: 200 })
  } catch (error) {
    console.error('Error obteniendo órdenes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, approval_document_url, user_data } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items inválidos' },
        { status: 400 }
      )
    }

    if (!approval_document_url) {
      return NextResponse.json(
        { error: 'Se requiere documento de aprobación' },
        { status: 400 }
      )
    }

    if (!user_data || !user_data.full_name || !user_data.email) {
      return NextResponse.json(
        { error: 'Se requieren datos del usuario' },
        { status: 400 }
      )
    }

    // Verificar stock disponible para todos los items
    const productIds = items.map((item) => item.product_id)
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('*')
      .in('id', productIds)

    if (productsError) {
      return NextResponse.json(
        { error: productsError.message },
        { status: 500 }
      )
    }

    // Validar stock
    for (const item of items) {
      const product = products?.find((p) => p.id === item.product_id)
      if (!product) {
        return NextResponse.json(
          { error: `Producto ${item.product_id} no encontrado` },
          { status: 404 }
        )
      }

      const availableStock = product.stock - product.reserved_stock
      if (availableStock < item.quantity) {
        return NextResponse.json(
          {
            error: `Stock insuficiente para ${product.name}. Disponible: ${availableStock}`,
          },
          { status: 400 }
        )
      }
    }

    // Crear orden sin user_id (ya que no hay registro previo)
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          user_id: null, // No hay usuario autenticado
          status: 'pending',
          approval_document_url,
          total_items: totalItems,
          full_name: user_data.full_name,
          document_id: user_data.document_id || null,
          email: user_data.email,
          phone: user_data.phone || null,
          position: user_data.position || null,
        },
      ])
      .select()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json(
        { error: orderError.message },
        { status: 500 }
      )
    }

    const order = orderData[0]

    // Crear items de la orden
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
    }))

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      // Eliminar orden si falla la inserción de items
      await supabaseAdmin.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { error: itemsError.message },
        { status: 500 }
      )
    }

    // Congelar stock
    for (const item of items) {
      const product = products?.find((p) => p.id === item.product_id)
      if (product) {
        await supabaseAdmin
          .from('products')
          .update({
            reserved_stock: product.reserved_stock + item.quantity,
          })
          .eq('id', product.id)
      }
    }

    return NextResponse.json(
      {
        message: 'Orden creada exitosamente',
        order: {
          id: order.id,
          status: order.status,
          total_items: order.total_items,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creando orden:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
