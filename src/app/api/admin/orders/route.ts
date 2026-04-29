import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { validateAdminAuth, unauthorizedResponse } from '@/lib/admin'

export async function GET(request: NextRequest) {
  try {
    // Validar que sea admin
    if (!(await validateAdminAuth(request))) {
      return unauthorizedResponse()
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const limit = searchParams.get('limit') || '50'
    const offset = searchParams.get('offset') || '0'

    let query = supabaseAdmin
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
            code,
            stock,
            reserved_stock,
            price
          )
        )
      `,
        { count: 'exact' }
      )

    if (status) {
      query = query.eq('status', status)
    }

    query = query
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        orders: data,
        pagination: {
          total: count,
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error obteniendo órdenes admin:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
