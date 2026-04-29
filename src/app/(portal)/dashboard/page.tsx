'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { OrderCard } from '@/components/OrderCard'
import { Card, Button } from '@/components/UI'
import { Order, OrderItem } from '@/lib/types'

export default function UserDashboard() {
  const [orders, setOrders] = useState<(Order & { items?: OrderItem[] })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders')
        if (!response.ok) {
          throw new Error('Error al cargar órdenes')
        }

        const data = await response.json()
        setOrders(data.orders || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 py-12">
        <p className="text-center text-gray-600">Cargando órdenes...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mis Órdenes</h1>
        <Button href="/products">Nueva Solicitud</Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-600 mb-4">No tienes ninguna orden aún</p>
          <Button href="/products">Crear Primera Solicitud</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
