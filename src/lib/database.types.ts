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
      users_profile: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string
          phone_number: string | null
          address: string | null
          account_type: 'individual' | 'corporate'
          company_name: string | null
          business_address: string | null
          subscription_tier: 'basic' | 'premium' | 'enterprise'
          is_profile_complete: boolean
          created_at: string
          updated_at: string
          is_verified: boolean
          verification_status: string
          account_status: string
          registration_number: string | null
          tax_id: string | null
          industry: string | null
          notification_preferences: Json
          subscription_settings: Json
          staff_requirements?: Json
          whatsapp_number?: string | null
          location?: string | null
          referral_code?: string | null
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name: string
          phone_number?: string | null
          address?: string | null
          account_type?: 'individual' | 'corporate'
          company_name?: string | null
          business_address?: string | null
          subscription_tier?: 'basic' | 'premium' | 'enterprise'
          is_profile_complete?: boolean
          created_at?: string
          updated_at?: string
          is_verified?: boolean
          verification_status?: string
          account_status?: string
          registration_number?: string | null
          tax_id?: string | null
          industry?: string | null
          notification_preferences?: Json
          subscription_settings?: Json
          staff_requirements?: Json
          whatsapp_number?: string | null
          location?: string | null
          referral_code?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string
          phone_number?: string | null
          address?: string | null
          account_type?: 'individual' | 'corporate'
          company_name?: string | null
          business_address?: string | null
          subscription_tier?: 'basic' | 'premium' | 'enterprise'
          is_profile_complete?: boolean
          created_at?: string
          updated_at?: string
          is_verified?: boolean
          verification_status?: string
          account_status?: string
          registration_number?: string | null
          tax_id?: string | null
          industry?: string | null
          notification_preferences?: Json
          subscription_settings?: Json
          staff_requirements?: Json
          whatsapp_number?: string | null
          location?: string | null
          referral_code?: string | null
        }
      }
    }
    Enums: {
      account_type: 'individual' | 'corporate'
      subscription_tier: 'basic' | 'premium' | 'enterprise'
    }
  }
}