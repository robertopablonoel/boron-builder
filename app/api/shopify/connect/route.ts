import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// GET /api/shopify/connect - Initiate Shopify OAuth
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const shop = searchParams.get('shop')
    const storeId = searchParams.get('storeId')

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop domain is required' },
        { status: 400 }
      )
    }

    if (!storeId) {
      return NextResponse.json(
        { error: 'Store ID is required' },
        { status: 400 }
      )
    }

    // Validate shop domain format
    const shopDomain = shop.replace(/^https?:\/\//, '').replace(/\/$/, '')
    if (!shopDomain.endsWith('.myshopify.com')) {
      return NextResponse.json(
        { error: 'Invalid Shopify domain. Must end with .myshopify.com' },
        { status: 400 }
      )
    }

    // Check if user has access to this store
    const { data: membership } = await supabase
      .from('store_members')
      .select('role')
      .eq('store_id', storeId)
      .eq('user_id', user.id)
      .single()

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Only store owners and admins can connect Shopify' },
        { status: 403 }
      )
    }

    // Generate state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex')

    // Store state in session (in production, use proper session storage)
    // For now, we'll pass it through the OAuth flow and verify on callback

    // Build Shopify OAuth URL
    const scopes = process.env.SHOPIFY_SCOPES || 'read_products,read_product_listings'
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/shopify/callback`

    const authUrl = `https://${shopDomain}/admin/oauth/authorize?` +
      new URLSearchParams({
        client_id: process.env.SHOPIFY_API_KEY!,
        scope: scopes,
        redirect_uri: redirectUri,
        state: `${state}:${storeId}`, // Include storeId in state
      })

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Error in Shopify connect:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
