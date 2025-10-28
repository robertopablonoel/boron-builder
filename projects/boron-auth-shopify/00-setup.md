# Task 00: Supabase & Shopify Setup

⏱ **Estimated Time:** 3 hours

## Objectives

- Create Supabase project and get credentials
- Set up Supabase database
- Create Shopify Partners account
- Create Shopify development app
- Configure environment variables
- Install required dependencies

## Prerequisites

- Existing Boron Builder MVP project
- Email account for Supabase (free tier)
- Email account for Shopify Partners (free)
- Access to `boron` project directory

## Steps

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub or email
4. Create new project:

   - **Name:** `boron-builder` (or your choice)
   - **Database Password:** Generate strong password (save this!)
   - **Region:** Choose closest to you
   - **Pricing:** Free tier is fine for development

5. Wait 2-3 minutes for project to provision

### 2. Get Supabase Credentials

Once project is ready:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon public key** (starts with `eyJhbGci...`)
   - **Service role key** (starts with `eyJhbGci...`) ⚠️ Keep this secret!

### 3. Create Shopify Partners Account

1. Go to [https://partners.shopify.com](https://partners.shopify.com)
2. Click "Sign up"
3. Fill in details:
   - Choose "Build apps for merchants"
   - Company/Individual name
   - Email
4. Verify email
5. Complete account setup

### 4. Create Shopify Development App

1. In Shopify Partners dashboard, go to **Apps**
2. Click "Create app"
3. Choose "Create app manually"
4. Fill in app details:

   - **App name:** `Boron Builder Dev`
   - **App URL:** `http://localhost:3000` (for now)
   - **Allowed redirection URL(s):** `http://localhost:3000/api/shopify/callback`

5. Click "Create app"

### 5. Configure Shopify App

1. In your new app, go to **Configuration**
2. Under **App setup**, configure:

   - **App URL:** `http://localhost:3000`
   - **Allowed redirection URL(s):**
     ```
     http://localhost:3000/api/shopify/callback
     ```

3. Under **App access**, add scopes:

   - `read_products`
   - `read_product_listings`

4. Save configuration

### 6. Get Shopify Credentials

1. Go to **Overview** tab
2. Copy these values:
   - **API key** (Client ID)
   - **API secret key** ⚠️ Keep this secret!

### 7. Create Development Store (Optional but Recommended)

1. In Partners dashboard, go to **Stores**
2. Click "Add store" → "Development store"
3. Fill in:
   - **Store name:** `boron-test-store`
   - **Store purpose:** Test app development
4. Click "Save"
5. Access your development store

### 8. Install Dependencies

In your `boron` project directory:

```bash
cd /Users/robertonoel/Desktop/repos/boron

# Install Supabase dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/ssr

# Install Shopify dependencies
npm install @shopify/shopify-api

# Install additional utilities
npm install react-hot-toast # For notifications
```

### 9. Update Environment Variables

Update `.env.local`:

```bash
# Existing
ANTHROPIC_API_KEY=sk-ant-your-existing-key

# Supabase (NEW)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Shopify (NEW)
SHOPIFY_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SHOPIFY_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SHOPIFY_SCOPES=read_products,read_product_listings
NEXT_PUBLIC_SHOPIFY_REDIRECT_URI=http://localhost:3000/api/shopify/callback
```

### 10. Update .env.example

Create `.env.example` in project root:

```bash
# Anthropic API Key
# Get from: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-your-api-key-here

# Supabase
# Get from: https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Shopify
# Get from: https://partners.shopify.com/
SHOPIFY_API_KEY=your-api-key-here
SHOPIFY_API_SECRET=your-api-secret-here
SHOPIFY_SCOPES=read_products,read_product_listings
NEXT_PUBLIC_SHOPIFY_REDIRECT_URI=http://localhost:3000/api/shopify/callback
```

### 11. Test Supabase Connection

Create `test-supabase.ts` in project root:

```typescript
// Run: npx tsx test-supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("Testing Supabase connection...");
  console.log("URL:", supabaseUrl);

  try {
    const { data, error } = await supabase.from("_test").select("*").limit(1);

    if (error && error.code !== "PGRST116") {
      // PGRST116 = table doesn't exist (expected)
      console.error("❌ Connection failed:", error.message);
    } else {
      console.log("✅ Supabase connected successfully!");
    }
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

testConnection();
```

Run test:

```bash
npx tsx test-supabase.ts
```

Expected output: `✅ Supabase connected successfully!`

### 12. Create Feature Branch

```bash
git checkout -b feature/auth-shopify
git status
```

## Acceptance Criteria

- ✅ Supabase project created and accessible
- ✅ Supabase credentials saved in `.env.local`
- ✅ Shopify Partners account created
- ✅ Shopify app created with correct redirect URI
- ✅ Shopify credentials saved in `.env.local`
- ✅ All dependencies installed (`npm install` runs without errors)
- ✅ Supabase connection test passes
- ✅ `.env.example` file created
- ✅ Feature branch created

## Environment Variables Checklist

Verify `.env.local` contains:

```bash
# Check all variables are set
cat .env.local | grep "SUPABASE_URL"
cat .env.local | grep "SUPABASE_ANON_KEY"
cat .env.local | grep "SUPABASE_SERVICE_ROLE_KEY"
cat .env.local | grep "SHOPIFY_API_KEY"
cat .env.local | grep "SHOPIFY_API_SECRET"
```

## Project Structure

No code changes yet, but verify your project structure:

```
boron/
├── app/                  # Existing Next.js app
├── components/           # Existing components
├── lib/                  # Existing lib
├── .env.local            # ✅ Updated with new credentials
├── .env.example          # ✅ Created
├── package.json          # ✅ Updated with new dependencies
└── test-supabase.ts      # ✅ Created (temporary)
```

## Troubleshooting

### Supabase connection fails

1. Check URL format: `https://xxxxx.supabase.co` (no trailing slash)
2. Verify anon key is correct (very long string starting with `eyJ`)
3. Check project status in Supabase dashboard
4. Restart dev server after adding env vars

### Shopify API key issues

1. Make sure you're using the **API key** (Client ID), not the API access token
2. Verify redirect URI exactly matches: `http://localhost:3000/api/shopify/callback`
3. Check that scopes are saved: `read_products,read_product_listings`

### npm install errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Security Notes

⚠️ **Never commit these to git:**

- `.env.local` (already in `.gitignore`)
- Supabase service role key
- Shopify API secret

✅ **Safe to commit:**

- `.env.example` (with placeholder values)
- Supabase project URL
- Supabase anon key (public, rate-limited)

## Next Steps

Once setup is complete:

1. ✅ Delete `test-supabase.ts`
2. ✅ Verify all credentials work
3. ✅ Commit `.env.example` to git
4. ➡️ **Proceed to Task 01: Database Schema**

## Quick Reference

### Supabase Dashboard

- URL: https://supabase.com/dashboard
- Your project: `boron-builder-dev`

### Shopify Partners

- URL: https://partners.shopify.com
- Your app: `Boron Builder Dev`

### Development Store

- URL: `https://boron-test-store.myshopify.com/admin`
- Access via Partners dashboard

---

**Status:** ⏳ Complete this task before moving to Task 01
