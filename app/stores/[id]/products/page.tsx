'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

interface Product {
  id: string
  shopify_product_id: string
  title: string
  description: string
  price: number
  compare_at_price: number | null
  featured_image: string | null
  vendor: string
  product_type: string
  tags: string[]
  variants: any[]
}

export default function ProductsPage() {
  const params = useParams()
  const router = useRouter()
  const storeId = params.id as string

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)

  const fetchProducts = async () => {
    try {
      const url = new URL(`/api/stores/${storeId}/shopify/products`, window.location.origin)
      if (search) {
        url.searchParams.set('search', search)
      }

      const response = await fetch(url.toString())
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
        setTotal(data.total)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [storeId, search])

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

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/stores/${storeId}/settings?tab=shopify`)}
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
                <h1 className="text-3xl font-bold text-gray-900">Shopify Products</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {total} {total === 1 ? 'product' : 'products'} synced
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-6">
              {search ? 'Try a different search term' : 'Sync your Shopify products to see them here'}
            </p>
            <button
              onClick={() => router.push(`/stores/${storeId}/settings?tab=shopify`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Go to Settings
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
              >
                {/* Product Image */}
                {product.featured_image ? (
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={product.featured_image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                )}

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.title}
                  </h3>

                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-lg font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.compare_at_price && product.compare_at_price > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.compare_at_price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    {product.vendor && (
                      <p>
                        <span className="font-medium">Vendor:</span> {product.vendor}
                      </p>
                    )}
                    {product.variants && (
                      <p>
                        <span className="font-medium">Variants:</span> {product.variants.length}
                      </p>
                    )}
                  </div>

                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {product.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {product.tags.length > 3 && (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{product.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
