import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/stores/[id]/members - List store members
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

    // Get all members of the store with profile information
    const { data: members, error: membersError } = await supabase
      .from('store_members')
      .select(
        `
        role,
        joined_at,
        profiles (
          id,
          email,
          full_name
        )
      `
      )
      .eq('store_id', storeId)

    if (membersError) {
      console.error('Error fetching store members:', membersError)
      return NextResponse.json(
        { error: 'Failed to fetch members' },
        { status: 500 }
      )
    }

    // Transform data to flatten profile information
    const transformedMembers = members.map((member: any) => ({
      user_id: member.profiles.id,
      email: member.profiles.email,
      full_name: member.profiles.full_name,
      role: member.role,
      joined_at: member.joined_at,
    }))

    return NextResponse.json({ members: transformedMembers })
  } catch (error) {
    console.error('Unexpected error in GET /api/stores/[id]/members:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
