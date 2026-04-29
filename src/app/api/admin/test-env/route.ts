import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    debug: true,
    env: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ configurada' : '✗ FALTA',
      serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ configurada' : '✗ FALTA',
    },
    message: 'Verifica las variables de entorno en .env.local',
  })
}
