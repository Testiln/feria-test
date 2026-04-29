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
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [maxItems, setMaxItems] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [priceSort, setPriceSort] = useState<'none' | 'asc' | 'desc'>('none')
  const [showMobileCart, setShowMobileCart] = useState(false)

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

  // Filtrar y ordenar productos
  useEffect(() => {
    let filtered = products

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Ordenar por precio
    if (priceSort === 'asc') {
      filtered = [...filtered].sort((a, b) => (a.price || 0) - (b.price || 0))
    } else if (priceSort === 'desc') {
      filtered = [...filtered].sort((a, b) => (b.price || 0) - (a.price || 0))
    }

    setFilteredProducts(filtered)
  }, [products, searchTerm, priceSort])

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

      {/* Header con título */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Catálogo de Productos</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Selecciona los productos que necesitas</p>
      </div>

      {/* Barra de búsqueda y ordenamiento */}
      <div className="mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Búsqueda */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              🔍 Buscar
            </label>
            <input
              type="text"
              placeholder="Nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Ordenar por precio */}
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              💰 Precio
            </label>
            <select
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value as typeof priceSort)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="none">Sin ordenar</option>
              <option value="asc">Menor a Mayor ↑</option>
              <option value="desc">Mayor a Menor ↓</option>
            </select>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          Mostrando {filteredProducts.length} de {products.length} productos
        </div>
      </div>

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Catálogo - en escritorio ocupa 2/3, en móvil todo */}
        <div className="lg:col-span-2">
          <ProductCatalog
            products={filteredProducts}
            cart={cart}
            onAddToCart={handleAddToCart}
          />
        </div>

        {/* Carrito - en escritorio sticky a la derecha, en móvil es un botón flotante */}
        <div className="hidden lg:block space-y-4 sticky top-20 h-fit">
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

      {/* Botón del carrito flotante en móvil */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowMobileCart(!showMobileCart)}
          className="relative w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center text-xl transition-transform hover:scale-110"
        >
          🛒
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Modal del carrito en móvil */}
      {showMobileCart && (
        <>
          {/* Overlay */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowMobileCart(false)}
          />
          {/* Drawer desde la derecha */}
          <div className="lg:hidden fixed right-0 top-0 h-screen w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto transform transition-transform">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tu Carrito</h2>
                <button
                  onClick={() => setShowMobileCart(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
                >
                  ✕
                </button>
              </div>

              <CartSummary
                items={cart}
                products={products}
                maxItemsPerOrder={maxItems}
                onRemoveItem={handleRemoveItem}
                onUpdateQuantity={handleUpdateQuantity}
              />

              <div className="mt-6 space-y-3">
                {cart.length > 0 && (
                  <Link href="/checkout" onClick={() => setShowMobileCart(false)}>
                    <Button className="w-full" variant="primary" size="lg">
                      Proceder al Checkout →
                    </Button>
                  </Link>
                )}

                <Link href="/">
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => setShowMobileCart(false)}
                  >
                    ← Volver al Inicio
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
