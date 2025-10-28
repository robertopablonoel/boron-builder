# Task 06: Shopify OAuth Integration

**Status:** 🔲 Not Started
**Dependencies:** Task 04 (Store Management)
**Estimated Time:** 6-8 hours

## Overview
Implement Shopify OAuth flow to allow users to connect their Shopify stores to Boron Builder for product sync.

## Goals
- [ ] Create Shopify app in Shopify Partners
- [ ] Implement OAuth authorization flow
- [ ] Store encrypted access tokens
- [ ] Build connection UI in settings
- [ ] Handle token refresh and errors
- [ ] Add disconnect functionality

## Prerequisites

### 1. Shopify Partners Account
- Sign up at https://partners.shopify.com
- Create a Shopify app
- Configure OAuth redirect URL
- Note API key and API secret

### 2. Shopify App Configuration
Required settings:
- **App name**: Boron Builder
- **App URL**: https://boron-builder.vercel.app (production)
- **Redirect URLs**:
  - https://boron-builder.vercel.app/api/shopify/callback
  - http://localhost:3000/api/shopify/callback (development)
- **Scopes**:
  - `read_products`
  - `read_product_listings`
  - `read_inventory` (optional)

## Implementation

### 1. Environment Variables
Add to `.env.local`:
```bash
# Shopify OAuth
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
SHOPIFY_SCOPES=read_products,read_product_listings
NEXT_PUBLIC_SHOPIFY_REDIRECT_URI=http://localhost:3000/api/shopify/callback
```

### 2. Install Dependencies
```bash
npm install @shopify/shopify-api
```

### 3. Shopify OAuth Routes

#### `GET /api/shopify/connect`
Initiates OAuth flow:
- Receives store domain from user input
- Validates store domain format
- Generates OAuth authorization URL
- Includes:
  - `shop`: Store domain (mystore.myshopify.com)
  - `scopes`: Requested permissions
  - `redirect_uri`: Callback URL
  - `state`: CSRF token (store in session)
- Redirects user to Shopify authorization page

#### `GET /api/shopify/callback`
Handles OAuth callback:
- Validates `state` parameter (CSRF check)
- Validates `hmac` signature
- Exchanges auth code for access token
- Stores encrypted access token in profiles table
- Updates `shopify_connected` flag
- Redirects to settings page with success message

#### `POST /api/shopify/disconnect`
Removes Shopify connection:
- Clears access token from database
- Sets `shopify_connected` to false
- Optionally uninstalls app via Shopify API
- Returns success response

### 4. Shopify Client Helper
Create `/lib/shopify/client.ts`:
```typescript
import { shopifyApi, ApiVersion } from '@shopify/shopify-api'

export function createShopifyClient(shop: string, accessToken: string) {
  const shopify = shopifyApi({
    apiKey: process.env.SHOPIFY_API_KEY!,
    apiSecretKey: process.env.SHOPIFY_API_SECRET!,
    scopes: process.env.SHOPIFY_SCOPES!.split(','),
    hostName: process.env.NEXT_PUBLIC_APP_URL!,
    apiVersion: ApiVersion.October24,
    isEmbeddedApp: false,
  })

  return new shopify.clients.Rest({ session: { shop, accessToken } })
}
```

### 5. Settings Page Updates

#### Shopify Tab (`/settings/shopify`)
Shows connection status:

**When Not Connected:**
- "Connect Shopify Store" section
- Store domain input (e.g., mystore.myshopify.com)
- "Connect" button
- Help text explaining process
- Link to Shopify Partners docs

**When Connected:**
- Connected status badge (green)
- Store domain display
- Connected date
- "Disconnect" button (red)
- Warning about disconnecting
- Link to products tab

#### Connection Flow UX
1. User enters store domain
2. Click "Connect to Shopify"
3. Redirect to Shopify authorization
4. User grants permissions
5. Redirect back to settings
6. Show success toast
7. Enable product sync features

### 6. Database Updates

#### Store Shopify Connection
Update stores table to include:
```sql
ALTER TABLE stores ADD COLUMN IF NOT EXISTS shopify_connected boolean DEFAULT false;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS shopify_store_domain text;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS shopify_access_token text;
```

Note: Tokens should be encrypted at rest using Supabase vault or environment encryption

### 7. Components

#### `<ShopifyConnectForm>`
Form component with:
- Store domain input
- Validation (must end with .myshopify.com)
- Connect button
- Loading state
- Error display

#### `<ShopifyConnectionStatus>`
Status display showing:
- Connection badge
- Store domain
- Connected date
- Quick actions:
  - View products
  - Sync now
  - Disconnect

#### `<ShopifyDisconnectButton>`
Danger zone button with:
- Warning text
- Confirmation modal
- Disconnect action
- Loading state

## Security Considerations

### 1. Token Storage
- Store access tokens encrypted in database
- Use Supabase vault or pgcrypto
- Never expose tokens to client
- Implement token rotation (if Shopify supports)

### 2. CSRF Protection
- Generate random state parameter
- Store in server-side session
- Verify on callback
- Use short expiration (5 minutes)

### 3. HMAC Verification
- Verify Shopify's HMAC signature on callback
- Prevents tampering with OAuth parameters
- Use timing-safe comparison

### 4. Store Domain Validation
- Validate format: `*.myshopify.com`
- Prevent XSS via domain input
- Sanitize all user input

### 5. Rate Limiting
- Implement rate limiting on OAuth routes
- Prevent abuse of connection flow
- Max 5 attempts per hour per user

## Error Handling

### Common Errors
- Invalid store domain
- User denies permissions
- Invalid HMAC signature
- Expired auth code
- Network errors
- API rate limits

### Error Messages
- User-friendly messages for each error type
- Log technical details server-side
- Show retry options
- Link to help documentation

## Testing
- [ ] Can initiate OAuth flow
- [ ] Redirects to Shopify correctly
- [ ] Can grant permissions in Shopify
- [ ] Callback exchanges code for token
- [ ] Token stored encrypted in database
- [ ] Can disconnect Shopify store
- [ ] CSRF state validation works
- [ ] HMAC signature validation works
- [ ] Invalid domains are rejected
- [ ] Error handling shows user-friendly messages
- [ ] Rate limiting prevents abuse

## Notes
- OAuth flow must use HTTPS in production
- Development can use HTTP with localhost
- Store domain must be exact (no http://, no trailing slash)
- Access tokens don't expire but can be revoked by store owner
- Consider adding webhook registration for real-time updates (future)
- Shopify API has rate limits (2 req/sec REST, 1000 pts/sec GraphQL)
- For multi-store support, link to store, not user profile
