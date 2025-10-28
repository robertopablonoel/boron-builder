'use client'

import React, { useState } from 'react'

interface SyncStatus {
  syncJob: {
    id: string
    status: 'pending' | 'running' | 'completed' | 'failed'
    products_synced: number
    started_at: string
    completed_at: string | null
  } | null
  productCount: number
}

interface ShopifyConnectionCardProps {
  storeId: string
  isConnected: boolean
  shopDomain: string | null
  connectedAt: string | null
  canManage: boolean
  onStatusChange: () => void
}

export function ShopifyConnectionCard({
  storeId,
  isConnected,
  shopDomain,
  connectedAt,
  canManage,
  onStatusChange,
}: ShopifyConnectionCardProps) {
  const [shopInput, setShopInput] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)

  // Fetch sync status when connected
  React.useEffect(() => {
    if (isConnected) {
      fetchSyncStatus()
      // Poll sync status every 5 seconds if syncing
      const interval = setInterval(() => {
        if (syncStatus?.syncJob?.status === 'running') {
          fetchSyncStatus()
        }
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isConnected, syncStatus?.syncJob?.status])

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch(`/api/stores/${storeId}/shopify/sync-status`)
      if (response.ok) {
        const data = await response.json()
        setSyncStatus(data)
      }
    } catch (error) {
      console.error('Error fetching sync status:', error)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const response = await fetch(`/api/stores/${storeId}/shopify/sync`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to start sync')
      }

      alert('Product sync started! This may take a few minutes.')
      fetchSyncStatus()
    } catch (error: any) {
      console.error('Error syncing products:', error)
      alert(error.message || 'Failed to sync products')
    } finally {
      setSyncing(false)
    }
  }

  const handleConnect = async () => {
    if (!shopInput.trim()) {
      alert('Please enter your Shopify store domain')
      return
    }

    setConnecting(true)
    try {
      // Get OAuth URL from API
      const response = await fetch(
        `/api/shopify/connect?shop=${encodeURIComponent(shopInput)}&storeId=${storeId}`
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to initiate connection')
      }

      const data = await response.json()

      // Redirect to Shopify OAuth
      window.location.href = data.authUrl
    } catch (error: any) {
      console.error('Error connecting Shopify:', error)
      alert(error.message || 'Failed to connect Shopify')
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Shopify? This will stop product syncing.')) {
      return
    }

    setDisconnecting(true)
    try {
      const response = await fetch(`/api/stores/${storeId}/shopify/disconnect`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to disconnect')
      }

      alert('Shopify disconnected successfully')
      onStatusChange()
    } catch (error: any) {
      console.error('Error disconnecting Shopify:', error)
      alert(error.message || 'Failed to disconnect Shopify')
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Shopify Integration
      </h3>

      {isConnected ? (
        /* Connected State */
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-green-900 mb-2">
                  Connected to Shopify
                </h4>
                <div className="space-y-2 text-sm text-green-800">
                  <p>
                    <span className="font-medium">Store:</span> {shopDomain}
                  </p>
                  {connectedAt && (
                    <p>
                      <span className="font-medium">Connected:</span>{' '}
                      {new Date(connectedAt).toLocaleDateString()}
                    </p>
                  )}
                  {syncStatus && (
                    <>
                      <p>
                        <span className="font-medium">Products synced:</span>{' '}
                        {syncStatus.productCount}
                      </p>
                      {syncStatus.syncJob && (
                        <p>
                          <span className="font-medium">Last sync:</span>{' '}
                          {new Date(syncStatus.syncJob.started_at).toLocaleDateString()}{' '}
                          {syncStatus.syncJob.status === 'running' && '(syncing...)'}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {canManage && (
            <div className="flex gap-3">
              <button
                onClick={handleSync}
                disabled={syncing || syncStatus?.syncJob?.status === 'running'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncing || syncStatus?.syncJob?.status === 'running'
                  ? 'Syncing...'
                  : 'Sync Products'}
              </button>
              <button
                onClick={() => window.location.href = `/stores/${storeId}/products`}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                View Products
              </button>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {disconnecting ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          )}

          {!canManage && (
            <p className="text-sm text-gray-600">
              Only store owners and admins can manage Shopify connection.
            </p>
          )}
        </div>
      ) : (
        /* Not Connected State */
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-blue-900 mb-2">
                Connect Your Shopify Store
              </h4>
              <p className="text-sm text-blue-800">
                Connect your Shopify store to automatically sync products and enable
                product selection in your funnels.
              </p>
            </div>

            {canManage ? (
              <>
                <div className="mb-4">
                  <label
                    htmlFor="shop-domain"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Shopify Store Domain
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="shop-domain"
                      type="text"
                      value={shopInput}
                      onChange={(e) => setShopInput(e.target.value)}
                      placeholder="mystore.myshopify.com"
                      disabled={connecting}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                    <button
                      onClick={handleConnect}
                      disabled={connecting || !shopInput.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {connecting ? 'Connecting...' : 'Connect'}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-600">
                    Enter your Shopify store domain (e.g., mystore.myshopify.com)
                  </p>
                </div>

                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-gray-900 mb-2">
                    What happens next?
                  </h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">1.</span>
                      <span>You'll be redirected to Shopify to authorize access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">2.</span>
                      <span>Grant permission to read your products</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">3.</span>
                      <span>Your products will be synced automatically</span>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-600">
                Only store owners and admins can connect Shopify.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
