'use client'

import { Card, Badge, Button } from './UI'
import { CartItem, Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

interface CartSummaryProps {
  items: CartItem[]
  products: Product[]
  maxItemsPerOrder: number
  onRemoveItem?: (productId: string) => void
  onUpdateQuantity?: (productId: string, quantity: number) => void
}

export function CartSummary({
  items,
  products,
  maxItemsPerOrder,
  onRemoveItem,
  onUpdateQuantity,
}: CartSummaryProps) {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
  const isFull = totalQuantity >= maxItemsPerOrder

  const getProductName = (productId: string) => {
    return products.find((p) => p.id === productId)?.name || 'Producto desconocido'
  }

  const getProductPrice = (productId: string) => {
    return products.find((p) => p.id === productId)?.price || 0
  }

  const totalPrice = items.reduce((sum, item) => {
    return sum + item.quantity * getProductPrice(item.product_id)
  }, 0)

  return (
    <Card>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Resumen del Carrito
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {totalQuantity} de {maxItemsPerOrder} items
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 text-lg">📦 Carrito vacío</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
            Agrégale productos para comenzar
          </p>
        </div>
      ) : (
        <>
          {/* Items */}
          <div className="space-y-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            {items.map((item) => {
              const itemTotal = item.quantity * getProductPrice(item.product_id)
              return (
                <div
                  key={item.product_id}
                  className="flex justify-between items-start p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {getProductName(item.product_id)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {item.quantity} x {formatPrice(getProductPrice(item.product_id))} = <span className="font-semibold text-blue-600 dark:text-blue-400">{formatPrice(itemTotal)}</span>
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() =>
                        onUpdateQuantity?.(
                          item.product_id,
                          Math.max(0, item.quantity - 1)
                        )
                      }
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition"
                      title="Reducir cantidad"
                    >
                      −
                    </button>

                    <button
                      onClick={() => onRemoveItem?.(item.product_id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded transition"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Totales */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Total de items:
              </span>
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                {totalQuantity}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Total a pagar:
              </span>
              <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Límite por orden:
              </span>
              <Badge variant={isFull ? 'warning' : 'success'}>
                {totalQuantity}/{maxItemsPerOrder}
              </Badge>
            </div>

            {isFull && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-amber-700 dark:text-amber-300 text-sm font-medium">
                  ⚠️ Has alcanzado el límite máximo de items
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  )
}
