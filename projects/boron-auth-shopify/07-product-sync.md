# Task 07: Product Sync & Integration

**Status:** 🔲 Not Started
**Dependencies:** Task 06 (Shopify OAuth)
**Estimated Time:** 8-10 hours

## Overview
Implement product syncing from Shopify stores, including initial sync, periodic updates, and product selection in funnel builder.

## Goals
- [ ] Implement initial product sync on connection
- [ ] Create products list UI
- [ ] Build product picker for funnel builder
- [ ] Add manual sync trigger
- [ ] Implement periodic sync (cron/edge function)
- [ ] Handle sync errors and retries
- [ ] Track sync jobs

## Database Tables (Already Created)
- `shopify_products` - Cached product data
- `sync_jobs` - Sync job tracking and status

## Implementation

### 1. Initial Product Sync

#### On Shopify Connection
After successful OAuth:
- Trigger initial product sync
- Create sync job record
- Fetch all products from Shopify API
- Store in `shopify_products` table
- Update sync job status
- Show progress to user

#### Shopify API Integration
Use GraphQL API for better performance:
```graphql
query GetProducts($cursor: String) {
  products(first: 50, after: $cursor) {
    edges {
      node {
        id
        title
        description
        priceRangeV2 {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        compareAtPriceRange {
          minVariantPrice {
            amount
          }
        }
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 100) {
          edges {
            node {
              id
              title
              price
              compareAtPrice
              inventoryQuantity
            }
          }
        }
        tags
        vendor
        productType
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

### 2. Product Sync API Routes

#### `POST /api/stores/[storeId]/shopify/sync`
Manually trigger product sync:
- Check if store has Shopify connected
- Create new sync job
- Start sync in background
- Return sync job ID
- User can poll for status

#### `GET /api/stores/[storeId]/shopify/sync/[jobId]`
Get sync job status:
- Return job status (pending/running/completed/failed)
- Products synced count
- Errors if any
- Progress percentage

#### `GET /api/stores/[storeId]/shopify/products`
List synced products:
- Filter by search query
- Paginate results
- Sort by name, price, date
- Return cached product data

#### `GET /api/stores/[storeId]/shopify/products/[id]`
Get product details:
- Return full product data
- Include variants and images

### 3. Sync Worker

Create background job worker:
- File: `/lib/shopify/sync-worker.ts`
- Fetch products in batches (50 per page)
- Handle pagination with cursor
- Transform Shopify data to our schema
- Upsert products in database
- Update sync job progress
- Handle rate limiting
- Implement exponential backoff on errors
- Send completion notification

### 4. Periodic Sync (Optional for MVP)

#### Using Vercel Cron
Create cron job: `/app/api/cron/sync-shopify/route.ts`
- Runs every 6 hours
- Finds all stores with Shopify connected
- Triggers sync for each store
- Sends error alerts if sync fails

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-shopify",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

#### Alternative: Supabase Edge Function
Create edge function with pg_cron:
```sql
SELECT cron.schedule(
  'sync-shopify-products',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url:='https://boron-builder.vercel.app/api/cron/sync-shopify',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer SECRET"}'::jsonb
  );
  $$
);
```

### 5. Products List Page (`/stores/[storeId]/products`)

Show synced products:
- Grid view of product cards
- Search bar
- Filter by:
  - Product type
  - Price range
  - In stock / Out of stock
- Sort options
- "Sync Now" button
- Last sync timestamp
- Empty state if not connected

Product card shows:
- Product image
- Title
- Price
- Variant count
- Stock status
- "Use in Funnel" button

### 6. Product Picker Component

#### `<ProductPicker>`
Modal component for selecting products in builder:
- Search products
- Grid of product cards
- Select button
- Shows selected product
- Close modal

#### Integration in Builder
Add "Select Product" button in builder:
- Opens product picker modal
- User selects product
- Product data populates funnel fields:
  - Title
  - Description
  - Price
  - Images
  - Variants
- AI can use product data for better copy
- Store product reference in funnel

### 7. Sync Status UI

#### Settings Page - Shopify Tab
Show sync information:
- Last sync timestamp
- Products synced count
- Sync status badge
- "Sync Now" button
- Sync history (last 5 jobs)
- Error logs if sync failed

#### Sync Progress Modal
Show during sync:
- Progress bar
- "Syncing X of Y products"
- Cancel button
- Estimated time remaining
- Success message on completion

### 8. Components

#### `<ProductCard>`
Display product with:
- Thumbnail image
- Title
- Price (with compare-at price)
- Stock badge
- Quick view button

#### `<ProductGrid>`
Grid container with:
- Responsive layout
- Loading skeleton
- Empty state
- Pagination

#### `<SyncStatusBadge>`
Badge showing:
- Syncing (blue, animated)
- Synced (green)
- Failed (red)
- Never synced (gray)

#### `<SyncHistoryList>`
List of recent syncs:
- Job timestamp
- Status
- Products synced
- Duration
- View details link

### 9. Data Transformation

Transform Shopify product to our schema:
```typescript
interface ShopifyProduct {
  id: string
  user_id: string
  store_id: string
  shopify_product_id: string
  title: string
  description: string
  price: number
  compare_at_price?: number
  currency: string
  images: Array<{ url: string; alt?: string }>
  featured_image: string
  variants: Array<{
    id: string
    title: string
    price: number
    compare_at_price?: number
    inventory: number
  }>
  tags: string[]
  vendor: string
  product_type: string
  last_synced_at: Date
}
```

### 10. Error Handling

#### Sync Errors
- Network timeouts
- Rate limit exceeded
- Invalid access token (expired/revoked)
- Product fetch errors
- Database write errors

#### Retry Strategy
- Automatic retry on transient errors
- Exponential backoff: 1s, 2s, 4s, 8s, 16s
- Max 5 retries
- Log permanent failures
- Alert user if sync repeatedly fails

#### Rate Limiting
- Respect Shopify API limits
- Implement request queue
- Use GraphQL cost calculation
- Slow down if approaching limit
- Cache expensive queries

### 11. Performance Optimization

#### Batch Processing
- Sync 50 products per API call
- Use pagination cursors
- Process in chunks

#### Caching
- Cache product list queries
- Use Supabase built-in caching
- Invalidate cache on sync
- Set reasonable TTL (6 hours)

#### Database Optimization
- Use upsert for products (ON CONFLICT)
- Index on shopify_product_id
- Index on store_id
- Clean up old sync jobs (keep last 50)

## Testing
- [ ] Initial sync creates all products
- [ ] Can manually trigger sync
- [ ] Periodic sync runs on schedule
- [ ] Can view synced products list
- [ ] Can search products
- [ ] Can filter products
- [ ] Product picker works in builder
- [ ] Selected product populates funnel
- [ ] Handles sync errors gracefully
- [ ] Retries failed syncs
- [ ] Rate limiting prevents API errors
- [ ] Shows sync progress to user
- [ ] Sync history is logged
- [ ] Can handle large catalogs (1000+ products)

## Future Enhancements
- [ ] Webhook integration for real-time updates
- [ ] Inventory tracking
- [ ] Product variants selection
- [ ] Collections/categories sync
- [ ] Product recommendations based on AI
- [ ] Bulk product operations
- [ ] Product analytics (which products used most)
- [ ] Multi-currency support
- [ ] Image optimization/CDN

## Notes
- Shopify API uses cursor-based pagination
- GraphQL is more efficient than REST for bulk queries
- Store minimal product data (don't cache everything)
- Consider adding webhook support for real-time sync
- Product images should be proxied/optimized
- Large stores (>1000 products) may need background processing
- Consider adding search index (Algolia/Meilisearch) for better search
