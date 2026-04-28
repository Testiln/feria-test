import { OrderStatus, OrderReport, Order, OrderItem, Product, User } from './types'

/**
 * Formatea una fecha a formato legible
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Formatea una fecha y hora
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Obtiene la etiqueta de estado en español
 */
export function getStatusLabel(status: OrderStatus): string {
  const statusMap: Record<OrderStatus, string> = {
    pending: 'Pendiente',
    approved: 'Aprobada',
    rejected: 'Rechazada',
    delivered: 'Entregada',
  }
  return statusMap[status] || status
}

/**
 * Obtiene el color para el badge de estado
 */
export function getStatusColor(status: OrderStatus): string {
  const colorMap: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    delivered: 'bg-blue-100 text-blue-800',
  }
  return colorMap[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Calcula el stock disponible
 */
export function getAvailableStock(product: Product): number {
  return product.stock - product.reserved_stock
}

/**
 * Valida un email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida un número de teléfono colombiano
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+57|0057|57)?[1-9]\d{9}$/
  return phoneRegex.test(phone.replace(/\D/g, ''))
}

/**
 * Valida una cédula colombiana (básico)
 */
export function isValidDocumentId(documentId: string): boolean {
  const numericOnly = documentId.replace(/\D/g, '')
  return numericOnly.length >= 8 && numericOnly.length <= 11
}

/**
 * Genera un ID de orden legible
 */
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

/**
 * Calcula estadísticas de órdenes
 */
export function calculateOrderStats(orders: Order[]): {
  total: number
  approved: number
  rejected: number
  pending: number
  approvedPercentage: number
  rejectedPercentage: number
} {
  const total = orders.length
  const approved = orders.filter((o) => o.status === 'approved').length
  const rejected = orders.filter((o) => o.status === 'rejected').length
  const pending = orders.filter((o) => o.status === 'pending').length

  const approvedPercentage = total > 0 ? Math.round((approved / total) * 100) : 0
  const rejectedPercentage = total > 0 ? Math.round((rejected / total) * 100) : 0

  return {
    total,
    approved,
    rejected,
    pending,
    approvedPercentage,
    rejectedPercentage,
  }
}

/**
 * Convierte órdenes a formato de reporte CSV
 */
export function convertToCSV(
  orders: (Order & { user?: User; items?: OrderItem[]; products?: Map<string, Product> })[]
): string {
  const headers = [
    'ID Solicitud',
    'Nombre Cliente',
    'Email',
    'Cédula',
    'Estado',
    'Total Items',
    'Productos',
    'Fecha Creación',
    'Fecha Aprobación',
    'Fecha Rechazo',
  ]

  const rows = orders.map((order) => {
    const productNames =
      order.items && order.products
        ? order.items.map((item) => {
            const product = order.products?.get(item.product_id)
            return `${product?.name || 'Producto'} (${item.quantity})`
          })
        : []

    return [
      order.id,
      order.user?.full_name || 'N/A',
      order.user?.email || 'N/A',
      order.user?.document_id || 'N/A',
      getStatusLabel(order.status),
      order.total_items,
      productNames.join('; '),
      formatDate(order.created_at),
      order.approved_at ? formatDate(order.approved_at) : '-',
      order.rejected_at ? formatDate(order.rejected_at) : '-',
    ]
  })

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  return csvContent
}

/**
 * Descarga un archivo de texto
 */
export function downloadTextFile(content: string, filename: string): void {
  const element = document.createElement('a')
  element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`)
  element.setAttribute('download', filename)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

/**
 * Calcula totales de inventario
 */
export function calculateInventoryStats(products: Product[]): {
  totalStock: number
  totalReserved: number
  totalAvailable: number
  productCount: number
} {
  return {
    totalStock: products.reduce((sum, p) => sum + p.stock, 0),
    totalReserved: products.reduce((sum, p) => sum + p.reserved_stock, 0),
    totalAvailable: products.reduce((sum, p) => sum + getAvailableStock(p), 0),
    productCount: products.length,
  }
}

/**
 * Formatea números con separadores de miles
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('es-CO')
}

/**
 * Extrae el tipo MIME de un archivo
 */
export function getFileMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop()
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
  }
  return mimeTypes[ext || ''] || 'application/octet-stream'
}

/**
 * Valida el tamaño de archivo (en MB)
 */
export function isValidFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

/**
 * Valida el tipo de archivo
 */
export function isValidFileType(filename: string, allowedTypes: string[]): boolean {
  const ext = filename.toLowerCase().split('.').pop()
  return ext ? allowedTypes.includes(ext) : false
}

/**
 * Genera un nombre único para archivo
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = originalName.split('.').pop()
  return `${timestamp}-${random}.${ext}`
}

/**
 * Guarda el carrito en localStorage y cookies
 * @param cart Array de items del carrito
 */
export function saveCartToStorage(cart: any[]): void {
  try {
    // Guardar en localStorage
    localStorage.setItem('cart', JSON.stringify(cart))
    
    // Guardar en cookie (para persistencia adicional)
    const cartJson = JSON.stringify(cart)
    const maxAge = 7 * 24 * 60 * 60 // 7 días
    document.cookie = `cart=${encodeURIComponent(cartJson)}; path=/; max-age=${maxAge}`
  } catch (error) {
    console.error('Error guardando carrito:', error)
  }
}

/**
 * Carga el carrito desde localStorage o cookies
 * @returns Array de items del carrito
 */
export function loadCartFromStorage(): any[] {
  try {
    // Intentar cargar desde localStorage primero
    const cartJson = localStorage.getItem('cart')
    if (cartJson) {
      return JSON.parse(cartJson)
    }
    
    // Si no hay en localStorage, intentar desde cookies
    const cookies = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('cart='))
    
    if (cookies) {
      const cartJson = decodeURIComponent(cookies.substring(5))
      return JSON.parse(cartJson)
    }
    
    return []
  } catch (error) {
    console.error('Error cargando carrito:', error)
    return []
  }
}

/**
 * Limpia el carrito del storage
 */
export function clearCartFromStorage(): void {
  try {
    localStorage.removeItem('cart')
    document.cookie = 'cart=; path=/; max-age=0'
  } catch (error) {
    console.error('Error limpiando carrito:', error)
  }
}

