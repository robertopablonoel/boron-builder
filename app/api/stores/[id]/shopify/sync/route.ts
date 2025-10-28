import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { ShopifyClient } from '@/lib/shopify/client'

// POST /api/stores/[id]/shopify/sync - Trigger product sync
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

    // Check if user has access to store
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

    // Get store with Shopify connection
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('shopify_connected, shopify_store_domain, shopify_access_token')
      .eq('id', storeId)
      .single()

    if (storeError || !store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    if (!store.shopify_connected || !store.shopify_access_token) {
      return NextResponse.json(
        { error: 'Shopify not connected' },
        { status: 400 }
      )
    }

    // Create sync job
    const { data: syncJob, error: syncJobError } = await supabase
      .from('sync_jobs')
      .insert({
        store_id: storeId,
        user_id: user.id,
        type: 'shopify_products',
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (syncJobError) {
      console.error('Error creating sync job:', syncJobError)
      return NextResponse.json(
        { error: 'Failed to create sync job' },
        { status: 500 }
      )
    }

    // Start sync in background (in production, use a job queue)
    syncProducts(
      supabase,
      syncJob.id,
      storeId,
      store.shopify_store_domain!,
      store.shopify_access_token!
    ).catch((error) => {
      console.error('Sync error:', error)
    })

    return NextResponse.json({ syncJob }, { status: 202 })
  } catch (error) {
    console.error('Error in sync products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Background sync function
async function syncProducts(
  supabase: any,
  syncJobId: string,
  storeId: string,
  shopDomain: string,
  accessToken: string
) {
  try {
    const client = new ShopifyClient(shopDomain, accessToken)

    // Fetch products from Shopify
    const products = await client.fetchProducts()

    let syncedCount = 0
    const errors: any[] = []

    // Upsert products in database
    for (const product of products) {
      try {
        const { error: upsertError } = await supabase
          .from('shopify_products')
          .upsert({
            store_id: storeId,
            shopify_product_id: product.id,
            title: product.title,
            description: product.body_html || '',
            price: parseFloat(product.variants[0]?.price || '0'),
            compare_at_price: product.variants[0]?.compare_at_price
              ? parseFloat(product.variants[0].compare_at_price)
              : null,
            currency: 'USD', // TODO: Get from Shopify
            images: product.images.map((img) => ({
              url: img.src,
              alt: img.alt,
            })),
            featured_image: product.images[0]?.src || null,
            variants: product.variants.map((v) => ({
              id: v.id,
              title: v.title,
              price: v.price,
              compare_at_price: v.compare_at_price,
              inventory: v.inventory_quantity,
            })),
            tags: product.tags ? product.tags.split(', ') : [],
            vendor: product.vendor,
            product_type: product.product_type,
            last_synced_at: new Date().toISOString(),
          })

        if (upsertError) {
          console.error('Error upserting product:', upsertError)
          errors.push({
            product_id: product.id,
            error: upsertError.message,
          })
        } else {
          syncedCount++
        }
      } catch (error: any) {
        console.error('Error processing product:', error)
        errors.push({
          product_id: product.id,
          error: error.message,
        })
      }
    }

    // Update sync job
    await supabase
      .from('sync_jobs')
      .update({
        status: errors.length === products.length ? 'failed' : 'completed',
        products_synced: syncedCount,
        errors: errors.length > 0 ? errors : null,
        completed_at: new Date().toISOString(),
      })
      .eq('id', syncJobId)
  } catch (error: any) {
    console.error('Fatal sync error:', error)

    // Update sync job as failed
    await supabase
      .from('sync_jobs')
      .update({
        status: 'failed',
        errors: [{ error: error.message }],
        completed_at: new Date().toISOString(),
      })
      .eq('id', syncJobId)
  }
}
