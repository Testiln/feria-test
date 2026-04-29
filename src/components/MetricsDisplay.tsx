'use client'

import { Card, Badge } from './UI'
import { DashboardMetrics } from '@/lib/types'
import { formatNumber } from '@/lib/utils'

interface MetricsDisplayProps {
  metrics: DashboardMetrics
  isLoading?: boolean
}

export function MetricsDisplay({ metrics, isLoading = false }: MetricsDisplayProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
        ))}
      </div>
    )
  }

  const metricCards = [
    {
      title: 'Total de Solicitudes',
      value: metrics.total_requests,
      bgColor: 'from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20',
      accentColor: 'text-blue-600 dark:text-blue-400',
      icon: '📋',
      badge: 'info',
    },
    {
      title: 'Solicitudes Aprobadas',
      value: `${metrics.approved_percentage}%`,
      bgColor: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/20',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
      icon: '✓',
      badge: 'success',
    },
    {
      title: 'Solicitudes Rechazadas',
      value: `${metrics.rejected_percentage}%`,
      bgColor: 'from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20',
      accentColor: 'text-red-600 dark:text-red-400',
      icon: '✕',
      badge: 'danger',
    },
    {
      title: 'Productos Vendidos',
      value: formatNumber(metrics.products_sold),
      bgColor: 'from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20',
      accentColor: 'text-purple-600 dark:text-purple-400',
      icon: '📦',
      badge: 'default',
    },
    {
      title: 'Productos Disponibles',
      value: formatNumber(metrics.products_available),
      bgColor: 'from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/20',
      accentColor: 'text-amber-600 dark:text-amber-400',
      icon: '📊',
      badge: 'info',
    },
    {
      title: 'Órdenes Pendientes',
      value: metrics.pending_orders,
      bgColor: 'from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/20',
      accentColor: 'text-yellow-600 dark:text-yellow-400',
      icon: '⏳',
      badge: metrics.pending_orders > 0 ? 'warning' : 'success',
      highlight: metrics.pending_orders > 0,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metricCards.map((metric, index) => (
        <Card
          key={index}
          className={`bg-gradient-to-br ${metric.bgColor} ${
            metric.highlight ? 'ring-2 ring-yellow-400 dark:ring-yellow-600' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                {metric.title}
              </p>
              <p className={`text-4xl font-bold ${metric.accentColor}`}>
                {metric.value}
              </p>
            </div>
            <div className={`text-4xl ${metric.accentColor} opacity-60`}>
              {metric.icon}
            </div>
          </div>
          {metric.highlight && (
            <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-700">
              <Badge variant={metric.badge as any} className="text-xs">
                Requiere atención
              </Badge>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
