import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // TODO: Validar que sea admin

    // Total de solicitudes
    const { count: totalRequests, error: totalError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })

    if (totalError) throw totalError

    // Solicitudes aprobadas
    const { count: approvedCount, error: approvedError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')

    if (approvedError) throw approvedError

    // Solicitudes rechazadas
    const { count: rejectedCount, error: rejectedError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected')

    if (rejectedError) throw rejectedError

    // Productos vendidos (aprobados)
    const { data: approvedOrders, error: approvedOrdersError } = await supabase
      .from('orders')
      .select('id')
      .eq('status', 'approved')

    let productsSold = 0
    if (!approvedOrdersError && approvedOrders) {
      for (const order of approvedOrders) {
        const { data: items } = await supabase
          .from('order_items')
          .select('quantity')
          .eq('order_id', order.id)

        if (items) {
          productsSold += items.reduce((sum, item) => sum + item.quantity, 0)
        }
      }
    }

    // Stock disponible
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('stock, reserved_stock')

    if (productsError) throw productsError

    const availableStock = products?.reduce((sum, p) => sum + (p.stock - p.reserved_stock), 0) || 0

    // Órdenes pendientes
    const { count: pendingCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    const approvedPercentage = totalRequests ? Math.round((approvedCount! / totalRequests) * 100) : 0
    const rejectedPercentage = totalRequests ? Math.round((rejectedCount! / totalRequests) * 100) : 0

    return NextResponse.json(
      {
        metrics: {
          total_requests: totalRequests,
          approved_percentage: approvedPercentage,
          rejected_percentage: rejectedPercentage,
          products_sold: productsSold,
          products_available: availableStock,
          pending_orders: pendingCount || 0,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
