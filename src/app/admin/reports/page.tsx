'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, Button } from '@/components/UI'
import { AdminProtector } from '@/components/AdminProtector'

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownloadCSV = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/reports')
      if (!response.ok) {
        throw new Error('Error al generar reporte')
      }

      const csvContent = await response.text()
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute(
        'download',
        `reporte-ordenes-${new Date().toISOString().split('T')[0]}.csv`
      )
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminProtector>
      <div className="container mx-auto max-w-2xl p-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Reportes</h1>
          <Button href="/admin" variant="secondary">Volver al Panel</Button>
        </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <Card>
          <h3 className="text-lg font-bold mb-4">Exportar Datos</h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Reporte de Órdenes (CSV)</h4>
              <p className="text-sm text-gray-600 mb-4">
                Descarga un archivo CSV con todas las órdenes procesadas, incluyendo:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mb-4 ml-2">
                <li>ID de solicitud</li>
                <li>Información del cliente</li>
                <li>Productos solicitados</li>
                <li>Estado de la orden</li>
                <li>Fechas de creación y procesamiento</li>
              </ul>

              <Button
                onClick={handleDownloadCSV}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Generando...' : '📥 Descargar CSV'}
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold mb-4">Información de Reportes</h3>
          <p className="text-sm text-gray-600">
            Los reportes se generan en tiempo real con los datos actuales del sistema.
            Puedes descargar múltiples reportes para análisis históricos y auditoría.
          </p>
        </Card>
      </div>
      </div>
    </AdminProtector>
  )
}
