# Shopify API Scopes Reference

## Current Scopes (Minimal - Read Only)

```bash
SHOPIFY_SCOPES=read_products,read_product_listings
```

### What This Allows:
- ✅ Read product catalog (title, description, price, images)
- ✅ Read product variants
- ✅ Read inventory levels
- ✅ Read product availability

### What This DOESN'T Allow:
- ❌ No order access
- ❌ No customer data access
- ❌ No write permissions (can't modify anything)
- ❌ No payment information

### User Trust:
This minimal scope set is **great for user trust** because:
- Users see you only want to READ products (not modify)
- No access to sensitive customer/order data
- Clear, specific purpose

---

## Common Additional Scopes (If Needed Later)

### Order Management
If you want to create orders, track fulfillment, etc.:

```bash
read_orders          # Read order history
write_orders         # Create orders, update status
read_fulfillments    # Read shipping/fulfillment data
write_fulfillments   # Create fulfillments, update tracking
```

**Use case**: If you want to automatically create orders when someone completes a funnel

### Customer Data
If you need customer information:

```bash
read_customers       # Read customer names, emails, addresses
write_customers      # Create/update customer records
```

**Use case**: If you want to sync customer data, send targeted campaigns

### Inventory Management
If you need to modify inventory:

```bash
write_inventory      # Update inventory quantities
```

**Use case**: If you want to automatically adjust stock levels

### Collections/Categories
If you want to organize products:

```bash
read_product_listings   # Already included
write_product_listings  # Publish/unpublish products
```

### Discounts
If you want to create promo codes:

```bash
read_discounts       # Read existing discount codes
write_discounts      # Create discount codes
```

**Use case**: Create automatic discount codes for funnel completions

### Analytics
If you want sales data:

```bash
read_analytics       # Access store analytics
```

---

## Recommended Scope Sets by Use Case

### 1. Product Display Only (Current)
**Perfect for**: Showing products in funnels, no transactions
```bash
SHOPIFY_SCOPES=read_products,read_product_listings
```

### 2. Product Display + Order Creation
**Perfect for**: Taking orders through your funnels
```bash
SHOPIFY_SCOPES=read_products,read_product_listings,write_orders,read_customers,write_customers
```

### 3. Full E-commerce Integration
**Perfect for**: Complete order management + inventory
```bash
SHOPIFY_SCOPES=read_products,read_product_listings,write_orders,read_customers,write_customers,read_fulfillments,write_fulfillments,write_inventory
```

### 4. Marketing App
**Perfect for**: Customer segmentation, campaigns, analytics
```bash
SHOPIFY_SCOPES=read_products,read_customers,read_orders,read_analytics
```

---

## How to Change Scopes

### 1. Update `.env.local`
```bash
SHOPIFY_SCOPES=read_products,read_product_listings,write_orders
```

### 2. Update Shopify App Settings
1. Go to Shopify Partners dashboard
2. Open your app → **Configuration**
3. Scroll to **API access**
4. Check the new scopes you want
5. Click **Save**

### 3. Users Must Re-authorize
**Important**: When you add scopes, existing connections won't automatically get new permissions.

Users need to:
1. Disconnect their store in Boron Builder
2. Reconnect (they'll see the new permissions)
3. Approve the new scopes

Or implement automatic scope upgrade:
- Detect missing scopes when API calls fail
- Show "Update permissions" button
- Redirect to OAuth with new scopes

---

## Scope Naming Convention

Shopify scopes follow this pattern:
```
[read|write]_[resource]
```

- `read_` = View only (safe, non-intrusive)
- `write_` = Create/update/delete (requires user trust)

---

## Best Practices

### Start Minimal
✅ **DO**: Start with only the scopes you need NOW
- Builds user trust
- Easier to get initial approvals
- Can always add more later

❌ **DON'T**: Request all possible scopes "just in case"
- Users will be suspicious
- Shopify may reject your app
- Harder to maintain

### Be Transparent
Always explain WHY you need each permission:

```
We request these permissions:
• Read Products - To display your products in funnels
• Create Orders - To process purchases through your funnels
• Read Customers - To personalize the shopping experience
```

### Request Additional Scopes Contextually
Instead of asking for everything upfront:

```
User tries to create order →
  "To create orders, we need additional permissions"
  [Grant Permissions] button
```

---

## Security Notes

### Access Tokens
- Tokens are stored encrypted in your database
- Each store has its own token
- Tokens are scoped (can only do what permissions allow)
- Tokens can be revoked by users anytime

### User Control
Users can always:
- View what permissions they granted
- Revoke access anytime (deletes the token)
- See your app in their Shopify admin under **Apps**

### Shopify's Protection
Even if you have `write_orders`, Shopify:
- Rate limits API calls (prevents abuse)
- Logs all API activity
- Can revoke your app if misused
- Requires HTTPS in production

---

## Testing Scopes

### Check What Scopes You Have
```typescript
// In your API route
const response = await fetch(`https://${shopDomain}/admin/api/2024-10/shop.json`, {
  headers: {
    'X-Shopify-Access-Token': accessToken,
  }
})

