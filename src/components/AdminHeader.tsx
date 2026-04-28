'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/UI'

export function AdminHeader() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Verificar autenticación después de hidratación
  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('adminAuth'))
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch (error) {
      console.error('Error cerrando sesión:', error)
    } finally {
      // Siempre limpiar localStorage
      localStorage.removeItem('adminAuth')
      router.push('/admin/login')
    }
  }

  // Si no está autenticado, no renderizar (pero idealmente el layout lo evitaría)
  if (!isAuthenticated) {
    return null
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-lg">
              ⚙️
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white hidden sm:block">
              Admin
            </h1>
          </Link>

          <div className="hidden md:flex gap-1">
            <Link
              href="/admin"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/orders"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              Órdenes
            </Link>
            <Link
              href="/admin/inventory"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              Productos
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>
    </header>
  )
}
