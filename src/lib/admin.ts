import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Crear cliente de Supabase con service role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

/**
 * Valida que la solicitud sea de un admin válido
 * Verifica la cookie de autenticación de admin contra la base de datos
 */
export async function validateAdminAuth(request: NextRequest): Promise<boolean> {
  try {
    const token = request.cookies.get('admin-token')?.value
    if (!token) return false

    // Decodificar el token (userId:username en base64)
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const [userId] = decoded.split(':')

      if (!userId) return false

      // Verificar que el usuario existe y está activo en la base de datos
      const { data: adminUser, error } = await supabaseAdmin
        .from('admin_users')
        .select('id, isactive')
        .eq('id', userId)
        .single()

      if (error || !adminUser) {
        console.log('[Auth] Admin user not found:', userId)
        return false
      }

      if (adminUser.isactive === false) {
        console.log('[Auth] Admin user is inactive:', userId)
        return false
      }

      return true
    } catch (e) {
      console.log('[Auth] Token decode error:', e)
      return false
    }
  } catch (error) {
    console.log('[Auth] Validation error:', error)
    return false
  }
}

/**
 * Retorna una respuesta no autorizada estándar
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'No autorizado. Se requiere autenticación de admin' },
    { status: 401 }
  )
}
