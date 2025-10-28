import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PATCH /api/stores/[id]/members/[userId] - Update member role
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
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

    const { id, userId } = await params


    const storeId = id
    const targetUserId = params.userId

    // Check if current user is owner (only owners can change roles)
    const { data: currentUserMembership, error: membershipError } =
      await supabase
        .from('store_members')
        .select('role')
        .eq('store_id', storeId)
        .eq('user_id', user.id)
        .single()

    if (membershipError || !currentUserMembership) {
      return NextResponse.json(
        { error: 'Store not found or access denied' },
        { status: 404 }
      )
    }

    if (currentUserMembership.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only the store owner can change member roles' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { role } = body

    if (!role || !['admin', 'member'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "admin" or "member"' },
        { status: 400 }
      )
    }

    // Cannot change owner's role
    const { data: targetMember } = await supabase
      .from('store_members')
      .select('role')
      .eq('store_id', storeId)
      .eq('user_id', targetUserId)
      .single()

    if (targetMember?.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot change the owner role' },
        { status: 400 }
      )
    }

    // Update member role
    const { error: updateError } = await supabase
      .from('store_members')
      .update({ role })
      .eq('store_id', storeId)
      .eq('user_id', targetUserId)

    if (updateError) {
      console.error('Error updating member role:', updateError)
      return NextResponse.json(
        { error: 'Failed to update member role' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, role })
  } catch (error) {
    console.error(
      'Unexpected error in PATCH /api/stores/[id]/members/[userId]:',
      error
    )
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/stores/[id]/members/[userId] - Remove member
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
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

    const { id, userId } = await params


    const storeId = id
    const targetUserId = params.userId

    // Check if current user is owner or admin
    const { data: currentUserMembership, error: membershipError } =
      await supabase
        .from('store_members')
        .select('role')
        .eq('store_id', storeId)
        .eq('user_id', user.id)
        .single()

    if (membershipError || !currentUserMembership) {
      return NextResponse.json(
        { error: 'Store not found or access denied' },
        { status: 404 }
      )
    }

    if (
      currentUserMembership.role !== 'owner' &&
      currentUserMembership.role !== 'admin'
    ) {
      return NextResponse.json(
        { error: 'Only owners and admins can remove members' },
        { status: 403 }
      )
    }

    // Cannot remove owner
    const { data: targetMember } = await supabase
      .from('store_members')
      .select('role')
      .eq('store_id', storeId)
      .eq('user_id', targetUserId)
      .single()

    if (targetMember?.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot remove the store owner' },
        { status: 400 }
      )
    }

    // Admins can only remove members, not other admins
    if (
      currentUserMembership.role === 'admin' &&
      targetMember?.role === 'admin'
    ) {
      return NextResponse.json(
        { error: 'Admins cannot remove other admins' },
        { status: 403 }
      )
    }

    // Remove member
    const { error: deleteError } = await supabase
      .from('store_members')
      .delete()
      .eq('store_id', storeId)
      .eq('user_id', targetUserId)

    if (deleteError) {
      console.error('Error removing member:', deleteError)
      return NextResponse.json(
        { error: 'Failed to remove member' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(
      'Unexpected error in DELETE /api/stores/[id]/members/[userId]:',
      error
    )
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
