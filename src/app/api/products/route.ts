import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const limit = searchParams.get('limit') || '50'

    // Usar supabaseAdmin para bypass de RLS
    let query = supabaseAdmin
      .from('products')
      .select('*')
      .order('name', { ascending: true })
      .limit(parseInt(limit))

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,code.ilike.%${search}%`
      )
    }

    const { data, error } = await query

    if (error) {
      console.error('Products GET error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ products: data }, { status: 200 })
  } catch (error) {
    console.error('Error obteniendo productos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validar que sea admin (por ahora, sin implementación de roles)
    const body = await request.json()
    const { code, name, ecommerce_url, image_url, stock } = body

    if (!code || !name || !stock) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          code,
          name,
          ecommerce_url: ecommerce_url || null,
          image_url: image_url || null,
          stock: parseInt(stock),
          reserved_stock: 0,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ product: data[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creando producto:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
