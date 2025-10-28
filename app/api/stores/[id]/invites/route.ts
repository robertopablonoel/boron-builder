import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

// GET /api/stores/[id]/invites - List pending invitations for store
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
        { error: 'Only owners and admins can view invitations' },
        { status: 403 }
      )
    }

    // Get pending invitations
    const { data: invites, error: invitesError } = await supabase
      .from('store_invites')
      .select('*')
      .eq('store_id', storeId)
      .eq('status', 'pending')

    if (invitesError) {
      console.error('Error fetching invitations:', invitesError)
      return NextResponse.json(
        { error: 'Failed to fetch invitations' },
        { status: 500 }
      )
    }

    return NextResponse.json({ invites })
  } catch (error) {
    console.error('Unexpected error in GET /api/stores/[id]/invites:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/stores/[id]/invites - Create invitation
export async function POST(
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
        { error: 'Only owners and admins can invite members' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { email, role } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!role || !['admin', 'member'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "admin" or "member"' },
        { status: 400 }
      )
    }

    // Check if user already exists and is already a member
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingProfile) {
      // Check if already a member
      const { data: existingMembership } = await supabase
        .from('store_members')
        .select('id')
        .eq('store_id', storeId)
        .eq('user_id', existingProfile.id)
        .single()

      if (existingMembership) {
        return NextResponse.json(
          { error: 'User is already a member of this store' },
          { status: 400 }
        )
      }
    }

    // Check if there's already a pending invitation
    const { data: existingInvite } = await supabase
      .from('store_invites')
      .select('id')
      .eq('store_id', storeId)
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .single()

    if (existingInvite) {
      return NextResponse.json(
        { error: 'An invitation has already been sent to this email' },
        { status: 400 }
      )
    }

    // Generate unique token
    const token = randomBytes(32).toString('hex')

    // Create invitation
    const { data: invite, error: inviteError } = await supabase
      .from('store_invites')
      .insert({
        store_id: storeId,
        email: email.toLowerCase(),
        role,
        invited_by: user.id,
        token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Error creating invitation:', inviteError)
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      )
    }

    // TODO: Send invitation email with link containing token
    // For now, return the token in the response
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invites/${token}`

    return NextResponse.json(
      {
        invite,
        inviteLink,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error in POST /api/stores/[id]/invites:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
