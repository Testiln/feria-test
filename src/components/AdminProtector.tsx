'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Componente protector para rutas admin
 * Se usa en pages que necesitan autenticación
 */
export function AdminProtector() {
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticación
    const isAuthenticated = localStorage.getItem('adminAuth')
    if (!isAuthenticated) {
      // Redireccionar al login
      router.replace('/admin/login')
    }
  }, [router])

  return null // No renderiza nada
}
