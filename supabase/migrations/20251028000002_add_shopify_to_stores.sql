-- Add Shopify connection fields to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS shopify_connected boolean DEFAULT false;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS shopify_store_domain text;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS shopify_access_token text;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS shopify_connected_at timestamp;

-- Create index for Shopify lookups
CREATE INDEX IF NOT EXISTS stores_shopify_domain_idx ON stores(shopify_store_domain);

-- Note: In production, shopify_access_token should be encrypted
-- Consider using Supabase Vault or pgcrypto for encryption
