'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { FunnelCard } from '@/components/funnels/funnel-card'

interface Funnel {
  id: string
  name: string
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
  published_at: string | null
}

export default function FunnelsPage() {
  const params = useParams()
  const router = useRouter()
  const storeId = params.id as string

  const [funnels, setFunnels] = useState<Funnel[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all')
  const [search, setSearch] = useState('')

  const fetchFunnels = async () => {
    try {
      const url = new URL(`/api/stores/${storeId}/funnels`, window.location.origin)
      if (filter !== 'all') {
        url.searchParams.set('status', filter)
      }
      if (search) {
        url.searchParams.set('search', search)
      }

      const response = await fetch(url.toString())
      if (response.ok) {
        const data = await response.json()
        setFunnels(data.funnels)
      }
    } catch (error) {
      console.error('Error fetching funnels:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFunnels()
  }, [storeId, filter, search])

  const handleCreateFunnel = () => {
    // Navigate to builder with store context
    router.push(`/builder?storeId=${storeId}`)
  }

  const handleEditFunnel = (funnelId: string) => {
    router.push(`/builder?funnelId=${funnelId}`)
  }

  const handleDuplicateFunnel = async (funnelId: string) => {
    try {
      const response = await fetch(`/api/funnels/${funnelId}/duplicate`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setFunnels([data.funnel, ...funnels])
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to duplicate funnel')
      }
    } catch (error) {
      console.error('Error duplicating funnel:', error)
      alert('Failed to duplicate funnel')
    }
  }

  const handleDeleteFunnel = async (funnelId: string) => {
    if (!confirm('Are you sure you want to delete this funnel?')) return

    try {
      const response = await fetch(`/api/funnels/${funnelId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setFunnels(funnels.filter((f) => f.id !== funnelId))
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete funnel')
      }
    } catch (error) {
      console.error('Error deleting funnel:', error)
      alert('Failed to delete funnel')
    }
  }

  const handlePublishFunnel = async (funnelId: string) => {
    try {
      const response = await fetch(`/api/funnels/${funnelId}/publish`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setFunnels(
          funnels.map((f) => (f.id === funnelId ? data.funnel : f))
        )
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to publish funnel')
      }
    } catch (error) {
      console.error('Error publishing funnel:', error)
      alert('Failed to publish funnel')
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Funnels</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your sales funnels
            </p>
          </div>
          <button
            onClick={handleCreateFunnel}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Funnel
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search funnels..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('draft')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'draft'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Draft
              </button>
              <button
                onClick={() => setFilter('published')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'published'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Published
              </button>
            </div>
          </div>
        </div>

        {/* Funnels Grid */}
        {funnels.length === 0 ? (
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all'
                ? 'No funnels yet'
                : `No ${filter} funnels`}
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first AI-powered sales funnel
            </p>
            <button
              onClick={handleCreateFunnel}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Your First Funnel
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {funnels.map((funnel) => (
              <FunnelCard
                key={funnel.id}
                funnel={funnel}
                onEdit={() => handleEditFunnel(funnel.id)}
                onDuplicate={() => handleDuplicateFunnel(funnel.id)}
                onDelete={() => handleDeleteFunnel(funnel.id)}
                onPublish={() => handlePublishFunnel(funnel.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
