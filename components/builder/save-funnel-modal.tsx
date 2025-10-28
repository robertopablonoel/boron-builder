'use client'

import { useEffect, useState } from 'react'

interface SaveFunnelModalProps {
  onClose: () => void
  onSave: (name: string, storeId: string) => Promise<void>
  defaultStoreId?: string
}

interface Store {
  id: string
  name: string
  role: string
}

export function SaveFunnelModal({
  onClose,
  onSave,
  defaultStoreId,
}: SaveFunnelModalProps) {
  const [name, setName] = useState('')
  const [storeId, setStoreId] = useState(defaultStoreId || '')
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch user's stores
    const fetchStores = async () => {
      try {
        const response = await fetch('/api/stores')
        if (response.ok) {
          const data = await response.json()
          setStores(data.stores)
          if (!defaultStoreId && data.stores.length > 0) {
            setStoreId(data.stores[0].id)
          }
        }
      } catch (error) {
        console.error('Error fetching stores:', error)
      }
    }
    fetchStores()
  }, [defaultStoreId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!name.trim()) {
        throw new Error('Funnel name is required')
      }
      if (!storeId) {
        throw new Error('Please select a store')
      }

      await onSave(name, storeId)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Save Funnel</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {stores.length === 0 ? (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                You need to create a store first before saving funnels.
              </p>
              <a
                href="/stores"
                className="text-sm text-yellow-900 underline font-medium mt-2 inline-block"
              >
                Create a store →
              </a>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label
                  htmlFor="funnel-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Funnel Name
                </label>
                <input
                  id="funnel-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome Funnel"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="store"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Store
                </label>
                <select
                  id="store"
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a store</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !name.trim() || !storeId || stores.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Funnel'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
