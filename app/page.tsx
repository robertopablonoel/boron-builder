'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { LandingPage } from '@/components/landing/landing-page'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  // Show landing page for unauthenticated users
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <LandingPage />
}
