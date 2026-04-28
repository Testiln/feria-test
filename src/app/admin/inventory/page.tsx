'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, Button, Input } from '@/components/UI'
import { AdminProtector } from '@/components/AdminProtector'
import { Product } from '@/lib/types'
import { formatNumber } from '@/lib/utils'

interface EditingProduct {
  id: string
  stock: number
  price: number
  image_url: string
  ecommerce_url: string
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        if (!response.ok) {
          throw new Error('Error al cargar productos')
        }

        const data = await response.json()
        setProducts(data.products || [])
        setFilteredProducts(data.products || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    if (!search.trim()) {
      setFilteredProducts(products)
    } else {
      const lowerSearch = search.toLowerCase()
      setFilteredProducts(
        products.filter(
          (p) =>
            p.name.toLowerCase().includes(lowerSearch) ||
            p.code.toLowerCase().includes(lowerSearch)
        )
      )
    }
  }, [search, products])

  const handleEditProduct = (product: Product) => {
    setEditingProduct({
      id: product.id,
      stock: product.stock,
      price: (product as any).price || 0,
      image_url: product.image_url || '',
      ecommerce_url: (product as any).ecommerce_url || '',
    })
  }

  const handleSaveProduct = async () => {
    if (!editingProduct) return

    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock: editingProduct.stock,
          price: editingProduct.price,
          image_url: editingProduct.image_url,
          ecommerce_url: editingProduct.ecommerce_url,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar producto')
      }

      const data = await response.json()
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? data.product : p))
      )
      setEditingProduct(null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    }
  }

  const handleCancel = () => {
    setEditingProduct(null)
  }

  return (
    <div className="container mx-auto max-w-7xl p-4 py-8">
      <AdminProtector />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Gestión de Inventario</h1>
          <p className="text-gray-800 font-medium mt-2">Edita productos, precios y enlaces</p>
        </div>
        <Button href="/admin" variant="secondary" className="font-bold">Volver al Panel</Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-700 rounded">
          <p className="text-red-900 font-bold">{error}</p>
        </div>
      )}

      {/* Búsqueda */}
      <div className="mb-6">
        <Input
          label="Buscar producto"
          placeholder="Por nombre o código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Card className="text-center py-12">
          <p className="text-gray-800 font-bold">Cargando inventario...</p>
        </Card>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-700">
              <p className="font-bold text-lg">No hay productos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <tr>
                    <th className="px-4 py-4 text-left font-bold">Código</th>
                    <th className="px-4 py-4 text-left font-bold">Nombre</th>
                    <th className="px-4 py-4 text-right font-bold">Stock</th>
                    <th className="px-4 py-4 text-right font-bold">Precio</th>
                    <th className="px-4 py-4 text-center font-bold">Imagen</th>
                    <th className="px-4 py-4 text-center font-bold">Ecommerce</th>
                    <th className="px-4 py-4 text-center font-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => {
                    const isEditing = editingProduct?.id === product.id

                    return (
                      <tr key={product.id} className={`hover:bg-blue-50 transition ${isEditing ? 'bg-blue-100' : ''}`}>
                        <td className="px-4 py-4">
                          <span className="font-mono text-sm bg-gray-200 px-3 py-2 rounded font-bold text-gray-900">
                            {product.code}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-bold text-gray-900">{product.name}</td>
                        <td className="px-4 py-4 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editingProduct!.stock}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct!, stock: parseInt(e.target.value) || 0 })
                              }
                              className="w-20 px-2 py-2 border-2 border-blue-600 rounded text-right font-bold text-gray-900 bg-white"
                            />
                          ) : (
                            <span className="font-bold text-gray-900">{formatNumber(product.stock)}</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editingProduct!.price}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct!, price: parseFloat(e.target.value) || 0 })
                              }
                              className="w-24 px-2 py-2 border-2 border-blue-600 rounded text-right font-bold text-gray-900 bg-white"
                            />
                          ) : (
                            <span className="font-bold text-gray-900">
                              ${formatNumber((product as any).price || 0)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingProduct!.image_url}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct!, image_url: e.target.value })
                              }
                              placeholder="URL de imagen"
                              className="w-full px-2 py-2 border-2 border-blue-600 rounded text-xs font-bold text-gray-900 bg-white"
                            />
                          ) : (
                            <a
                              href={product.image_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 font-bold underline text-xs"
                            >
                              Ver
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingProduct!.ecommerce_url}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct!, ecommerce_url: e.target.value })
                              }
                              placeholder="URL ecommerce"
                              className="w-full px-2 py-2 border-2 border-blue-600 rounded text-xs font-bold text-gray-900 bg-white"
                            />
                          ) : (
                            <a
                              href={(product as any).ecommerce_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 font-bold underline text-xs"
                            >
                              Ver
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {isEditing ? (
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={handleSaveProduct}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded transition"
                              >
                                ✓ Guardar
                              </button>
                              <button
                                onClick={handleCancel}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-3 py-2 rounded transition"
                              >
                                ✕ Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded transition"
                            >
                              Editar
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
