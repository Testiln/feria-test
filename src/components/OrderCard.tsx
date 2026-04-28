'use client'

import { useState } from 'react'
import { Card, Badge, Button } from './UI'
import { Order, OrderItem, Product, User } from '@/lib/types'
import { getStatusLabel, getStatusColor, formatDateTime } from '@/lib/utils'

interface OrderCardProps {
  order: Order & { 
    user?: User
    items?: OrderItem[]
    full_name?: string
    document_id?: string
    email?: string
    phone?: string
    position?: string
  }
  onApprove?: () => void
  onReject?: () => void
  isLoading?: boolean
  onApproveWithComment?: (comment: string) => void
  onRejectWithComment?: (comment: string) => void
}

export function OrderCard({
  order,
  onApprove,
  onReject,
  isLoading = false,
  onApproveWithComment,
  onRejectWithComment,
}: OrderCardProps) {
  const isPending = order.status === 'pending'
  const [showPdfPreview, setShowPdfPreview] = useState(false)
  const [showCommentForm, setShowCommentForm] = useState<'approve' | 'reject' | null>(null)
  const [comment, setComment] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  // Obtener datos del usuario desde la relación o campos directos
  const userName = order.user?.full_name || order.full_name || 'No disponible'
  const userDocument = order.user?.document_id || order.document_id || 'No disponible'
  const userEmail = order.user?.email || order.email || 'No disponible'
  const userPhone = order.user?.phone || order.phone || 'No disponible'
  const userPosition = order.user?.position || order.position || 'N/A'

  const handleApproveClick = () => {
    if (onApproveWithComment) {
      setShowCommentForm('approve')
    } else if (onApprove) {
      onApprove()
    }
  }

  const handleRejectClick = () => {
    if (onRejectWithComment) {
      setShowCommentForm('reject')
    } else if (onReject) {
      onReject()
    }
  }

  const submitApproveWithComment = () => {
    if (onApproveWithComment) {
      onApproveWithComment(comment)
      setComment('')
      setShowCommentForm(null)
    }
  }

  const submitRejectWithComment = () => {
    if (onRejectWithComment) {
      onRejectWithComment(comment)
      setComment('')
      setShowCommentForm(null)
    }
  }

  return (
    <>
      <Card>
        {/* Encabezado con Usuario */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-blue-200 dark:border-blue-900">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Orden #{order.id.slice(0, 8).toUpperCase()}
              </h3>
              <Badge
                variant={
                  order.status === 'approved'
                    ? 'success'
                    : order.status === 'rejected'
                      ? 'danger'
                      : 'warning'
                }
              >
                {getStatusLabel(order.status)}
              </Badge>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">NOMBRE</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    {userName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">CÉDULA</p>
                  <p className="text-base font-bold text-blue-600 dark:text-blue-400">
                    {userDocument}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detalles del Usuario Expandido */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-xs font-semibold mb-1">EMAIL</p>
              <p className="text-gray-900 dark:text-white break-all">
                {userEmail}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-xs font-semibold mb-1">TELÉFONO</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {userPhone}
              </p>
            </div>
            {userPosition && userPosition !== 'N/A' && (
              <div className="col-span-2">
                <p className="text-gray-600 dark:text-gray-400 text-xs font-semibold mb-1">CARGO</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {userPosition}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Productos - EXPANDIBLE */}
        {order.items && order.items.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between gap-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition"
            >
              <span className="font-semibold text-blue-900 dark:text-blue-100">
                📦 PRODUCTOS ({order.total_items})
              </span>
              <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
            </button>

            {isExpanded && (
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm border border-gray-200 dark:border-gray-600"
                  >
                    <span className="text-gray-900 dark:text-white font-medium">
                      {(item as any).products?.name || 'Producto'}
                    </span>
                    <Badge variant="info">x{item.quantity}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Preview del Documento de Aprobación */}
        {order.approval_document_url && (
          <div className="mb-4">
            <button
              onClick={() => setShowPdfPreview(!showPdfPreview)}
              className="w-full flex items-center justify-between gap-2 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900 transition"
            >
              <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                📄 Documento de Aprobación
              </span>
              <span className="text-xs">{showPdfPreview ? '▼' : '▶'}</span>
            </button>

            {showPdfPreview && (
              <div className="mt-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg border border-gray-300 dark:border-gray-600">
                <div className="bg-white dark:bg-gray-900 rounded flex items-center justify-center" style={{ height: '400px' }}>
                  <iframe
                    src={`${order.approval_document_url}#toolbar=0`}
                    title="Vista previa del documento"
                    className="w-full h-full rounded"
                    style={{ border: 'none' }}
                  />
                </div>
                <a
                  href={order.approval_document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Abrir en nueva ventana →
                </a>
              </div>
            )}
          </div>
        )}

        {/* Fechas e Info */}
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-xs space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">📅 Creado:</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {formatDateTime(order.created_at)}
            </span>
          </div>
          {order.approved_at && (
            <div className="flex justify-between">
              <span className="text-emerald-600 dark:text-emerald-400">✓ Aprobado:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {formatDateTime(order.approved_at)}
              </span>
            </div>
          )}
          {order.rejected_at && (
            <div className="flex justify-between">
              <span className="text-red-600 dark:text-red-400">✕ Rechazado:</span>
              <span className="text-red-600 dark:text-red-400 font-medium">
                {formatDateTime(order.rejected_at)}
              </span>
            </div>
          )}
        </div>

        {/* Notas */}
        {order.notes && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm mb-4 border border-blue-200 dark:border-blue-800">
            <p className="text-blue-900 dark:text-blue-300">
              <span className="font-semibold">📝 Notas:</span> {order.notes}
            </p>
          </div>
        )}

        {/* Acciones (solo para órdenes pendientes) */}
        {isPending && (
          <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleApproveClick}
              disabled={isLoading}
              variant="success"
              className="flex-1"
            >
              {isLoading ? 'Procesando...' : '✓ Aprobar'}
            </Button>
            <Button
              onClick={handleRejectClick}
              disabled={isLoading}
              variant="danger"
              className="flex-1"
            >
              {isLoading ? 'Procesando...' : '✕ Rechazar'}
            </Button>
          </div>
        )}
      </Card>

      {/* Modal de Comentarios */}
      {showCommentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {showCommentForm === 'approve' ? '✓ Aprobar Orden' : '✕ Rechazar Orden'}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {showCommentForm === 'approve' 
                  ? 'Comentario de Aprobación (Opcional)' 
                  : 'Razón de Rechazo (Opcional)'}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={showCommentForm === 'approve'
                  ? 'Ej: Aprobado - Documentación correcta'
                  : 'Ej: Rechazado - Documento incompleto'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowCommentForm(null)
                  setComment('')
                }}
                variant="secondary"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={showCommentForm === 'approve' ? submitApproveWithComment : submitRejectWithComment}
                variant={showCommentForm === 'approve' ? 'success' : 'danger'}
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? 'Procesando...' : (showCommentForm === 'approve' ? 'Aprobar' : 'Rechazar')}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
