import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/funnels/[id]/publish - Publish funnel
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

    // Get funnel
    const { data: funnel, error: funnelError } = await supabase
      .from('funnels')
      .select('*, stores!inner(id)')
      .eq('id', funnelId)
      .single()

    if (funnelError || !funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 })
    }

    // Check if user is admin or owner
    const { data: membership, error: membershipError } = await supabase
      .from('store_members')
      .select('role')
      .eq('store_id', funnel.store_id)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (membership.role !== 'admin' && membership.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only admins and owners can publish funnels' },
        { status: 403 }
      )
    }

    // Update funnel status to published
    const { data: updatedFunnel, error: updateError } = await supabase
      .from('funnels')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', funnelId)
      .select()
      .single()

    if (updateError) {
      console.error('Error publishing funnel:', updateError)
      return NextResponse.json(
        { error: 'Failed to publish funnel' },
        { status: 500 }
      )
    }

    return NextResponse.json({ funnel: updatedFunnel })
  } catch (error) {
    console.error('Unexpected error in POST /api/funnels/[id]/publish:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
