'use client'

import { useState } from 'react'
import { Card, Badge, Button } from './UI'
import { Product, CartItem } from '@/lib/types'

interface ProductCatalogProps {
  products: Product[]
  cart?: CartItem[]
  onAddToCart?: (productId: string, quantity: number) => void
}

export function ProductCatalog({ products, cart = [], onAddToCart }: ProductCatalogProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const getQuantity = (productId: string) => quantities[productId] || 0

  const getCartQuantityForProduct = (productId: string) => {
    const cartItem = cart.find((item) => item.product_id === productId)
    return cartItem?.quantity || 0
  }

  const handleIncrement = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const availableStock = product.stock - product.reserved_stock
    const cartQuantity = getCartQuantityForProduct(productId)
    const currentQuantity = getQuantity(productId)
    const totalQuantity = cartQuantity + currentQuantity

    // Solo permitir agregar más si no se ha alcanzado el stock disponible
    if (totalQuantity <= availableStock) {
      setQuantities((prev) => ({
        ...prev,
        [productId]: currentQuantity + 1,
      }))
    }
  }

  const handleDecrement = (productId: string) => {
    const current = getQuantity(productId)
    if (current > 0) {
      setQuantities((prev) => ({
        ...prev,
        [productId]: current - 1,
      }))
    }
  }

  const handleAddToCart = (productId: string) => {
    const quantity = getQuantity(productId)
    if (quantity > 0) {
      onAddToCart?.(productId, quantity)
      setQuantities((prev) => ({
        ...prev,
        [productId]: 0,
      }))
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Catálogo de Productos</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Selecciona los productos que necesitas</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const availableStock = product.stock - product.reserved_stock
          const cartQuantity = getCartQuantityForProduct(product.id)
          const currentQuantity = getQuantity(product.id)
          const totalQuantity = cartQuantity + currentQuantity
          const remainingStock = availableStock - cartQuantity
          const isOutOfStock = availableStock <= 0

          return (
            <Card key={product.id} className="flex flex-col overflow-hidden hover:shadow-lg">
              {/* Imagen */}
              <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 h-48 overflow-hidden mb-4 -m-6 mb-4">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    📦
                  </div>
                )}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">Sin Stock</span>
                  </div>
                )}
              </div>

              {/* Contenido */}
              <div className="flex-1 flex flex-col">
                {/* Nombre y código */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <div className="mb-3">
                  <Badge variant="default" className="text-xs">
                    {product.code}
                  </Badge>
                </div>

                {/* Stock */}
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Stock Disponible</p>
                  <p
                    className={`text-lg font-bold ${
                      isOutOfStock
                        ? 'text-red-600 dark:text-red-400'
                        : remainingStock < 5
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {remainingStock}
                  </p>
                  {cartQuantity > 0 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {cartQuantity} en el carrito
                    </p>
                  )}
                </div>

                {/* Controles */}
                {!isOutOfStock ? (
                  <div className="mt-auto space-y-3">
                    {/* Quantity selector */}
                    <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                      <button
                        onClick={() => handleDecrement(product.id)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition"
                      >
                        −
                      </button>
                      <span className="font-semibold text-gray-900 dark:text-white min-w-8 text-center">
                        {currentQuantity}
                      </span>
                      <button
                        onClick={() => handleIncrement(product.id)}
                        disabled={totalQuantity > remainingStock}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>

                    <Button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={currentQuantity === 0 || totalQuantity > remainingStock}
                      variant="primary"
                      className="w-full"
                    >
                      {currentQuantity > 0 ? `Agregar ${currentQuantity}` : 'Agregar al Carrito'}
                    </Button>
                  </div>
                ) : (
                  <div className="mt-auto">
                    <Badge variant="danger" className="w-full text-center py-2 block">
                      Sin Stock
                    </Badge>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">No hay productos disponibles</p>
        </div>
      )}
    </div>
  )
}
