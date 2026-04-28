'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ProductCatalog } from '@/components/ProductCatalog'
import { CartSummary } from '@/components/CartSummary'
import { Card, Button } from '@/components/UI'
import { Product, CartItem } from '@/lib/types'
import { saveCartToStorage, loadCartFromStorage } from '@/lib/utils'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [maxItems, setMaxItems] = useState(10)

  useEffect(() => {
    // Cargar productos
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        if (!response.ok) throw new Error('Error al cargar productos')

        const data = await response.json()
        setProducts(data.products || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setIsLoading(false)
      }
    }

    // Cargar configuración
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/admin/config')
        if (response.ok) {
          const data = await response.json()
          setMaxItems(parseInt(data.config.max_products_per_order) || 10)
        }
      } catch (err) {
        console.error('Error cargando configuración:', err)
      }
    }

    // Cargar carrito del localStorage
    const savedCart = loadCartFromStorage()
    if (savedCart.length > 0) {
      setCart(savedCart)
    }

    fetchProducts()
    fetchConfig()
  }, [])

  // Guardar carrito en localStorage y cookies
  useEffect(() => {
    saveCartToStorage(cart)
  }, [cart])

  const handleAddToCart = (productId: string, quantity: number) => {
    const totalCurrentItems = cart.reduce((sum, item) => sum + item.quantity, 0)

    if (totalCurrentItems + quantity > maxItems) {
      setError(`No puedes agregar más de ${maxItems} items totales`)
      setTimeout(() => setError(null), 3000)
      return
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === productId)
      if (existing) {
        return prev.map((item) =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [
        ...prev,
        {
          product_id: productId,
          quantity,
          product: products.find((p) => p.id === productId),
        },
      ]
    })
  }

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId))
  }

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(productId)
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.product_id === productId
            ? { ...item, quantity }
            : item
        )
      )
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl p-4 py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-center text-gray-600 dark:text-gray-400 mt-4">Cargando productos...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl p-4 py-8">
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300 font-medium">⚠️ {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Catálogo */}
        <div className="lg:col-span-2">
          <ProductCatalog products={products} cart={cart} onAddToCart={handleAddToCart} />
        </div>

        {/* Carrito y Checkout */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:h-fit">
          <CartSummary
            items={cart}
            products={products}
            maxItemsPerOrder={maxItems}
            onRemoveItem={handleRemoveItem}
            onUpdateQuantity={handleUpdateQuantity}
          />

          {cart.length > 0 && (
            <Button href="/checkout" className="w-full" variant="primary" size="lg">
              Proceder al Checkout →
            </Button>
          )}

          <Button href="/" className="w-full" variant="secondary">
            ← Volver al Inicio
          </Button>
        </div>
      </div>
    </div>
  )
}
