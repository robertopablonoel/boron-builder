# Shopify Integration - Quick Start

## TL;DR

**You need to:**
1. Create ONE Shopify app (5 minutes)
2. Add API credentials to `.env.local` (1 minute)
3. Your users can then connect their stores (they don't need to do anything special)

## Why You Need a Shopify App

Think of it like this:
- **Stripe integration**: You need a Stripe account → your users connect their bank accounts to Stripe
- **Shopify integration**: You need a Shopify app → your users connect their stores to your app

Your app acts as a **bridge** between Boron Builder and all your users' Shopify stores.

## Visual Flow

```
┌─────────────────────────────────────┐
│  YOU (Boron Builder Owner)          │
│  • Create Shopify app (once)        │
│  • Get API key + secret              │
│  • Add to .env.local                 │
└──────────────┬──────────────────────┘
               │
               │ Your app can now facilitate OAuth
               │
┌──────────────▼──────────────────────┐
│  YOUR USERS                          │
│  • Go to Settings → Shopify          │
│  • Enter: mystore.myshopify.com      │
│  • Click "Connect"                   │
│  • Authorize your app                │
└──────────────┬──────────────────────┘
               │
               │ OAuth flow gives you an access token
               │
┌──────────────▼──────────────────────┐
│  RESULT                              │
│  • Token stored in your database     │
│  • You can fetch their products      │
│  • They can use products in builder  │
└──────────────────────────────────────┘
```

## Step 1: Create Your Shopify App (5 minutes)

### Go to Shopify Partners
1. Visit: https://partners.shopify.com
2. Sign up (it's free)
3. Click **Apps** → **Create app** → **Public app**

### Fill in App Details
```
App name: Boron Builder
App URL: http://localhost:3001
Redirect URLs: http://localhost:3001/api/shopify/callback
```

### Get Your Credentials
After creating, you'll see:
```
API key:    abc123xyz... ← Copy this
API secret: def456uvw... ← Copy this
```

## Step 2: Add to Environment Variables (1 minute)

Edit `.env.local`:
```bash
SHOPIFY_API_KEY=abc123xyz...        # ← Paste your API key
SHOPIFY_API_SECRET=def456uvw...     # ← Paste your API secret
SHOPIFY_SCOPES=read_products,read_product_listings
```

Restart your dev server:
```bash
npm run dev
```

## Step 3: Test It Works

### Create a Test Store (Optional)
In Shopify Partners:
1. Go to **Stores** → **Add store** → **Development store**
2. Name it: `boron-test`
3. Add a few test products

### Connect Your Test Store
1. Open: http://localhost:3001
2. Sign in / Sign up
3. Create a store in Boron Builder
4. Go to Settings → Shopify tab
5. Enter: `boron-test.myshopify.com`
6. Click **Connect**
7. You'll be redirected to Shopify → Click **Install**
8. Redirected back → Connection successful!

### Sync Products
1. Click **Sync Products**
2. Wait for sync to complete
3. Click **View Products** → See your synced products
4. Go to Builder → Click **Select Product** → Choose a product

## What Your Users Will See

```
User opens Boron Builder
  ↓
Goes to Store Settings → Shopify
  ↓
Sees: [ Enter your Shopify domain: _______.myshopify.com ] [Connect]
  ↓
User enters their store domain and clicks Connect
  ↓
Redirected to Shopify.com to authorize
  ↓
Shopify asks: "Allow Boron Builder to read your products?"
  ↓
User clicks "Install"
  ↓
Redirected back to Boron Builder
  ↓
✓ Connected! Can now sync products
```

## Common Questions

### "Do my users need to create Shopify apps?"
**No.** Only you create the app. Your users just authorize your app to access their stores.

### "Can multiple users connect to Boron Builder?"
**Yes.** Each user can connect their own Shopify store. The access tokens are stored separately.

### "What if I don't have a Shopify store?"
**That's fine.** You're creating an app as a developer, not as a merchant. Create a development store in Shopify Partners for testing.

### "Do I need to publish my app to the Shopify App Store?"
**No.** Your app is "public" (meaning anyone can install it via OAuth), but it doesn't need to be listed in the App Store.

### "What happens in production?"
Same process, but:
1. Update redirect URL to your production domain: `https://boron.com/api/shopify/callback`
2. Set production environment variables
3. Users connect the same way

### "Is this the standard way?"
**Yes!** This is exactly how apps like Klaviyo, Smile.io, and thousands of other Shopify integrations work.

## Troubleshooting

### "The connection fails"
Check:
- [ ] `SHOPIFY_API_KEY` is set correctly
- [ ] `SHOPIFY_API_SECRET` is set correctly
- [ ] Redirect URL in Shopify app matches `http://localhost:3001/api/shopify/callback`
- [ ] Dev server was restarted after adding env variables

### "HMAC verification failed"
- Your `SHOPIFY_API_SECRET` doesn't match your app
- Double-check you copied it correctly

### "Redirect URL mismatch"
- Your `NEXT_PUBLIC_APP_URL` must match the URL you're accessing
- For local dev: `http://localhost:3001`
- For production: `https://your-domain.com`

## Next Steps

Once connected, your users can:
- ✅ Sync products from their Shopify store
- ✅ View all synced products
- ✅ Select products when building funnels
- ✅ Product data auto-populates in funnel templates
- ✅ Sync products anytime with one click

## Resources

- 📖 Full setup guide: `/SHOPIFY_SETUP.md`
- 🔗 Shopify Partners: https://partners.shopify.com
- 📚 Shopify OAuth docs: https://shopify.dev/docs/apps/auth/oauth
- 💬 Questions? Check `/SHOPIFY_SETUP.md` FAQ section

---

**Ready to test?** Follow steps 1-3 above and you'll be syncing products in under 10 minutes!
