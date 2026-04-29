'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminHeader } from '@/components/AdminHeader'
import { AdminProtector } from '@/components/AdminProtector'
import { MetricsDisplay } from '@/components/MetricsDisplay'
import { Card, Button } from '@/components/UI'
import { DashboardMetrics } from '@/lib/types'

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (!response.ok) {
          throw new Error('Error al cargar estadísticas')
        }

        const data = await response.json()
        setMetrics(data.metrics)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  return (
    <AdminProtector>
      <AdminHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto max-w-7xl p-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Panel de Administración</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Gestiona productos, órdenes y reportes</p>
            <div className="flex gap-4 flex-wrap">
              <Button href="/admin/orders" variant="primary">📋 Ver Órdenes</Button>
              <Button href="/admin/inventory" variant="primary">📦 Inventario</Button>
              <Button href="/admin/reports" variant="primary">📊 Reportes</Button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300 font-medium">⚠️ {error}</p>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Métricas Principales</h2>
          {metrics ? (
            <MetricsDisplay metrics={metrics} />
          ) : (
            <MetricsDisplay metrics={{} as DashboardMetrics} isLoading={isLoading} />
          )}
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Acciones Rápidas</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/admin/orders?status=pending" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
                    → Ver órdenes pendientes
                  </Link>
                </li>
                <li>
                  <Link href="/admin/reports" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
                    → Descargar reporte CSV
                  </Link>
                </li>
                <li>
                  <Link href="/admin/inventory" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
                    → Gestionar productos
                  </Link>
                </li>
              </ul>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Este dashboard te permite gestionar todas las solicitudes de productos,
                revisar el inventario y generar reportes de actividad.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </AdminProtector>
  )
}
