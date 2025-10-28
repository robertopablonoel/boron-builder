# Task 03: Auth Pages

**Status:** ✅ Completed
**Dependencies:** Task 02 (Auth Infrastructure)
**Estimated Time:** 2-3 hours

## Overview
Create sign-in and sign-up pages with email/password authentication, along with a protected dashboard page.

## Goals
- [ ] Create sign-in page at `/auth/signin`
- [ ] Create sign-up page at `/auth/signup`
- [ ] Create callback handler at `/auth/callback`
- [ ] Create protected dashboard page at `/dashboard`
- [ ] Update landing page to redirect authenticated users
- [ ] Move builder to `/builder` route

## Implementation

### 1. Sign In Page (`/auth/signin`)
Create a simple sign-in form with:
- Email input
- Password input
- "Sign In" button
- Link to sign-up page
- Link back to home
- Error message display
- Loading state during sign-in
- Redirect to dashboard on success

### 2. Sign Up Page (`/auth/signup`)
Create a sign-up form with:
- Full name input
- Email input
- Password input
- "Sign Up" button
- Link to sign-in page
- Link back to home
- Error message display
- Loading state during sign-up
- Redirect to dashboard on success

### 3. Auth Callback Handler (`/auth/callback`)
Create a callback handler for:
- Email verification redirects
- OAuth provider redirects (future)
- Exchanges auth code for session
- Redirects to dashboard

### 4. Dashboard Page (`/dashboard`)
Create a protected dashboard showing:
- Welcome message
- User profile information (email, name, created date)
- Link to builder
- Link to auth test page
- Success message confirming auth is working

### 5. Dashboard Header Component
Create a reusable header component with:
- Boron logo/brand
- Navigation links (Dashboard, Builder, Funnels, Stores)
- User email display
- Sign out button

### 6. Update Landing Page
Modify home page (`/page.tsx`) to:
- Show landing page for unauthenticated users
- Redirect authenticated users to dashboard
- Show loading spinner while checking auth state

### 7. Move Builder
- Move builder from `/page.tsx` to `/builder/page.tsx`
- Keep split-pane layout with ChatPane and PreviewPane

## Files Created
- `app/auth/signin/page.tsx` - Sign in page
- `app/auth/signup/page.tsx` - Sign up page
- `app/auth/callback/route.ts` - Auth callback handler
- `app/dashboard/page.tsx` - Protected dashboard
- `components/dashboard/dashboard-header.tsx` - Dashboard header
- `app/builder/page.tsx` - Funnel builder (moved)

## Files Modified
- `app/page.tsx` - Landing page with auth redirect

## Testing
- [ ] Can sign up new user
- [ ] Can sign in existing user
- [ ] Sign in shows error for wrong password
- [ ] Sign up shows error for existing email
- [ ] Unauthenticated users see landing page
- [ ] Authenticated users redirect to dashboard
- [ ] Dashboard shows user information
- [ ] Can navigate to builder from dashboard
- [ ] Can sign out and return to landing page
- [ ] Middleware protects dashboard and builder routes

## Notes
- Using simple email/password auth (no OAuth for now)
- Email verification is optional in local development
- Password reset can be added later
- Sign-in page has improved error handling with console logging
- Added 500ms delay after sign-in to let auth state propagate
