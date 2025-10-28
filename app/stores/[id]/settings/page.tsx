'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { ShopifyConnectionCard } from '@/components/shopify/shopify-connection-card'

interface Store {
  id: string
  name: string
  role: string
  shopify_connected: boolean
  shopify_store_domain: string | null
  shopify_connected_at: string | null
}

function StoreSettingsContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const storeId = params.id as string
  const initialTab = searchParams.get('tab') || 'general'
  const success = searchParams.get('success')

  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'general' | 'shopify'>(initialTab as any)
  const [storeName, setStoreName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await fetch(`/api/stores/${storeId}`)
        if (response.ok) {
          const data = await response.json()
          setStore(data.store)
          setStoreName(data.store.name)
        } else {
          router.push('/stores')
        }
      } catch (error) {
        console.error('Error fetching store:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStore()
  }, [storeId, router])

  // Show success message if redirected from Shopify
  useEffect(() => {
    if (success === 'connected') {
      alert('Shopify store connected successfully!')
      // Remove success param from URL
      router.replace(`/stores/${storeId}/settings?tab=shopify`)
    }
  }, [success, storeId, router])

  const handleSaveGeneral = async () => {
    if (!storeName.trim()) {
      alert('Store name is required')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: storeName }),
      })

      if (response.ok) {
        const data = await response.json()
        setStore({ ...store!, name: data.store.name })
        alert('Settings saved successfully')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleShopifyStatusChange = () => {
    // Refresh store data when Shopify connection status changes
    const fetchStore = async () => {
      const response = await fetch(`/api/stores/${storeId}`)
      if (response.ok) {
        const data = await response.json()
        setStore(data.store)
      }
    }
    fetchStore()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!store) {
    return null
  }

  const canManage = store.role === 'owner' || store.role === 'admin'

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push(`/stores/${storeId}`)}
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
              <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
              <p className="text-sm text-gray-600 mt-1">{store.name}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('general')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'general'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                General
              </button>
              <button
                onClick={() => setActiveTab('shopify')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'shopify'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Shopify
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'general' && (
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  General Settings
                </h3>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="store-name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Store Name
                    </label>
                    <input
                      id="store-name"
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      disabled={!canManage}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  {canManage && (
                    <button
                      onClick={handleSaveGeneral}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  )}

                  {!canManage && (
                    <p className="text-sm text-gray-600">
                      Only store owners and admins can modify settings.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'shopify' && (
              <ShopifyConnectionCard
                storeId={storeId}
                isConnected={store.shopify_connected}
                shopDomain={store.shopify_store_domain}
                connectedAt={store.shopify_connected_at}
                canManage={canManage}
                onStatusChange={handleShopifyStatusChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StoreSettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    }>
      <StoreSettingsContent />
    </Suspense>
  )
}
