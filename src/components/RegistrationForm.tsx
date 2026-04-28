'use client'

import { useState } from 'react'
import { Button, Input } from './UI'

interface UserRegistrationData {
  full_name: string
  document_id: string
  position: string
  email: string
  phone: string
  password: string
}

interface RegistrationFormProps {
  onSubmit?: (data: UserRegistrationData) => void
  isLoading?: boolean
}

export function RegistrationForm({ onSubmit, isLoading = false }: RegistrationFormProps) {
  const [formData, setFormData] = useState<UserRegistrationData>({
    full_name: '',
    document_id: '',
    position: '',
    email: '',
    phone: '',
    password: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'El nombre es requerido'
    }

    if (!formData.document_id.trim()) {
      newErrors.document_id = 'La cédula es requerida'
    } else if (!/^\d{8,11}$/.test(formData.document_id.replace(/\D/g, ''))) {
      newErrors.document_id = 'La cédula debe tener 8-11 dígitos'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    onSubmit?.(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Crear Cuenta
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Completa tu información para registrarte
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="Nombre Completo"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          placeholder="Juan Pérez García"
          error={errors.full_name}
        />

        <Input
          label="Cédula"
          name="document_id"
          value={formData.document_id}
          onChange={handleChange}
          placeholder="1234567890"
          error={errors.document_id}
        />

        <Input
          label="Cargo (opcional)"
          name="position"
          value={formData.position}
          onChange={handleChange}
          placeholder="Gerente de Ventas"
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="juan@example.com"
          error={errors.email}
        />

        <Input
          label="Teléfono"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+573001234567"
          error={errors.phone}
        />

        <Input
          label="Contraseña"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Mínimo 8 caracteres"
          error={errors.password}
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
        variant="primary"
      >
        {isLoading ? 'Guardando...' : 'Crear Cuenta'}
      </Button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Al continuar, aceptas nuestros términos de servicio
      </p>
    </form>
  )
}
