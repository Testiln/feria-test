import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('📊 Running migration: adding price column to products...')

    // Execute migration
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        ALTER TABLE products ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 0;
        CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
        CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
      `,
    })

    if (error) {
      console.error('Migration error:', error)
      // Try alternative approach using direct SQL
      return NextResponse.json(
        {
          message:
            'Migration attempted. Please run this SQL in Supabase SQL Editor:\n\nALTER TABLE products ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 0;\nCREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);\nCREATE INDEX IF NOT EXISTS idx_products_code ON products(code);',
          error: error.message,
        },
        { status: 200 }
      )
    }

    console.log('✅ Migration completed successfully')
    return NextResponse.json(
      {
        message: 'Migration completed successfully',
        data,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      {
        error: 'Error running migration: ' + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    )
  }
}
