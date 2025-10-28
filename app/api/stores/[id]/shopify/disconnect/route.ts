import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/stores/[id]/shopify/disconnect - Disconnect Shopify
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params


    const storeId = id

    // Check if user is owner or admin
    const { data: membership, error: membershipError } = await supabase
      .from('store_members')
      .select('role')
      .eq('store_id', storeId)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Store not found or access denied' },
        { status: 404 }
      )
    }

    if (membership.role !== 'owner' && membership.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only store owners and admins can disconnect Shopify' },
        { status: 403 }
      )
    }

    // Update store to remove Shopify connection
    const { error: updateError } = await supabase
      .from('stores')
      .update({
        shopify_connected: false,
        shopify_store_domain: null,
        shopify_access_token: null,
        shopify_connected_at: null,
      })
      .eq('id', storeId)

    if (updateError) {
      console.error('Error disconnecting Shopify:', updateError)
      return NextResponse.json(
        { error: 'Failed to disconnect Shopify' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in Shopify disconnect:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
