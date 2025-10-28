# Task 02: Auth Infrastructure

⏱ **Estimated Time:** 3 hours

## Objectives

- Create Supabase client utilities (client-side and server-side)
- Set up Next.js middleware for auth protection
- Create AuthProvider context for client components
- Set up auth hooks for easy access to user session

## Prerequisites

- ✅ Task 00 completed (Supabase credentials configured)
- ✅ Task 01 completed (Database schema created)

## Steps

### 1. Create Supabase Client (Browser)

Create `lib/supabase/client.ts`:

```typescript
// Client-side Supabase client for browser use
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 2. Create Supabase Server Client

Create `lib/supabase/server.ts`:

```typescript
// Server-side Supabase client for API routes and Server Components
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

### 3. Create Middleware

Create `middleware.ts` in project root:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Implementation details...
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/funnels/:path*',
    '/api/shopify/:path*',
  ],
}
```

### 4. Create Auth Context

Create `components/providers/AuthProvider.tsx`:

```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

// Context and provider implementation...
```

### 5. Create Auth Hooks

Create `lib/hooks/useAuth.ts`:

```typescript
'use client'

import { useContext } from 'react'
import { AuthContext } from '@/components/providers/AuthProvider'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

## Acceptance Criteria

- ✅ Supabase client utilities created
- ✅ Middleware protects dashboard routes
- ✅ AuthProvider wraps app
- ✅ useAuth hook accessible
- ✅ No TypeScript errors

## Next Steps

➡️ **Proceed to Task 03: Auth Pages**

---

**Status:** ⏳ Complete this task before moving to Task 03

*Full implementation details to be added when ready to implement*
