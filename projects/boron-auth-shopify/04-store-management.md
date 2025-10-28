# Task 04: Store Management

**Status:** 🔲 Not Started
**Dependencies:** Task 03 (Auth Pages)
**Estimated Time:** 6-8 hours

## Overview
Implement store creation, management, and team member invitation system for multi-tenant architecture.

## Goals
- [ ] Create store management UI
- [ ] Implement store creation flow
- [ ] Build store member management
- [ ] Add invitation system
- [ ] Create store selection/switching

## Database Tables (Already Created)
- `stores` - Store records with name and owner
- `store_members` - Junction table for users and stores with roles
- `store_invites` - Pending invitations to join stores

## Implementation

### 1. Stores Page (`/stores`)
Create a page showing:
- List of stores user belongs to
- "Create Store" button
- Store cards with:
  - Store name
  - Member count
  - User's role (owner/admin/member)
  - Quick actions (View, Settings, Leave)

### 2. Create Store Flow
Modal or page with:
- Store name input
- "Create" button
- Auto-creates store with user as owner
- Auto-adds user to store_members
- Redirects to store dashboard

### 3. Store Dashboard (`/stores/[id]`)
Store-specific dashboard showing:
- Store name
- Member list
- Invite new members button
- Store settings
- Link to funnels for this store

### 4. Store Settings (`/stores/[id]/settings`)
Settings page with tabs:
- **General**: Store name, description
- **Members**:
  - List of current members with roles
  - Remove member (owner/admin only)
  - Change member role (owner only)
- **Invitations**:
  - Pending invitations list
  - Cancel invitation button
  - Invite new members form
- **Danger Zone**: Delete store (owner only)

### 5. Invite Members Flow
Form to invite new members:
- Email input
- Role selection (admin/member)
- "Send Invitation" button
- Creates record in store_invites
- Sends email notification (optional for MVP)

### 6. Accept Invitation Flow
Page at `/invites/[token]` showing:
- Store name
- Invited by
- Role being granted
- "Accept" and "Decline" buttons
- On accept: Create store_member record, delete invite
- On decline: Delete invite record

### 7. Store Selector Component
Dropdown in header to:
- Show current store context
- List all user's stores
- Switch between stores
- "Create New Store" option

## API Routes

### Store Management
- `GET /api/stores` - List user's stores
- `POST /api/stores` - Create new store
- `GET /api/stores/[id]` - Get store details
- `PATCH /api/stores/[id]` - Update store
- `DELETE /api/stores/[id]` - Delete store (owner only)

### Member Management
- `GET /api/stores/[id]/members` - List store members
- `PATCH /api/stores/[id]/members/[userId]` - Update member role
- `DELETE /api/stores/[id]/members/[userId]` - Remove member

### Invitation Management
- `POST /api/stores/[id]/invites` - Create invitation
- `GET /api/invites` - List user's invitations
- `POST /api/invites/[token]/accept` - Accept invitation
- `POST /api/invites/[token]/decline` - Decline invitation
- `DELETE /api/stores/[id]/invites/[id]` - Cancel invitation

## Components

### `<StoreCard>`
Display store in list with:
- Store name
- Member count
- User's role badge
- Quick actions menu

### `<StoreMemberList>`
Table showing:
- Member avatar/name
- Email
- Role badge
- Joined date
- Actions (change role, remove)

### `<InviteMemberModal>`
Modal form with:
- Email input with validation
- Role selector
- Send button

### `<StoreInviteCard>`
Card showing pending invitation:
- Store name
- Inviter name
- Role
- Accept/Decline buttons

### `<StoreSelector>`
Dropdown component:
- Current store display
- Store list with icons
- Create store option
- Store switcher

## Business Logic

### Permissions
- **Owner**: Full control, can delete store, manage all members
- **Admin**: Can invite members, manage content, cannot delete store
- **Member**: Can view and create content, limited management

### Store Context
- Most actions require a store context
- Funnels belong to stores (not individual users)
- Users switch between stores via selector
- Current store ID stored in:
  - URL parameter (`/stores/[id]`)
  - Local storage (for persistence)
  - React context (for app state)

### First-Time User Experience
- After sign up, prompt to create first store
- Or show onboarding flow: "Create your first store"
- Cannot access main app features without a store

## Testing
- [ ] Can create new store
- [ ] Store creator becomes owner
- [ ] Can view list of stores
- [ ] Can invite member to store
- [ ] Invited user receives invitation
- [ ] Can accept invitation
- [ ] Can decline invitation
- [ ] Can remove member (admin/owner)
- [ ] Cannot remove owner
- [ ] Can change member role (owner only)
- [ ] Can delete store (owner only)
- [ ] Can switch between stores
- [ ] RLS policies prevent unauthorized access

## Notes
- Email notifications for invites are optional for MVP
- Could use mailto links or manual copy/paste of invite link
- Store deletion should be soft delete or require confirmation
- Consider adding store slug/subdomain for future custom domains
- Store avatar/logo can be added later
