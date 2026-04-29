'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Input } from '@/components/UI'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  // Si ya está logueado (verificar con servidor), redirigir al dashboard
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/me', {
          method: 'GET',
          credentials: 'include',
        })
        if (response.ok) {
          // Ya está autenticado, redirigir
          router.push('/admin')
        }
      } catch (err) {
        console.log('No autenticado')
      } finally {
        setIsChecking(false)
      }
    }
    checkAuth()
  }, [router])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-700 font-medium">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (!username || !password) {
        setError('Usuario y contraseña son requeridos')
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      })

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('Failed to parse response:', parseError)
        setError('Error en la respuesta del servidor (formato inválido)')
        setIsLoading(false)
        return
      }

      if (response.ok && data.success) {
        // La cookie HTTP-only ya fue establecida por el servidor
        // Redirigir al dashboard admin
        router.push('/admin')
      } else {
        setError(data.message || 'Error de autenticación')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'Error al conectar con el servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Login
            </h1>
            <p className="text-gray-700 font-medium">Acceso a Panel de Administración</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              label="Usuario"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              autoComplete="username"
            />

            <Input
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
            />

            {error && (
              <div className="p-4 bg-red-100 border-l-4 border-red-700 rounded">
                <p className="text-red-900 font-bold">{error}</p>
              </div>
            )}

            <div className="bg-blue-100 border-l-4 border-blue-700 p-4 rounded">
              <p className="text-blue-900 font-medium text-sm">
                <strong>Credenciales Demo:</strong> <br />
                Usuario: <code className="bg-white px-2 py-1 rounded">admin</code> | Contraseña: <code className="bg-white px-2 py-1 rounded">admin123</code>
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              {isLoading ? 'Autenticando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              ← Volver al Inicio
            </a>
          </div>
        </Card>
      </div>
    </div>
  )
}
