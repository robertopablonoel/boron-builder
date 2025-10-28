'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface InviteData {
  id: string
  email: string
  role: string
  store: {
    id: string
    name: string
  }
  invited_by: {
    full_name: string | null
    email: string
  }
  expires_at: string
}

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [invite, setInvite] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const response = await fetch(`/api/invites/${token}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load invitation')
        }

        setInvite(data.invite)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchInvite()
  }, [token])

  const handleAccept = async () => {
    setAccepting(true)
    try {
      const response = await fetch(`/api/invites/${token}/accept`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation')
      }

      // Redirect to the store page
      router.push(`/stores/${data.store_id}`)
    } catch (err: any) {
      setError(err.message)
      setAccepting(false)
    }
  }

  const handleDecline = async () => {
    if (!confirm('Are you sure you want to decline this invitation?')) return

    try {
      const response = await fetch(`/api/invites/${token}/decline`, {
        method: 'POST',
      })

      if (response.ok) {
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('Error declining invitation:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
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
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Invalid Invitation
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'This invitation is no longer valid or has expired.'}
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            You're Invited!
          </h2>
          <p className="text-gray-600">
            {invite.invited_by.full_name || invite.invited_by.email} has invited you to
            join their team
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Store</p>
            <p className="font-semibold text-gray-900">{invite.store.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Your Email</p>
            <p className="font-semibold text-gray-900">{invite.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Role</p>
            <p className="font-semibold text-gray-900 capitalize">
              {invite.role}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            disabled={accepting}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {accepting ? 'Accepting...' : 'Accept Invitation'}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          This invitation expires on{' '}
          {new Date(invite.expires_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
