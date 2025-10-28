import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/invites/[token]/accept - Accept invitation
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
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

    const { token } = await params

    // Get invitation by token
    const { data: invite, error: inviteError } = await supabase
      .from('store_invites')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single()

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: 'Invitation not found or has expired' },
        { status: 404 }
      )
    }

    // Check if invitation has expired
    if (new Date(invite.expires_at) < new Date()) {
      // Update status to expired
      await supabase
        .from('store_invites')
        .update({ status: 'expired' })
        .eq('id', invite.id)

      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      )
    }

    // Get user profile to verify email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single()

    // Check if email matches invitation email
    if (profile?.email.toLowerCase() !== invite.email.toLowerCase()) {
      return NextResponse.json(
        {
          error:
            'This invitation was sent to a different email address. Please sign in with the invited email or ask for a new invitation.',
        },
        { status: 400 }
      )
    }

    // Check if user is already a member
    const { data: existingMembership } = await supabase
      .from('store_members')
      .select('id')
      .eq('store_id', invite.store_id)
      .eq('user_id', user.id)
      .single()

    if (existingMembership) {
      // Update invitation status and return success
      await supabase
        .from('store_invites')
        .update({ status: 'accepted' })
        .eq('id', invite.id)

      return NextResponse.json({
        success: true,
        message: 'You are already a member of this store',
        store_id: invite.store_id,
      })
    }

    // Add user to store_members
    const { error: memberError } = await supabase.from('store_members').insert({
      store_id: invite.store_id,
      user_id: user.id,
      role: invite.role,
    })

    if (memberError) {
      console.error('Error adding member:', memberError)
      return NextResponse.json(
        { error: 'Failed to accept invitation' },
        { status: 500 }
      )
    }

    // Update invitation status
    const { error: updateError } = await supabase
      .from('store_invites')
      .update({ status: 'accepted' })
      .eq('id', invite.id)

    if (updateError) {
      console.error('Error updating invitation status:', updateError)
    }

    return NextResponse.json({
      success: true,
      store_id: invite.store_id,
    })
  } catch (error) {
    console.error(
      'Unexpected error in POST /api/invites/[token]/accept:',
      error
    )
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
