'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

// Rutas donde NO debe mostrar este Header
const ADMIN_ROUTES = ['/admin', '/admin/login', '/admin/orders', '/admin/inventory', '/admin/reports']

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [shouldShow, setShouldShow] = useState(true)

  // Verificar después de hidratación si debe mostrarse
  useEffect(() => {
    const currentPath = window.location.pathname
    const isAdminLoggedIn = localStorage.getItem('adminAuth')
    const isAdminRoute = ADMIN_ROUTES.some(route => currentPath.startsWith(route))
    
    setShouldShow(!(isAdminRoute && isAdminLoggedIn))
  }, [])

  // Renderizar el header normalmente durante SSR/hidratación, ocultar después si es necesario
  if (!shouldShow) {
    return null
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-lg">
              📦
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white hidden sm:block">
              Feria
            </h1>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex gap-1">
            <Link
              href="/"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/products"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              Catálogo
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="h-6 w-6 text-gray-700 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            <Link
              href="/"
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/products"
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              Catálogo
            </Link>
            <Link
              href="/admin"
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              Admin
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}
