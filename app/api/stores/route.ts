import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/stores - List all stores user belongs to
export async function GET() {
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

    // Get all stores where user is a member (RLS now works!)
    const { data: storeMemberships, error: membershipsError } = await supabase
      .from('store_members')
      .select(
        `
        role,
        stores (
          id,
          name,
          created_at,
          updated_at
        )
      `
      )
      .eq('user_id', user.id)

    if (membershipsError) {
      console.error('Error fetching store memberships:', membershipsError)
      return NextResponse.json(
        { error: 'Failed to fetch stores' },
        { status: 500 }
      )
    }

    // Transform the data to include role with each store
    const stores = storeMemberships.map((membership: any) => ({
      ...membership.stores,
      role: membership.role,
    }))

    return NextResponse.json({ stores })
  } catch (error) {
    console.error('Unexpected error in GET /api/stores:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/stores - Create new store
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { createClient: createServiceClient } = await import('@supabase/supabase-js')

    // Get current user (for auth check)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role for store creation (bypasses RLS)
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Parse request body
    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Store name is required' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    // Create store using admin client (bypasses RLS)
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .insert({
        name: name.trim(),
        slug: slug + '-' + Math.random().toString(36).substring(7), // Add random suffix for uniqueness
      })
      .select()
      .single()

    if (storeError) {
      console.error('Error creating store:', storeError)
      return NextResponse.json(
        { error: 'Failed to create store' },
        { status: 500 }
      )
    }

    // Add creator as owner in store_members using admin client (bypasses RLS)
    const { error: memberError } = await supabaseAdmin.from('store_members').insert({
      store_id: store.id,
      user_id: user.id,
      role: 'owner',
    })

    if (memberError) {
      console.error('Error adding owner to store_members:', memberError)
      // Try to rollback store creation
      await supabaseAdmin.from('stores').delete().eq('id', store.id)
      return NextResponse.json(
        { error: 'Failed to create store membership' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        store: {
          ...store,
          role: 'owner',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error in POST /api/stores:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
