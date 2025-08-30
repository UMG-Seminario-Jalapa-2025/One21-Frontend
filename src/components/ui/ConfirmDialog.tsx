'use client'

import React from 'react'

import Modal from './Modal'

export default function ConfirmDialog({
  open,
  title = 'Confirmar acción',
  message,
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
}: {
  open: boolean
  title?: string
  message: React.ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <div className="flex flex-col items-center gap-4">
        {/* Icono estilo “X” */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <span className="text-2xl text-red-600">✕</span>
        </div>

        <p className="text-center text-sm text-gray-700">{message}</p>

        <div className="mt-2 flex w-full justify-end gap-2">
          <button
            type="button"
            className="rounded bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
            onClick={onCancel}
            autoFocus
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            onClick={onConfirm}
          >
            {/* pequeño ícono de basura opcional */}
            <span className="mr-1">🗑️</span>{confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
