'use client'

import { useState } from 'react'
import Link from 'next/link'
import { RegistrationForm } from '@/components/RegistrationForm'
import { Card, Button } from '@/components/UI'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [savedUser, setSavedUser] = useState(false)

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      // Hacer POST al endpoint de registro
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          full_name: data.full_name,
          document_id: data.document_id,
          position: data.position || null,
          phone: data.phone,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al registrar')
      }

      const result = await response.json()
      
      // Guardar usuario registrado
      localStorage.setItem('userRegistration', JSON.stringify(result.user))
      setSavedUser(true)

      // Mostrar éxito por 2 segundos y redirigir
      setTimeout(() => {
        window.location.href = '/products'
      }, 1500)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al registrar: ' + (error instanceof Error ? error.message : 'Error desconocido'))
      setIsLoading(false)
    }
  }

  if (savedUser) {
    return (
      <div className="container mx-auto max-w-lg p-4 min-h-screen flex items-center justify-center">
        <Card className="text-center">
          <p className="text-6xl mb-4">✓</p>
          <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
            ¡Datos Guardados!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Redirigiendo al catálogo...
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-5xl p-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Crear Cuenta
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Regístrate en 5 minutos para comenzar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Formulario */}
        <div>
          <RegistrationForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {/* Información */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              ¿Cómo Funciona?
            </h3>
            <ol className="space-y-4">
              {[
                'Completa tu información básica',
                'Explora nuestro catálogo de productos',
                'Selecciona los productos que necesitas',
                'Carga el documento de aprobación',
                'Envía tu solicitud y espera confirmación'
              ].map((step, i) => (
                <li key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">{i + 1}</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Requisitos
            </h3>
            <ul className="space-y-3">
              {[
                'Documento de identidad válido',
                'Email activo',
                'Teléfono de contacto',
                'Documento de aprobación (PDF o foto)'
              ].map((req, i) => (
                <li key={i} className="flex gap-3 text-gray-700 dark:text-gray-300">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
