export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      stores: {
        Row: {
          id: string
          name: string
          slug: string
          shopify_connected: boolean
          shopify_store_domain: string | null
          shopify_access_token: string | null
          plan: string
          seat_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          shopify_connected?: boolean
          shopify_store_domain?: string | null
          shopify_access_token?: string | null
          plan?: string
          seat_limit?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          shopify_connected?: boolean
          shopify_store_domain?: string | null
          shopify_access_token?: string | null
          plan?: string
          seat_limit?: number
          created_at?: string
          updated_at?: string
        }
      }
      store_members: {
        Row: {
          id: string
          store_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          invited_by: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          store_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member'
          invited_by?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          invited_by?: string | null
          joined_at?: string
        }
      }
      store_invites: {
        Row: {
          id: string
          store_id: string
          email: string
          role: 'admin' | 'member'
          invited_by: string
          token: string
          status: 'pending' | 'accepted' | 'expired' | 'cancelled'
          expires_at: string
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          store_id: string
          email: string
          role?: 'admin' | 'member'
          invited_by: string
          token?: string
          status?: 'pending' | 'accepted' | 'expired' | 'cancelled'
          expires_at?: string
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          email?: string
          role?: 'admin' | 'member'
          invited_by?: string
          token?: string
          status?: 'pending' | 'accepted' | 'expired' | 'cancelled'
          expires_at?: string
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
        }
      }
      funnels: {
        Row: {
          id: string
          store_id: string
          created_by: string
          name: string
          status: 'draft' | 'published' | 'archived'
          funnel_data: Json
          shopify_product_id: string | null
          created_at: string
          updated_at: string
          published_at: string | null
          views: number
          conversions: number
        }
        Insert: {
          id?: string
          store_id: string
          created_by: string
          name: string
          status?: 'draft' | 'published' | 'archived'
          funnel_data: Json
          shopify_product_id?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
          views?: number
          conversions?: number
        }
        Update: {
          id?: string
          store_id?: string
          created_by?: string
          name?: string
          status?: 'draft' | 'published' | 'archived'
          funnel_data?: Json
          shopify_product_id?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
          views?: number
          conversions?: number
        }
      }
      shopify_products: {
        Row: {
          id: string
          store_id: string
          shopify_product_id: string
          title: string
          description: string | null
          price: number | null
          compare_at_price: number | null
          currency: string
          images: Json | null
          featured_image: string | null
          variants: Json | null
          tags: string[] | null
          vendor: string | null
          product_type: string | null
          last_synced_at: string
          created_at: string
        }
        Insert: {
          id?: string
          store_id: string
          shopify_product_id: string
          title: string
          description?: string | null
          price?: number | null
          compare_at_price?: number | null
          currency?: string
          images?: Json | null
          featured_image?: string | null
          variants?: Json | null
          tags?: string[] | null
          vendor?: string | null
          product_type?: string | null
          last_synced_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          shopify_product_id?: string
          title?: string
          description?: string | null
          price?: number | null
          compare_at_price?: number | null
          currency?: string
          images?: Json | null
          featured_image?: string | null
          variants?: Json | null
          tags?: string[] | null
          vendor?: string | null
          product_type?: string | null
          last_synced_at?: string
          created_at?: string
        }
      }
      sync_jobs: {
        Row: {
          id: string
          store_id: string
          triggered_by: string | null
          status: 'pending' | 'running' | 'completed' | 'failed'
          type: 'shopify_products' | 'shopify_orders'
          products_synced: number
          errors: Json | null
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          store_id: string
          triggered_by?: string | null
          status?: 'pending' | 'running' | 'completed' | 'failed'
          type: 'shopify_products' | 'shopify_orders'
          products_synced?: number
          errors?: Json | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          triggered_by?: string | null
          status?: 'pending' | 'running' | 'completed' | 'failed'
          type?: 'shopify_products' | 'shopify_orders'
          products_synced?: number
          errors?: Json | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
      }
    }
  }
}
