import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    // Verificar si el usuario es admin
    const checkAdminStatus = async () => {
      try {
        // Primero verificar localStorage
        const adminToken = localStorage.getItem('adminAuth')
        if (adminToken) {
          setIsAdmin(true)
          setIsLoading(false)
          return
        }

        // Si no está en localStorage, verificar con el servidor
        const response = await fetch('/api/admin/me')
        if (response.ok) {
          const data = await response.json()
          if (data.isAdmin) {
            localStorage.setItem('adminAuth', 'true')
            setIsAdmin(true)
          }
        } else {
          localStorage.removeItem('adminAuth')
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [pathname])

  return { isAdmin, isLoading }
}
