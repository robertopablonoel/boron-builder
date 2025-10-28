import { requireAuth, getUserProfile } from '@/lib/auth'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import Link from 'next/link'

export default async function DashboardPage() {
  const user = await requireAuth()
  const profile = await getUserProfile(user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex gap-4">
              <Link
                href="/builder"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Open Builder
              </Link>
              <Link
                href="/auth/test"
                className="text-sm text-blue-600 hover:text-blue-700 px-4 py-2"
              >
                View Auth Status →
              </Link>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-green-800">
                    Authentication Working!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>You successfully signed in and accessed a protected route.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Your Account
                </h2>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="bg-gray-50 px-4 py-4 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {profile?.full_name || 'Not set'}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500">User ID</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono text-xs">
                      {user.id}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500">
                      Account Created
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(user.created_at).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="pt-6 border-t">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Next Steps
                </h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <ul className="list-disc list-inside space-y-2 text-sm text-blue-900">
                    <li>Task 04: Create Store Management (create/join stores)</li>
                    <li>Task 05: Implement Funnel CRUD operations</li>
                    <li>Task 06: Add Shopify OAuth integration</li>
                    <li>Task 07: Build Product Sync</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
