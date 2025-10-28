# Task 05: Funnel Management

**Status:** 🔲 Not Started
**Dependencies:** Task 04 (Store Management)
**Estimated Time:** 8-10 hours

## Overview
Implement full CRUD operations for funnels within store context, allowing users to create, save, edit, and manage their AI-generated funnels.

## Goals
- [ ] Create funnel listing page
- [ ] Implement funnel creation flow from builder
- [ ] Add funnel editing capability
- [ ] Build funnel status management (draft/published)
- [ ] Create funnel detail page
- [ ] Add duplicate and delete actions

## Database Table (Already Created)
- `funnels` - Stores funnel data with store association

## Implementation

### 1. Funnels List Page (`/stores/[storeId]/funnels`)
Display all funnels for current store:
- Grid or list view of funnel cards
- Filter by status (all/draft/published)
- Search by name
- Sort by date (newest/oldest)
- "Create New Funnel" button
- Empty state for no funnels

### 2. Funnel Card Component
Display funnel with:
- Thumbnail/preview image (optional)
- Funnel name
- Status badge (draft/published)
- Created date
- Last updated date
- Quick actions menu:
  - Edit
  - Duplicate
  - Delete
  - Publish/Unpublish
  - View (if published)

### 3. Create Funnel Flow

#### Option A: From Builder
- User builds funnel in `/builder`
- Click "Save Funnel" button
- Modal appears:
  - Funnel name input
  - Store selector (if multiple stores)
  - "Save as Draft" button
- Creates funnel record in database
- Redirects to funnel detail page

#### Option B: From Template (Future)
- Select from funnel templates
- Name the funnel
- Creates draft funnel
- Opens in builder for customization

### 4. Funnel Detail Page (`/stores/[storeId]/funnels/[id]`)
Detailed view showing:
- Funnel name (editable)
- Status with actions
- Created/updated timestamps
- Funnel metadata:
  - Linked Shopify product (if any)
  - Target audience
  - Conversion goal
- Preview button
- Edit in builder button
- Delete button
- Analytics section (future):
  - Views
  - Conversions
  - Revenue

### 5. Edit Funnel in Builder
- Open existing funnel in `/builder?funnelId=[id]`
- Load funnel data from database
- Populate chat history
- Show funnel preview
- Enable AI editing through chat
- Auto-save or manual save button
- Track changes

### 6. Funnel Status Management
Status workflow:
- **Draft**: Work in progress, not visible
- **Published**: Live and accessible
- **Archived**: Hidden but not deleted (future)

Actions:
- Publish: Changes status to published
- Unpublish: Changes status back to draft
- Archive: Soft delete (future)

### 7. Duplicate Funnel
- Copies funnel data
- Creates new funnel with name "Copy of [original]"
- Sets status to draft
- Opens in builder for editing

### 8. Delete Funnel
- Show confirmation modal
- Warn if funnel is published
- Hard delete from database
- Redirect to funnels list

## API Routes

### Funnel CRUD
- `GET /api/stores/[storeId]/funnels` - List funnels for store
- `POST /api/stores/[storeId]/funnels` - Create new funnel
- `GET /api/funnels/[id]` - Get funnel details
- `PATCH /api/funnels/[id]` - Update funnel
- `DELETE /api/funnels/[id]` - Delete funnel

### Funnel Actions
- `POST /api/funnels/[id]/publish` - Publish funnel
- `POST /api/funnels/[id]/unpublish` - Unpublish funnel
- `POST /api/funnels/[id]/duplicate` - Duplicate funnel
- `POST /api/funnels/[id]/archive` - Archive funnel (future)

## Components

### `<FunnelCard>`
Props:
```typescript
interface FunnelCardProps {
  funnel: Funnel
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onPublish: (id: string) => void
}
```

### `<FunnelsList>`
Container component with:
- Filter controls
- Search bar
- Sort dropdown
- Grid/list toggle
- Funnel cards grid

### `<CreateFunnelModal>`
Modal with form:
- Funnel name input
- Store selector (if user has multiple stores)
- Optional: Category/tags
- Save button

### `<DeleteFunnelModal>`
Confirmation modal:
- Warning message
- "Are you sure?" prompt
- Cancel and Delete buttons
- Show funnel name for clarity

### `<FunnelStatusBadge>`
Display status with color:
- Draft: Gray
- Published: Green
- Archived: Red (future)

## Builder Integration

### Save Funnel Button
Add to builder header:
- "Save" button (if existing funnel)
- "Save Funnel" button (if new)
- Show save status (saving/saved)
- Auto-save on changes (optional)

### Load Funnel
Query param: `/builder?funnelId=[id]`
- Fetch funnel from database
- Load funnel_data into builder state
- Restore chat history
- Enable editing

### Funnel Data Structure
Store in `funnel_data` JSONB column:
```typescript
interface FunnelData {
  version: string
  pages: Page[]
  chatHistory: Message[]
  theme: Theme
  metadata: {
    targetAudience?: string
    productType?: string
    conversionGoal?: string
  }
}
```

## Permissions & RLS

### Store-Level Access
- Users can only see funnels from stores they belong to
- RLS policies check store_members relationship
- Role-based actions:
  - Member: View, create
  - Admin: View, create, edit all, delete all
  - Owner: Full access

### Funnel Actions by Role
- **Create**: All members
- **Edit own**: Creator of funnel
- **Edit any**: Admin, Owner
- **Delete own**: Creator of funnel
- **Delete any**: Admin, Owner
- **Publish**: Admin, Owner

## Testing
- [ ] Can create new funnel from builder
- [ ] Can save funnel with name
- [ ] Can view list of funnels
- [ ] Can filter funnels by status
- [ ] Can search funnels by name
- [ ] Can edit existing funnel
- [ ] Can duplicate funnel
- [ ] Can delete funnel with confirmation
- [ ] Can publish funnel
- [ ] Can unpublish funnel
- [ ] Builder loads funnel data correctly
- [ ] Builder saves changes to funnel
- [ ] RLS policies enforce store access
- [ ] Empty state shows for new stores

## Notes
- Funnel preview could be generated as static HTML/image
- Consider adding funnel versioning for undo/redo
- Published funnels need public URLs (future: custom domains)
- Analytics integration comes later
- Consider funnel templates marketplace (future)
- May want to add funnel sharing with other team members
