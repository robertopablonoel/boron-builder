import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/stores/[id]/funnels - List funnels for store
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // draft, published, archived
    const search = searchParams.get('search')

    // Build query
    let query = supabase
      .from('funnels')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })

    // Apply filters
    if (status && ['draft', 'published', 'archived'].includes(status)) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data: funnels, error: funnelsError } = await query

    if (funnelsError) {
      console.error('Error fetching funnels:', funnelsError)
      return NextResponse.json(
        { error: 'Failed to fetch funnels' },
        { status: 500 }
      )
    }

    return NextResponse.json({ funnels })
  } catch (error) {
    console.error('Unexpected error in GET /api/stores/[id]/funnels:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/stores/[id]/funnels - Create new funnel
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

    // Parse request body
    const body = await request.json()
    const { name, funnel_data } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Funnel name is required' },
        { status: 400 }
      )
    }

    if (!funnel_data) {
      return NextResponse.json(
        { error: 'Funnel data is required' },
        { status: 400 }
      )
    }

    // Create funnel
    const { data: funnel, error: funnelError } = await supabase
      .from('funnels')
      .insert({
        store_id: storeId,
        user_id: user.id,
        name: name.trim(),
        funnel_data,
        status: 'draft',
      })
      .select()
      .single()

    if (funnelError) {
      console.error('Error creating funnel:', funnelError)
      return NextResponse.json(
        { error: 'Failed to create funnel' },
        { status: 500 }
      )
    }

    return NextResponse.json({ funnel }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/stores/[id]/funnels:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
