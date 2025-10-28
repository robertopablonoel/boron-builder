import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/stores/[id]/shopify/sync-status - Get latest sync job status
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
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

    const storeId = params.id

    // Check if user has access to store
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

    // Get latest sync job
    const { data: syncJob, error: syncJobError } = await supabase
      .from('sync_jobs')
      .select('*')
      .eq('store_id', storeId)
      .eq('type', 'shopify_products')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (syncJobError) {
      // No sync jobs yet
      return NextResponse.json({ syncJob: null })
    }

    // Get product count
    const { count: productCount } = await supabase
      .from('shopify_products')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', storeId)

    return NextResponse.json({
      syncJob,
      productCount: productCount || 0,
    })
  } catch (error) {
    console.error('Error in get sync status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
