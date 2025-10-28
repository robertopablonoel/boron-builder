import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/stores/[id] - Get store details
export async function GET(
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

    // Check if user is a member of this store
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

    // Get store details
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single()

    if (storeError || !store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Get member count
    const { count: memberCount } = await supabase
      .from('store_members')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', storeId)

    return NextResponse.json({
      store: {
        ...store,
        role: membership.role,
        member_count: memberCount || 0,
      },
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/stores/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/stores/[id] - Update store
export async function PATCH(
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
        { error: 'Only owners and admins can update store settings' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Store name is required' },
        { status: 400 }
      )
    }

    // Update store
    const { data: store, error: updateError } = await supabase
      .from('stores')
      .update({ name: name.trim() })
      .eq('id', storeId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating store:', updateError)
      return NextResponse.json(
        { error: 'Failed to update store' },
        { status: 500 }
      )
    }

    return NextResponse.json({ store })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/stores/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/stores/[id] - Delete store (owner only)
export async function DELETE(
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

    // Check if user is owner
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('owner_id')
      .eq('id', storeId)
      .single()

    if (storeError || !store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    if (store.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the store owner can delete the store' },
        { status: 403 }
      )
    }

    // Delete store (CASCADE will handle store_members, funnels, etc.)
    const { error: deleteError } = await supabase
      .from('stores')
      .delete()
      .eq('id', storeId)

    if (deleteError) {
      console.error('Error deleting store:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete store' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/stores/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
