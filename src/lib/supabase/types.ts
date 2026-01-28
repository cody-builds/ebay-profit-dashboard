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
          ebay_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          ebay_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          ebay_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          ebay_transaction_id: string
          ebay_item_id: string
          title: string
          sold_price: number
          sold_date: string
          listed_date: string
          item_cost: number | null
          cost_updated_at: string | null
          cost_updated_by: string | null
          ebay_fees: Json
          shipping_cost: number
          shipping_service: string | null
          net_profit: number
          profit_margin: number
          days_listed: number
          category: string | null
          condition: string | null
          notes: string | null
          tags: string[] | null
          synced_at: string
          sync_status: string
          sync_error: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ebay_transaction_id: string
          ebay_item_id: string
          title: string
          sold_price: number
          sold_date: string
          listed_date: string
          item_cost?: number | null
          cost_updated_at?: string | null
          cost_updated_by?: string | null
          ebay_fees?: Json
          shipping_cost?: number
          shipping_service?: string | null
          net_profit: number
          profit_margin: number
          days_listed: number
          category?: string | null
          condition?: string | null
          notes?: string | null
          tags?: string[] | null
          synced_at?: string
          sync_status?: string
          sync_error?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ebay_transaction_id?: string
          ebay_item_id?: string
          title?: string
          sold_price?: number
          sold_date?: string
          listed_date?: string
          item_cost?: number | null
          cost_updated_at?: string | null
          cost_updated_by?: string | null
          ebay_fees?: Json
          shipping_cost?: number
          shipping_service?: string | null
          net_profit?: number
          profit_margin?: number
          days_listed?: number
          category?: string | null
          condition?: string | null
          notes?: string | null
          tags?: string[] | null
          synced_at?: string
          sync_status?: string
          sync_error?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          ebay_tokens: Json | null
          sync_frequency: number
          auto_sync: boolean
          sync_history_days: number
          default_view: string
          currency: string
          date_format: string
          default_shipping_cost: number
          rounding_precision: number
          email_notifications: boolean
          sync_failure_alerts: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ebay_tokens?: Json | null
          sync_frequency?: number
          auto_sync?: boolean
          sync_history_days?: number
          default_view?: string
          currency?: string
          date_format?: string
          default_shipping_cost?: number
          rounding_precision?: number
          email_notifications?: boolean
          sync_failure_alerts?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ebay_tokens?: Json | null
          sync_frequency?: number
          auto_sync?: boolean
          sync_history_days?: number
          default_view?: string
          currency?: string
          date_format?: string
          default_shipping_cost?: number
          rounding_precision?: number
          email_notifications?: boolean
          sync_failure_alerts?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Helper types for working with the database
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type UserSettings = Database['public']['Tables']['user_settings']['Row']

export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert']
export type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update']

// eBay fee breakdown type
export interface EbayFeeBreakdown {
  final_value_fee: number
  payment_processing_fee: number
  insertion_fee?: number
  total: number
}