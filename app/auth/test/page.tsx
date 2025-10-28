'use client'

import { useAuth } from '@/components/providers/auth-provider'

export default function AuthTestPage() {
  const { user, session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading auth state...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Auth Infrastructure Test</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Status:</span>{' '}
              {user ? (
                <span className="text-green-600">✓ Authenticated</span>
              ) : (
                <span className="text-red-600">✗ Not Authenticated</span>
              )}
            </p>
            <p>
              <span className="font-medium">Loading:</span> {loading ? 'Yes' : 'No'}
            </p>
          </div>
        </div>

        {user && (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">User Info</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">ID:</span> {user.id}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p>
                  <span className="font-medium">Created:</span>{' '}
                  {new Date(user.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Session Info</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Access Token:</span>{' '}
                  {session?.access_token ? '✓ Present' : '✗ Missing'}
                </p>
                <p>
                  <span className="font-medium">Expires At:</span>{' '}
                  {session?.expires_at
                    ? new Date(session.expires_at * 1000).toLocaleString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </>
        )}

        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">
              No user authenticated
            </h2>
            <p className="text-yellow-700 mb-4">
              Sign up or sign in to test the authentication system.
            </p>
            <div className="space-x-4">
              <a
                href="/auth/signup"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Sign Up
              </a>
              <a
                href="/auth/signin"
                className="inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Sign In
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
