'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Componente protector para rutas admin
 * El middleware maneja la redirección, pero esto valida en el cliente también
 */
export function AdminProtector({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isVerified, setIsVerified] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/me', {
          method: 'GET',
          credentials: 'include',
        })

        if (response.ok) {
          setIsVerified(true)
        } else {
          router.replace('/admin/login')
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error)
        router.replace('/admin/login')
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [router])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Verificando autenticación...</p>
      </div>
    )
  }

  return isVerified ? <>{children}</> : null
}
