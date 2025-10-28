import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/invites/[token]/decline - Decline invitation
export async function POST(
  request: Request,
  { params }: { params: { token: string } }
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

    const token = params.token

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

    // Update invitation status to declined
    const { error: updateError } = await supabase
      .from('store_invites')
      .update({ status: 'declined' })
      .eq('id', invite.id)

    if (updateError) {
      console.error('Error declining invitation:', updateError)
      return NextResponse.json(
        { error: 'Failed to decline invitation' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(
      'Unexpected error in POST /api/invites/[token]/decline:',
      error
    )
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
