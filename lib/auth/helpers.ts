import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Get the current user from the server-side session
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Get the current user or redirect to sign in
 * Use this in Server Components that require authentication
 */
export async function requireAuth(redirectTo?: string) {
  const user = await getCurrentUser()
  if (!user) {
    const params = redirectTo ? `?redirectTo=${redirectTo}` : ''
    redirect(`/auth/signin${params}`)
  }
  return user
}

/**
 * Get the current session from the server
 */
export async function getSession() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticated() {
  const user = await getCurrentUser()
  return !!user
}

/**
 * Get user's profile data
 */
export async function getUserProfile(userId: string) {
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return profile
}

/**
 * Get user's stores (organizations they belong to)
 */
export async function getUserStores(userId: string) {
  const supabase = await createClient()
  const { data: stores, error } = await supabase
    .from('store_members')
    .select(
      `
      role,
      joined_at,
      stores:store_id (
        id,
        name,
        slug,
        shopify_connected,
        plan,
        created_at
      )
    `
    )
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching stores:', error)
    return []
  }

  return stores
}
