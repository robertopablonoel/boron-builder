import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Helper function to check funnel access
async function checkFunnelAccess(supabase: any, funnelId: string, userId: string) {
  // Get funnel with store information
  const { data: funnel, error: funnelError } = await supabase
    .from('funnels')
    .select('*, stores!inner(id)')
    .eq('id', funnelId)
    .single()

  if (funnelError || !funnel) {
    return { error: 'Funnel not found', status: 404 }
  }

  // Check if user is a member of the store
  const { data: membership, error: membershipError } = await supabase
    .from('store_members')
    .select('role')
    .eq('store_id', funnel.store_id)
    .eq('user_id', userId)
    .single()

  if (membershipError || !membership) {
    return { error: 'Access denied', status: 403 }
  }

  return { funnel, membership }
}

// GET /api/funnels/[id] - Get funnel details
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

    const funnelId = params.id

    // Check access and get funnel
    const result = await checkFunnelAccess(supabase, funnelId, user.id)
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ funnel: result.funnel })
  } catch (error) {
    console.error('Unexpected error in GET /api/funnels/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/funnels/[id] - Update funnel
export async function PATCH(
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

    const funnelId = params.id

    // Check access
    const result = await checkFunnelAccess(supabase, funnelId, user.id)
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    const { funnel, membership } = result

    // Check permissions: creator can edit their own, admin/owner can edit any
    const canEdit =
      funnel.user_id === user.id ||
      membership.role === 'admin' ||
      membership.role === 'owner'

    if (!canEdit) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this funnel' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const updates: any = {}

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Funnel name cannot be empty' },
          { status: 400 }
        )
      }
      updates.name = body.name.trim()
    }

    if (body.funnel_data !== undefined) {
      updates.funnel_data = body.funnel_data
    }

    if (body.status !== undefined) {
      if (!['draft', 'published', 'archived'].includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      updates.status = body.status
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Update funnel
    const { data: updatedFunnel, error: updateError } = await supabase
      .from('funnels')
      .update(updates)
      .eq('id', funnelId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating funnel:', updateError)
      return NextResponse.json(
        { error: 'Failed to update funnel' },
        { status: 500 }
      )
    }

    return NextResponse.json({ funnel: updatedFunnel })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/funnels/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/funnels/[id] - Delete funnel
export async function DELETE(
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

    const funnelId = params.id

    // Check access
    const result = await checkFunnelAccess(supabase, funnelId, user.id)
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    const { funnel, membership } = result

    // Check permissions: creator can delete their own, admin/owner can delete any
    const canDelete =
      funnel.user_id === user.id ||
      membership.role === 'admin' ||
      membership.role === 'owner'

    if (!canDelete) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this funnel' },
        { status: 403 }
      )
    }

    // Delete funnel
    const { error: deleteError } = await supabase
      .from('funnels')
      .delete()
      .eq('id', funnelId)

    if (deleteError) {
      console.error('Error deleting funnel:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete funnel' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/funnels/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
