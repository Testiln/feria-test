'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { OrderCard } from '@/components/OrderCard'
import { AdminProtector } from '@/components/AdminProtector'
import { Card, Button } from '@/components/UI'
import { Order, OrderItem, User } from '@/lib/types'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<(Order & { user?: User; items?: OrderItem[] })[]>([])
  const [filteredOrders, setFilteredOrders] = useState<(Order & { user?: User; items?: OrderItem[] })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('pending')
  const [processLoading, setProcessLoading] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/admin/orders?status=${status}`)
        if (!response.ok) {
          throw new Error('Error al cargar órdenes')
        }

        const data = await response.json()
        // Mapear order_items a items para que OrderCard lo encuentre
        const mappedOrders = data.orders?.map((order: any) => ({
          ...order,
          items: order.order_items || [],
        })) || []
        setOrders(mappedOrders)
        setFilteredOrders(mappedOrders)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [status])

  const handleApprove = async (orderId: string) => {
    setProcessLoading(orderId)
    setError(null)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: `Aprobada por el administrador el ${new Date().toLocaleString()}`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al aprobar la orden')
      }

      // Actualizar lista removiendo la orden
      setOrders((prev) => prev.filter((o) => o.id !== orderId))
      setFilteredOrders((prev) => prev.filter((o) => o.id !== orderId))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      console.error('Error aprobando orden:', err)
    } finally {
      setProcessLoading(null)
    }
  }

  const handleApproveWithComment = async (orderId: string, comment: string) => {
    setProcessLoading(orderId)
    setError(null)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: comment || `Aprobada por el administrador el ${new Date().toLocaleString()}`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al aprobar la orden')
      }

      // Actualizar lista removiendo la orden
      setOrders((prev) => prev.filter((o) => o.id !== orderId))
      setFilteredOrders((prev) => prev.filter((o) => o.id !== orderId))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      console.error('Error aprobando orden:', err)
    } finally {
      setProcessLoading(null)
    }
  }

  const handleReject = async (orderId: string) => {
    setProcessLoading(orderId)
    setError(null)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: `Rechazada por el administrador el ${new Date().toLocaleString()}`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al rechazar la orden')
      }

      // Actualizar lista removiendo la orden
      setOrders((prev) => prev.filter((o) => o.id !== orderId))
      setFilteredOrders((prev) => prev.filter((o) => o.id !== orderId))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      console.error('Error rechazando orden:', err)
    } finally {
      setProcessLoading(null)
    }
  }

  const handleRejectWithComment = async (orderId: string, comment: string) => {
    setProcessLoading(orderId)
    setError(null)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: comment || `Rechazada por el administrador el ${new Date().toLocaleString()}`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al rechazar la orden')
      }

      // Actualizar lista removiendo la orden
      setOrders((prev) => prev.filter((o) => o.id !== orderId))
      setFilteredOrders((prev) => prev.filter((o) => o.id !== orderId))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      console.error('Error rechazando orden:', err)
    } finally {
      setProcessLoading(null)
    }
  }

  return (
    <div className="container mx-auto max-w-6xl p-4 py-8">
      <AdminProtector />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Órdenes</h1>
        <Button href="/admin" variant="secondary">Volver al Panel</Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="mb-6 flex gap-2">
        {['pending', 'approved', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s)
              setIsLoading(true)
            }}
            className={`px-4 py-2 rounded font-semibold transition ${
              status === s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {s === 'pending' && '⏳ Pendientes'}
            {s === 'approved' && '✓ Aprobadas'}
            {s === 'rejected' && '✕ Rechazadas'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Card className="text-center py-12">
          <p className="text-gray-600">Cargando órdenes...</p>
        </Card>
      ) : filteredOrders.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-600">No hay órdenes en este estado</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onApprove={() => handleApprove(order.id)}
              onReject={() => handleReject(order.id)}
              onApproveWithComment={(comment) => handleApproveWithComment(order.id, comment)}
              onRejectWithComment={(comment) => handleRejectWithComment(order.id, comment)}
              isLoading={processLoading === order.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