// Response headers include:
// X-Shopify-API-Grant-Scopes: read_products,write_orders
```

### Test Permission Errors
If you try to do something without the right scope:
```json
{
  "errors": "API permission 'write_orders' is required"
}
```

Handle gracefully:
```typescript
if (error.message.includes('API permission')) {
  // Show "Need additional permissions" message
  // Provide re-auth button
}
```

---

## Scope Migration Strategy

When adding new scopes to existing app:

### 1. Add to Environment
```bash
SHOPIFY_SCOPES=read_products,read_product_listings,write_orders
```

### 2. Detect Missing Scopes
```typescript
// Check if store needs re-auth
const hasRequiredScopes = await checkScopes(store)
if (!hasRequiredScopes) {
  // Show "Update permissions required" banner
}
```

### 3. Provide Upgrade Path
```tsx
<div className="bg-yellow-50 border border-yellow-200 p-4">
  <p>New features available! Update permissions to:</p>
  <ul>
    <li>✨ Create orders directly from funnels</li>
  </ul>
  <button onClick={reauthorize}>Update Permissions</button>
</div>
```

### 4. Handle Gracefully
```typescript
// Don't break for stores with old scopes
if (hasWriteOrdersScope) {
  // Show order creation features
} else {
  // Show "Connect orders" upsell
}
```

---

## FAQ

**Q: Can I change scopes without users re-authorizing?**
A: No. For security, users must explicitly approve new permissions.

**Q: What happens if a user denies a scope?**
A: The OAuth flow fails. You can't connect without required scopes.

**Q: Can I request different scopes for different users?**
A: No. All users see the same scopes defined in your app configuration.

**Q: Do scopes expire?**
A: No, but access tokens can be revoked by users or if they uninstall your app.

**Q: Can I have optional scopes?**
A: Not officially, but you can:
- Start with minimal scopes
- Offer "Connect Orders" feature that triggers re-auth with more scopes
- Handle missing scopes gracefully in your code

---

## Current Implementation

Your app currently uses `read_products,read_product_listings` which is perfect for:
- ✅ Displaying products in funnels
- ✅ Syncing product catalog
- ✅ Product picker in builder
- ✅ Read-only access (maximum trust)

### When to Add More Scopes:

**Add `write_orders`** when you:
- Want to create orders programmatically
- Process payments through your funnels
- Track order fulfillment

**Add `read_customers`** when you:
- Need customer email for follow-ups
- Want to personalize funnels
- Segment audiences

**Add `read_analytics`** when you:
- Want to show store performance
- Provide business insights
- Track product popularity

For now, your minimal scopes are **perfect** for the MVP! 🎯
