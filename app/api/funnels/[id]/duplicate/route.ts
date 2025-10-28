import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/funnels/[id]/duplicate - Duplicate funnel
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
    const funnelId = id

    // Get original funnel
    const { data: originalFunnel, error: funnelError } = await supabase
      .from('funnels')
      .select('*')
      .eq('id', funnelId)
      .single()

    if (funnelError || !originalFunnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 })
    }

    // Check if user has access to this store
    const { data: membership, error: membershipError } = await supabase
      .from('store_members')
      .select('role')
      .eq('store_id', originalFunnel.store_id)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Create duplicate funnel
    const { data: duplicateFunnel, error: duplicateError } = await supabase
      .from('funnels')
      .insert({
        store_id: originalFunnel.store_id,
        user_id: user.id,
        name: `Copy of ${originalFunnel.name}`,
        funnel_data: originalFunnel.funnel_data,
        status: 'draft',
        shopify_product_id: originalFunnel.shopify_product_id,
      })
      .select()
      .single()

    if (duplicateError) {
      console.error('Error duplicating funnel:', duplicateError)
      return NextResponse.json(
        { error: 'Failed to duplicate funnel' },
        { status: 500 }
      )
    }

    return NextResponse.json({ funnel: duplicateFunnel }, { status: 201 })
  } catch (error) {
    console.error(
      'Unexpected error in POST /api/funnels/[id]/duplicate:',
      error
    )
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
