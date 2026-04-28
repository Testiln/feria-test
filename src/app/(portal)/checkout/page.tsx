'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, Button, Input } from '@/components/UI'
import { CartItem, Product } from '@/lib/types'
import { saveCartToStorage, loadCartFromStorage, clearCartFromStorage } from '@/lib/utils'

interface UserData {
  full_name: string
  document_id: string
  email: string
  phone: string
  position: string
}

interface FormErrors {
  [key: string]: string
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [step, setStep] = useState<'user' | 'document' | 'confirm'>('user')

  // User form state
  const [userData, setUserData] = useState<UserData>({
    full_name: '',
    document_id: '',
    email: '',
    phone: '',
    position: '',
  })

  useEffect(() => {
    // Cargar carrito
    const savedCart = loadCartFromStorage()
    if (savedCart.length > 0) {
      setCart(savedCart)
    }

    // Cargar datos del usuario si existen
    const savedUser = localStorage.getItem('checkoutUser')
    if (savedUser) {
      try {
        setUserData(JSON.parse(savedUser))
      } catch (err) {
        console.error('Error cargando datos del usuario:', err)
      }
    }

    // Cargar productos
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || [])
        }
      } catch (err) {
        console.error('Error cargando productos:', err)
      }
    }

    fetchProducts()
  }, [])

  const validateUserData = (): boolean => {
    const newErrors: FormErrors = {}

    if (!userData.full_name.trim()) {
      newErrors.full_name = 'El nombre es requerido'
    }

    if (!userData.document_id.trim()) {
      newErrors.document_id = 'La cédula es requerida'
    } else if (!/^\d{8,11}$/.test(userData.document_id.replace(/\D/g, ''))) {
      newErrors.document_id = 'La cédula debe tener 8-11 dígitos'
    }

    if (!userData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!userData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido'
    }

    setFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Limpiar error
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleContinueUser = () => {
    if (validateUserData()) {
      // Guardar datos en localStorage
      localStorage.setItem('checkoutUser', JSON.stringify(userData))
      setStep('document')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Solo se aceptan PDF e imágenes (JPEG, PNG, WebP)')
        return
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('El archivo no puede superar 10MB')
        return
      }

      setFile(selectedFile)
      setError(null)
    }
  }

  const handleContinueDocument = () => {
    if (!file) {
      setError('Debes cargar un documento de aprobación')
      return
    }
    setError(null)
    setStep('confirm')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError('Debes cargar un documento')
      return
    }

    if (cart.length === 0) {
      setError('El carrito está vacío')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Paso 1: Subir archivo a Supabase Storage
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json()
        throw new Error(uploadError.error || 'Error al subir documento')
      }

      const uploadData = await uploadResponse.json()
      const approval_document_url = uploadData.url

      // Paso 2: Crear orden con la URL del documento
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
          approval_document_url,
          user_data: userData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear la orden')
      }

      const data = await response.json()
      setOrderId(data.order.id)
      setSuccess(true)

      // Limpiar carrito y datos del usuario
      clearCartFromStorage()
      localStorage.removeItem('checkoutUser')
      setCart([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  if (cart.length === 0 && !success) {
    return (
      <div className="container mx-auto max-w-lg p-4 py-12">
        <Card className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Carrito Vacío</h2>
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-6">Primero debes agregar productos al carrito</p>
          <Button href="/products" className="w-full">
            Volver al Catálogo
          </Button>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="container mx-auto max-w-lg p-4 py-12">
        <Card className="text-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800">
          <p className="text-6xl mb-4">✓</p>
          <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">¡Solicitud Enviada!</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 font-medium">Tu orden ha sido registrada exitosamente.</p>
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-lg mb-6 border-2 border-emerald-300 dark:border-emerald-700">
            <p className="text-sm text-emerald-900 dark:text-emerald-300 font-semibold">
              <strong>ID de Orden:</strong> {orderId?.slice(0, 12)}...
            </p>
            <p className="text-sm text-emerald-800 dark:text-emerald-400 mt-2">El administrador revisará tu solicitud pronto.</p>
          </div>
          <Link href="/products">
            <Button className="w-full" variant="primary">← Volver al Catálogo</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="container mx-auto max-w-3xl p-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400 mb-2">Confirmar Solicitud</h1>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Completa todos los pasos para enviar tu orden</p>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <div className={`flex-shrink-0 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${step === 'user' ? 'bg-blue-600 text-white dark:bg-blue-600' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-400'}`}>
          1. Datos
        </div>
        <div className={`flex-shrink-0 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${step === 'document' ? 'bg-blue-600 text-white dark:bg-blue-600' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-400'}`}>
          2. Documento
        </div>
        <div className={`flex-shrink-0 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${step === 'confirm' ? 'bg-blue-600 text-white dark:bg-blue-600' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-400'}`}>
          3. Confirmar
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 dark:border-red-400 rounded-lg">
          <p className="text-red-700 dark:text-red-300 font-semibold">⚠️ {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="md:col-span-2">
          {/* Step 1: User Data */}
          {step === 'user' && (
            <Card>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b-2 border-blue-200 dark:border-blue-800">Información del Solicitante</h2>
              <div className="space-y-4">
                <Input
                  label="Nombre Completo"
                  name="full_name"
                  value={userData.full_name}
                  onChange={handleUserInputChange}
                  placeholder="Juan Pérez García"
                  error={formErrors.full_name}
                />

                <Input
                  label="Cédula"
                  name="document_id"
                  value={userData.document_id}
                  onChange={handleUserInputChange}
                  placeholder="1234567890"
                  error={formErrors.document_id}
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={userData.email}
                  onChange={handleUserInputChange}
                  placeholder="juan@example.com"
                  error={formErrors.email}
                />

                <Input
                  label="Teléfono"
                  name="phone"
                  value={userData.phone}
                  onChange={handleUserInputChange}
                  placeholder="+573001234567"
                  error={formErrors.phone}
                />

                <Input
                  label="Cargo (Opcional)"
                  name="position"
                  value={userData.position}
                  onChange={handleUserInputChange}
                  placeholder="Gerente de Ventas"
                />

                <Button onClick={handleContinueUser} className="w-full" variant="success" size="lg">
                  Continuar → Documento
                </Button>
              </div>
            </Card>
          )}

          {/* Step 2: Document */}
          {step === 'document' && (
            <Card>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b-2 border-blue-200 dark:border-blue-800">Documento de Aprobación</h2>
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-4">Carga el formato de aprobación en PDF o como foto</p>

              <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-600 hover:bg-blue-50 transition bg-blue-50/50">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer block">
                  {file ? (
                    <>
                      <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">✓ Archivo cargado</p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{file.name}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-3xl mb-2">📄</p>
                      <p className="font-bold text-gray-900 dark:text-white">Haz clic para seleccionar</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">o arrastra un archivo aquí</p>
                    </>
                  )}
                </label>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-medium">Máximo 10MB. PDF, JPEG, PNG o WebP</p>

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setStep('user')}
                >
                  ← Atrás
                </Button>
                <Button
                  onClick={handleContinueDocument}
                  className="flex-1"
                  variant="success"
                  disabled={!file}
                >
                  Continuar → Confirmar
                </Button>
              </div>
            </Card>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <Card>
              <form onSubmit={handleSubmit}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b-2 border-blue-200 dark:border-blue-800">Resumen y Confirmación</h2>

                {/* User Summary */}
                <div className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-600 dark:border-blue-400 p-4 rounded mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">Solicitante:</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-700 dark:text-gray-400 font-medium">Nombre:</p>
                      <p className="text-gray-900 dark:text-white font-semibold">{userData.full_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-700 dark:text-gray-400 font-medium">Cédula:</p>
                      <p className="text-gray-900 dark:text-white font-semibold">{userData.document_id}</p>
                    </div>
                    <div>
                      <p className="text-gray-700 dark:text-gray-400 font-medium">Email:</p>
                      <p className="text-gray-900 dark:text-white font-semibold">{userData.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-700 dark:text-gray-400 font-medium">Teléfono:</p>
                      <p className="text-gray-900 dark:text-white font-semibold">{userData.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-indigo-50 dark:bg-indigo-950/20 border-l-4 border-indigo-600 dark:border-indigo-400 p-4 rounded mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">Productos Solicitados:</h3>
                  <div className="space-y-2">
                    {cart.map((item) => {
                      const product = products.find((p) => p.id === item.product_id)
                      return (
                        <div key={item.product_id} className="flex justify-between text-sm">
                          <span className="text-gray-900 dark:text-gray-100 font-medium">{product?.name || 'Producto'}</span>
                          <span className="text-gray-900 dark:text-gray-100 font-semibold">Qty: {item.quantity}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 dark:text-white mt-4 pt-4 border-t-2 border-indigo-200 dark:border-indigo-700">
                    <span>Total de items:</span>
                    <span className="text-indigo-600 dark:text-indigo-400 text-lg">{totalItems}</span>
                  </div>
                </div>

                {/* Document Summary */}
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-600 dark:border-emerald-400 p-4 rounded mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Documento:</h3>
                  <p className="text-emerald-700 dark:text-emerald-400 font-semibold text-sm">✓ {file?.name}</p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setStep('document')}
                  >
                    ← Atrás
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !file}
                    className="flex-1"
                    variant="success"
                    size="lg"
                  >
                    {isLoading ? 'Enviando...' : '✓ Enviar Solicitud'}
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>

        {/* Resumen Lateral */}
        <div>
          <Card className="sticky top-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4 pb-3 border-b-2 border-blue-200 dark:border-blue-800">Resumen</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Paso Actual:</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold capitalize">{step === 'user' ? 'Datos' : step === 'document' ? 'Documento' : 'Confirmación'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Productos:</span>
                <span className="text-gray-900 dark:text-white font-semibold">{cart.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Total Items:</span>
                <span className="text-gray-900 dark:text-white font-semibold">{totalItems}</span>
              </div>
              <div className="border-t-2 border-blue-200 dark:border-blue-800 pt-3">
                <Link href="/products">
                  <Button variant="secondary" className="w-full text-sm">
                    Editar Carrito
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
