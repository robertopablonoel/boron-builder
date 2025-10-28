import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Helper function to verify Shopify HMAC
function verifyShopifyHmac(query: URLSearchParams, hmac: string): boolean {
  const message = Array.from(query.entries())
    .filter(([key]) => key !== 'hmac')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  const generatedHash = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET!)
    .update(message)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(hmac),
    Buffer.from(generatedHash)
  )
}

// GET /api/shopify/callback - Handle Shopify OAuth callback
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.redirect(
        new URL('/auth/signin', request.url)
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const shop = searchParams.get('shop')
    const state = searchParams.get('state')
    const hmac = searchParams.get('hmac')

    if (!code || !shop || !state || !hmac) {
      return NextResponse.redirect(
        new URL('/stores?error=missing_params', request.url)
      )
    }

    // Verify HMAC
    if (!verifyShopifyHmac(searchParams, hmac)) {
      console.error('Invalid HMAC signature')
      return NextResponse.redirect(
        new URL('/stores?error=invalid_hmac', request.url)
      )
    }

    // Extract storeId from state
    const [stateToken, storeId] = state.split(':')

    if (!storeId) {
      return NextResponse.redirect(
        new URL('/stores?error=invalid_state', request.url)
      )
    }

    // Exchange code for access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY!,
        client_secret: process.env.SHOPIFY_API_SECRET!,
        code,
      }),
    })

    if (!tokenResponse.ok) {
      console.error('Failed to get access token:', await tokenResponse.text())
      return NextResponse.redirect(
        new URL('/stores?error=token_exchange_failed', request.url)
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    if (!accessToken) {
      return NextResponse.redirect(
        new URL('/stores?error=no_access_token', request.url)
      )
    }

    // Verify user has access to store
    const { data: membership } = await supabase
      .from('store_members')
      .select('role')
      .eq('store_id', storeId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.redirect(
        new URL('/stores?error=access_denied', request.url)
      )
    }

    // Update store with Shopify connection
    const { error: updateError } = await supabase
      .from('stores')
      .update({
        shopify_connected: true,
        shopify_store_domain: shop,
        shopify_access_token: accessToken, // In production, encrypt this
        shopify_connected_at: new Date().toISOString(),
      })
      .eq('id', storeId)

    if (updateError) {
      console.error('Error updating store:', updateError)
      return NextResponse.redirect(
        new URL('/stores?error=update_failed', request.url)
      )
    }

    // Redirect to store settings with success message
    return NextResponse.redirect(
      new URL(`/stores/${storeId}/settings?tab=shopify&success=connected`, request.url)
    )
  } catch (error) {
    console.error('Error in Shopify callback:', error)
    return NextResponse.redirect(
      new URL('/stores?error=internal_error', request.url)
    )
  }
}
