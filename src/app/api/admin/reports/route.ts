import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { validateAdminAuth, unauthorizedResponse } from '@/lib/admin'
import { convertToCSV, formatDate, getStatusLabel } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    // Validar que sea admin
    if (!(await validateAdminAuth(request))) {
      return unauthorizedResponse()
    }

    // Obtener todas las órdenes con sus detalles usando supabaseAdmin
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(
        `
        *,
        users(
          id,
          full_name,
          email,
          document_id
        ),
        order_items(
          *,
          products(
            id,
            name,
            code
          )
        )
      `
      )
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Query error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Preparar datos para CSV
    const headers = [
      'ID Solicitud',
      'Nombre Cliente',
      'Email',
      'Cédula',
      'Estado',
      'Total Items',
      'Productos',
      'Fecha Creación',
      'Fecha Aprobación',
      'Fecha Rechazo',
    ]

    const rows = orders!.map((order: any) => {
      const productNames = order.order_items
        .map((item: any) => `${item.products?.name || 'Producto'} (${item.quantity})`)
        .join('; ')

      return [
        order.id,
        order.users?.full_name || 'N/A',
        order.users?.email || 'N/A',
        order.users?.document_id || 'N/A',
        getStatusLabel(order.status),
        order.total_items,
        productNames || 'N/A',
        formatDate(order.created_at),
        order.approved_at ? formatDate(order.approved_at) : '-',
        order.rejected_at ? formatDate(order.rejected_at) : '-',
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')

    // Retornar como archivo descargable
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="reporte-ordenes-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error generando reporte:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
