# Shopify App Setup Guide

## Overview
To enable Shopify integration in Boron Builder, you need to create a Shopify app in the Shopify Partners dashboard. This is a one-time setup that allows all your users to connect their Shopify stores to your application.

## Prerequisites
- Shopify Partners account (free)
- Your Boron Builder deployment URL

## Step-by-Step Setup

### 1. Create a Shopify Partners Account
1. Go to https://partners.shopify.com
2. Sign up for a free Partners account
3. Verify your email

### 2. Create a New App
1. Log into Shopify Partners dashboard
2. Click **Apps** in the left sidebar
3. Click **Create app**
4. Choose **Public app** (not Custom app)
5. Enter app details:
   - **App name**: Boron Builder (or your brand name)
   - **App URL**: `https://your-domain.com` (your deployed URL)
   - **Allowed redirection URL(s)**:
     ```
     https://your-domain.com/api/shopify/callback
     http://localhost:3001/api/shopify/callback
     ```
     (Add both production and local development URLs)

### 3. Get Your API Credentials
After creating the app:
1. Go to **App setup** → **API credentials**
2. Copy the following:
   - **API key** (also called Client ID)
   - **API secret key** (also called Client Secret)

### 4. Configure App Scopes
1. In your app dashboard, go to **Configuration** → **API access**
2. Add the following scopes:
   ```
   read_products
   read_product_listings
   ```
3. Click **Save**

### 5. Add Environment Variables
Add these to your `.env.local` file:

```bash
# Shopify App Credentials
SHOPIFY_API_KEY="your_api_key_here"
SHOPIFY_API_SECRET="your_api_secret_here"
SHOPIFY_SCOPES="read_products,read_product_listings"

# Your app URL (important for OAuth redirect)
NEXT_PUBLIC_APP_URL="http://localhost:3001"  # or your production URL
```

### 6. Test the Integration
1. Restart your Next.js dev server
2. Create a test store (or use an existing one)
3. Go to Store Settings → Shopify tab
4. Enter your Shopify store domain: `yourstore.myshopify.com`
5. Click **Connect**
6. You'll be redirected to Shopify to authorize the app
7. After authorization, you'll be redirected back

### 7. Development Store (Optional)
For testing, create a development store:
1. In Shopify Partners, go to **Stores**
2. Click **Add store** → **Create development store**
3. Fill in details and create
4. Add some test products to the store
5. Use this store to test the integration

## How It Works

### OAuth Flow
```
1. User clicks "Connect" in Boron Builder
2. User is redirected to Shopify authorization page
3. User approves access to their store
4. Shopify redirects back with authorization code
5. Your app exchanges code for access token
6. Access token is stored in your database
7. Your app can now fetch products from user's store
```

### Security
- **HMAC verification**: All callbacks are verified using HMAC signatures
- **CSRF protection**: State parameter prevents cross-site request forgery
- **Token storage**: Access tokens are encrypted in your database
- **Scopes**: App only requests read access to products (no write access)

### Architecture
```
┌─────────────────┐
│  Your Shopify   │  (One app for all users)
│      App        │
└────────┬────────┘
         │
         │ OAuth Flow
         │
┌────────▼────────┐
│  Boron Builder  │
└────────┬────────┘
         │
         │ Stores access tokens
         │
┌────────▼────────────────────────┐
│  Database (one token per store) │
│                                  │
│  Store A → Token A               │
│  Store B → Token B               │
│  Store C → Token C               │
└──────────────────────────────────┘
```

## Production Deployment Checklist

- [ ] Create Shopify app in Partners dashboard
- [ ] Add production redirect URL to app settings
- [ ] Set environment variables in production (Vercel/deployment platform)
- [ ] Test OAuth flow in production
- [ ] Test product sync with real stores
- [ ] Monitor error logs for OAuth failures
- [ ] Set up rate limit monitoring (Shopify API limits)

## Troubleshooting

### "Invalid API key or access token"
- Check that `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET` are correct
- Verify they match your app in Shopify Partners

### "Redirect URL mismatch"
- Ensure `NEXT_PUBLIC_APP_URL` matches your deployment URL
- Check that callback URL is added to app's allowed redirects

### "HMAC verification failed"
- This means the callback wasn't from Shopify
- Check your `SHOPIFY_API_SECRET` is correct
- Ensure callback URL is exactly as configured in Shopify

### "Access denied" or "Insufficient permissions"
- Check that required scopes are added to your app
- User may have denied access during OAuth
- Have user disconnect and reconnect

## Rate Limits

Shopify API has rate limits:
- **REST API**: 2 requests per second (default tier)
- **GraphQL API**: Based on calculated query cost

Our implementation handles this with:
- 500ms delay between requests
- Pagination to avoid large responses
- Error handling for rate limit errors

## Next Steps

Once setup is complete:
1. Users can connect their Shopify stores
2. Products will sync automatically
3. Users can select products in the funnel builder
4. Product data populates funnel templates

## Support Resources

- [Shopify API Documentation](https://shopify.dev/docs/api)
- [OAuth Flow Guide](https://shopify.dev/docs/apps/auth/oauth)
- [API Scopes Reference](https://shopify.dev/docs/api/usage/access-scopes)
- [Partners Dashboard](https://partners.shopify.com)

## FAQ

**Q: Do my users need Shopify Partners accounts?**
A: No, only you (the app owner) need a Partners account. Your users just need Shopify stores.

**Q: Can users have multiple stores connected?**
A: Yes, each store in your system can connect its own Shopify store.

**Q: What if a user revokes access?**
A: The access token becomes invalid. They'll need to reconnect their store.

**Q: Do I need to pay for the Shopify app?**
A: No, creating a public app is free. You only pay if you list it in the Shopify App Store (which is optional).

**Q: Can I use this in development without a public URL?**
A: Yes, use `http://localhost:3001/api/shopify/callback` as a redirect URL in your app settings.
