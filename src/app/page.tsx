'use client'

import Link from 'next/link'
import { Button, Card } from '@/components/UI'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent"></div>
        <div className="container mx-auto max-w-6xl px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6 inline-block">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-3xl mx-auto mb-4">
                📦
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Tu Plataforma de <span className="text-blue-600 dark:text-blue-400">Solicitud</span> de Productos
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 font-light">
              Gestiona y solicita productos de forma simple, segura y eficiente
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button href="/products" size="lg" variant="primary">
                Ver Catálogo →
              </Button>
              <Button href="/admin" size="lg" variant="outline">
                Panel Admin
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Características
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Todo lo que necesitas para gestionar tus solicitudes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '📋',
                title: 'Catálogo Completo',
                description: 'Accede a productos con información detallada, imágenes y disponibilidad en tiempo real'
              },
              {
                icon: '⚡',
                title: 'Aprobación Rápida',
                description: 'Envía solicitudes y recibe respuestas del administrador de forma inmediata'
              },
              {
                icon: '📊',
                title: 'Seguimiento',
                description: 'Monitorea el estado de tus órdenes desde cualquier dispositivo'
              }
            ].map((feature, i) => (
              <Card key={i}>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Cómo Funciona
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Tres simples pasos para solicitar productos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: '1',
                title: 'Explora',
                description: 'Navega por nuestro catálogo completo de productos'
              },
              {
                num: '2',
                title: 'Selecciona',
                description: 'Elige productos y cantidades que necesitas'
              },
              {
                num: '3',
                title: 'Solicita',
                description: 'Ingresa tus datos y envía para aprobación'
              }
            ].map((step, i) => (
              <div key={i} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] right-[-30%] h-0.5 bg-gradient-to-r from-blue-300 to-transparent dark:from-blue-700"></div>
                )}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mb-4 relative z-10">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                ¿Por qué elegirnos?
              </h2>
              <div className="space-y-4">
                {[
                  { icon: '🔒', title: 'Seguridad', desc: 'Información protegida con encriptación' },
                  { icon: '⚡', title: 'Rápido', desc: 'Interfaz intuitiva y responsiva' },
                  { icon: '👨‍💼', title: 'Soporte', desc: 'Equipo disponible para ayudarte' },
                  { icon: '📱', title: 'Accesible', desc: 'Funciona en todos los dispositivos' }
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-3xl flex-shrink-0">{benefit.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {benefit.title}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {benefit.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Catálogo</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">500+</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Productos disponibles</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">100%</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Satisfacción</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Velocidad</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">24/7</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Disponible siempre</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-800 text-white py-16">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">¿Listo para comenzar?</h2>
          <p className="text-lg mb-8 text-blue-100 max-w-xl mx-auto">
            Accede a nuestro catálogo completo y realiza tu primera solicitud hoy
          </p>
          <Button href="/products" size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
            Ir al Catálogo →
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-400 py-12 border-t border-gray-800">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {[
              {
                title: 'Producto',
                links: [{ text: 'Catálogo', href: '/products' }]
              },
              {
                title: 'Admin',
                links: [{ text: 'Panel', href: '/admin' }]
              },
              {
                title: 'Legal',
                links: [
                  { text: 'Privacidad', href: '#' },
                  { text: 'Términos', href: '#' }
                ]
              },
              {
                title: 'Contacto',
                links: [{ text: 'Soporte', href: '#' }]
              }
            ].map((section, i) => (
              <div key={i}>
                <p className="font-semibold text-white mb-4">{section.title}</p>
                <ul className="space-y-2">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <a href={link.href} className="hover:text-blue-400 transition-colors">
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2026 Dashboard Feria. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
