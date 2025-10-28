import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/invites/[token] - Get invitation details
export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = await createClient()
    const token = params.token

    // Get invitation by token
    const { data: invite, error: inviteError } = await supabase
      .from('store_invites')
      .select(
        `
        *,
        stores (
          id,
          name
        ),
        profiles:invited_by (
          full_name,
          email
        )
      `
      )
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

    return NextResponse.json({
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        store: invite.stores,
        invited_by: invite.profiles,
        expires_at: invite.expires_at,
      },
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/invites/[token]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
