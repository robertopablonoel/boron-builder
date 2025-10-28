'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SaveFunnelModal } from './save-funnel-modal'

interface BuilderHeaderProps {
  funnelId?: string
  funnelName?: string
  storeId?: string
  onSave: (name: string, storeId: string) => Promise<void>
  isSaving: boolean
}

export function BuilderHeader({
  funnelId,
  funnelName,
  storeId,
  onSave,
  isSaving,
}: BuilderHeaderProps) {
  const router = useRouter()
  const [showSaveModal, setShowSaveModal] = useState(false)

  const handleSave = async (name: string, selectedStoreId: string) => {
    await onSave(name, selectedStoreId)
    setShowSaveModal(false)
  }

  return (
    <>
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/stores')}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {funnelName || 'Untitled Funnel'}
            </h1>
            {funnelId && (
              <p className="text-xs text-gray-500">
                {isSaving ? 'Saving...' : 'All changes saved'}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {funnelId ? (
            <button
              onClick={() => onSave(funnelName!, storeId!)}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          ) : (
            <button
              onClick={() => setShowSaveModal(true)}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Funnel
            </button>
          )}
        </div>
      </div>

      {showSaveModal && (
        <SaveFunnelModal
          onClose={() => setShowSaveModal(false)}
          onSave={handleSave}
          defaultStoreId={storeId}
        />
      )}
    </>
  )
}
