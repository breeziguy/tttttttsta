export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_log: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          status: Database["public"]["Enums"]["admin_status"]
          updated_at: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          status?: Database["public"]["Enums"]["admin_status"]
          updated_at?: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          status?: Database["public"]["Enums"]["admin_status"]
          updated_at?: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      client: {
        Row: {
          active_staff_count: number | null
          contact_person_address: string
          contact_person_email: string
          contact_person_name: string
          contact_person_phone: string
          created_at: string
          entity_type: string | null
          has_trial: boolean | null
          id: string
          image_url: string | null
          location: string | null
          name: string
          payment_details: Json | null
          service_type: string | null
          staff_limit: number | null
          status: string | null
          tier: Database["public"]["Enums"]["client_tier"]
          trial_end_date: string | null
          trial_start_date: string | null
          type: Database["public"]["Enums"]["client_type"]
          updated_at: string
          welcome_guide_url: string | null
        }
        Insert: {
          active_staff_count?: number | null
          contact_person_address: string
          contact_person_email: string
          contact_person_name: string
          contact_person_phone: string
          created_at?: string
          entity_type?: string | null
          has_trial?: boolean | null
          id?: string
          image_url?: string | null
          location?: string | null
          name: string
          payment_details?: Json | null
          service_type?: string | null
          staff_limit?: number | null
          status?: string | null
          tier: Database["public"]["Enums"]["client_tier"]
          trial_end_date?: string | null
          trial_start_date?: string | null
          type: Database["public"]["Enums"]["client_type"]
          updated_at?: string
          welcome_guide_url?: string | null
        }
        Update: {
          active_staff_count?: number | null
          contact_person_address?: string
          contact_person_email?: string
          contact_person_name?: string
          contact_person_phone?: string
          created_at?: string
          entity_type?: string | null
          has_trial?: boolean | null
          id?: string
          image_url?: string | null
          location?: string | null
          name?: string
          payment_details?: Json | null
          service_type?: string | null
          staff_limit?: number | null
          status?: string | null
          tier?: Database["public"]["Enums"]["client_tier"]
          trial_end_date?: string | null
          trial_start_date?: string | null
          type?: Database["public"]["Enums"]["client_type"]
          updated_at?: string
          welcome_guide_url?: string | null
        }
        Relationships: []
      }
      client_subscriptions: {
        Row: {
          amount_paid: number | null
          client_id: string | null
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          payment_reference: string | null
          payment_status: string | null
          plan_id: string | null
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          amount_paid?: number | null
          client_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          payment_reference?: string | null
          payment_status?: string | null
          plan_id?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number | null
          client_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          payment_reference?: string | null
          payment_status?: string | null
          plan_id?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_subscriptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      company_details: {
        Row: {
          created_at: string | null
          email: string
          id: string
          logo: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          logo?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          logo?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      download_history: {
        Row: {
          client_id: string | null
          downloaded_at: string | null
          id: string
          staff_id: string | null
        }
        Insert: {
          client_id?: string | null
          downloaded_at?: string | null
          id?: string
          staff_id?: string | null
        }
        Update: {
          client_id?: string | null
          downloaded_at?: string | null
          id?: string
          staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "download_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "download_history_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      field_agents: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      guarantor: {
        Row: {
          attach_id: string | null
          attached_form: string | null
          created_at: string | null
          home_address: string
          id: string
          name: string
          occupation: string
          phone: string
          relationship: string
          staff_id: string
          updated_at: string | null
          work_address: string
        }
        Insert: {
          attach_id?: string | null
          attached_form?: string | null
          created_at?: string | null
          home_address: string
          id?: string
          name: string
          occupation: string
          phone: string
          relationship: string
          staff_id: string
          updated_at?: string | null
          work_address: string
        }
        Update: {
          attach_id?: string | null
          attached_form?: string | null
          created_at?: string | null
          home_address?: string
          id?: string
          name?: string
          occupation?: string
          phone?: string
          relationship?: string
          staff_id?: string
          updated_at?: string | null
          work_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "guarantor_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          cal_event_uid: string | null
          created_at: string
          id: string
          notes: string | null
          order_id: string | null
          scheduled_time: string
          status: string
          updated_at: string
        }
        Insert: {
          cal_event_uid?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          scheduled_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          cal_event_uid?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          scheduled_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_resources: {
        Row: {
          created_at: string | null
          description: string
          id: string
          title: string
          updated_at: string | null
          video_url: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          title: string
          updated_at?: string | null
          video_url: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          title?: string
          updated_at?: string | null
          video_url?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          title: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          title: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string | null
          apartment: string | null
          client_type: string
          company: Json | null
          created_at: string
          customer_name: string
          email: string
          features: Json
          id: string
          interview_date: string | null
          interview_scheduled: boolean
          order_number: string
          phone: string | null
          selected_staff: Json[] | null
          service_type: string
          tier: string
          total: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          apartment?: string | null
          client_type: string
          company?: Json | null
          created_at?: string
          customer_name: string
          email: string
          features?: Json
          id?: string
          interview_date?: string | null
          interview_scheduled?: boolean
          order_number: string
          phone?: string | null
          selected_staff?: Json[] | null
          service_type: string
          tier: string
          total?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          apartment?: string | null
          client_type?: string
          company?: Json | null
          created_at?: string
          customer_name?: string
          email?: string
          features?: Json
          id?: string
          interview_date?: string | null
          interview_scheduled?: boolean
          order_number?: string
          phone?: string | null
          selected_staff?: Json[] | null
          service_type?: string
          tier?: string
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      referral: {
        Row: {
          attach_id: string | null
          attached_form: string | null
          created_at: string | null
          full_name: string
          home_address: string
          id: string
          occupation: string
          phone: string
          relationship: string
          staff_id: string
          updated_at: string | null
          work_address: string
        }
        Insert: {
          attach_id?: string | null
          attached_form?: string | null
          created_at?: string | null
          full_name: string
          home_address: string
          id?: string
          occupation: string
          phone: string
          relationship: string
          staff_id: string
          updated_at?: string | null
          work_address: string
        }
        Update: {
          attach_id?: string | null
          attached_form?: string | null
          created_at?: string | null
          full_name?: string
          home_address?: string
          id?: string
          occupation?: string
          phone?: string
          relationship?: string
          staff_id?: string
          updated_at?: string | null
          work_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          category: string
          content_type: string
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          published: boolean | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          category: string
          content_type?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          published?: boolean | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          category?: string
          content_type?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          published?: boolean | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          accommodation: boolean | null
          accommodation_status: string | null
          account_name: string | null
          account_number: string | null
          address: string
          age: number
          availability: string | null
          bank_name: string | null
          bvn: string | null
          certifications: Json | null
          children_count: number | null
          completion_percentage: number | null
          contract_type: string | null
          created_at: string
          cv: Json | null
          date_of_birth: string | null
          documents: Json | null
          education_background: Json | null
          email: string | null
          experience: number
          gender: string | null
          health_status: string | null
          house_photo_back: Json | null
          house_photo_front: Json | null
          house_photo_left: Json | null
          house_photo_right: Json | null
          household_members: number | null
          id: string
          identification_number: string | null
          identification_type: string | null
          illness: string | null
          image_url: string | null
          interview_documents: Json | null
          last_medical_test: string | null
          level: string | null
          location: string
          marital_status: string | null
          name: string
          nin: string | null
          numeric_id: number | null
          phone: string
          profile_image: string | null
          religion: string | null
          role: string
          salary: number
          service_type: string | null
          skills: string[]
          staff_id: string | null
          state_of_origin: string | null
          status: Database["public"]["Enums"]["staff_status"] | null
          temp_address: string | null
          tribe: string | null
          updated_at: string
          user_role: Database["public"]["Enums"]["user_role"] | null
          verification_status: string | null
          verified: boolean | null
          welcome_guide: Json | null
          work_history: Json | null
          working_days: string[] | null
          working_hours: string | null
        }
        Insert: {
          accommodation?: boolean | null
          accommodation_status?: string | null
          account_name?: string | null
          account_number?: string | null
          address: string
          age: number
          availability?: string | null
          bank_name?: string | null
          bvn?: string | null
          certifications?: Json | null
          children_count?: number | null
          completion_percentage?: number | null
          contract_type?: string | null
          created_at?: string
          cv?: Json | null
          date_of_birth?: string | null
          documents?: Json | null
          education_background?: Json | null
          email?: string | null
          experience: number
          gender?: string | null
          health_status?: string | null
          house_photo_back?: Json | null
          house_photo_front?: Json | null
          house_photo_left?: Json | null
          house_photo_right?: Json | null
          household_members?: number | null
          id?: string
          identification_number?: string | null
          identification_type?: string | null
          illness?: string | null
          image_url?: string | null
          interview_documents?: Json | null
          last_medical_test?: string | null
          level?: string | null
          location: string
          marital_status?: string | null
          name?: string
          nin?: string | null
          numeric_id?: number | null
          phone: string
          profile_image?: string | null
          religion?: string | null
          role: string
          salary: number
          service_type?: string | null
          skills: string[]
          staff_id?: string | null
          state_of_origin?: string | null
          status?: Database["public"]["Enums"]["staff_status"] | null
          temp_address?: string | null
          tribe?: string | null
          updated_at?: string
          user_role?: Database["public"]["Enums"]["user_role"] | null
          verification_status?: string | null
          verified?: boolean | null
          welcome_guide?: Json | null
          work_history?: Json | null
          working_days?: string[] | null
          working_hours?: string | null
        }
        Update: {
          accommodation?: boolean | null
          accommodation_status?: string | null
          account_name?: string | null
          account_number?: string | null
          address?: string
          age?: number
          availability?: string | null
          bank_name?: string | null
          bvn?: string | null
          certifications?: Json | null
          children_count?: number | null
          completion_percentage?: number | null
          contract_type?: string | null
          created_at?: string
          cv?: Json | null
          date_of_birth?: string | null
          documents?: Json | null
          education_background?: Json | null
          email?: string | null
          experience?: number
          gender?: string | null
          health_status?: string | null
          house_photo_back?: Json | null
          house_photo_front?: Json | null
          house_photo_left?: Json | null
          house_photo_right?: Json | null
          household_members?: number | null
          id?: string
          identification_number?: string | null
          identification_type?: string | null
          illness?: string | null
          image_url?: string | null
          interview_documents?: Json | null
          last_medical_test?: string | null
          level?: string | null
          location?: string
          marital_status?: string | null
          name?: string
          nin?: string | null
          numeric_id?: number | null
          phone?: string
          profile_image?: string | null
          religion?: string | null
          role?: string
          salary?: number
          service_type?: string | null
          skills?: string[]
          staff_id?: string | null
          state_of_origin?: string | null
          status?: Database["public"]["Enums"]["staff_status"] | null
          temp_address?: string | null
          tribe?: string | null
          updated_at?: string
          user_role?: Database["public"]["Enums"]["user_role"] | null
          verification_status?: string | null
          verified?: boolean | null
          welcome_guide?: Json | null
          work_history?: Json | null
          working_days?: string[] | null
          working_hours?: string | null
        }
        Relationships: []
      }
      staff_assignment: {
        Row: {
          client_id: string | null
          created_at: string
          end_date: string | null
          id: string
          staff_id: string | null
          start_date: string
          status: string | null
          trial_period: string | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          staff_id?: string | null
          start_date: string
          status?: string | null
          trial_period?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          staff_id?: string | null
          start_date?: string
          status?: string | null
          trial_period?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_assignment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_assignment_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_feedback: {
        Row: {
          client_id: string | null
          comment: string | null
          created_at: string | null
          decision: string | null
          id: string
          rating: number | null
          staff_id: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          comment?: string | null
          created_at?: string | null
          decision?: string | null
          id?: string
          rating?: number | null
          staff_id?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          comment?: string | null
          created_at?: string | null
          decision?: string | null
          id?: string
          rating?: number | null
          staff_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_feedback_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_feedback_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_hiring_status: {
        Row: {
          action_status: string | null
          client_id: string | null
          created_at: string | null
          end_date: string | null
          id: string
          interview_id: string | null
          staff_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["hiring_status"] | null
          termination_reason: string | null
          updated_at: string | null
        }
        Insert: {
          action_status?: string | null
          client_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          interview_id?: string | null
          staff_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["hiring_status"] | null
          termination_reason?: string | null
          updated_at?: string | null
        }
        Update: {
          action_status?: string | null
          client_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          interview_id?: string | null
          staff_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["hiring_status"] | null
          termination_reason?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_hiring_status_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_hiring_status_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "staff_interviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_hiring_status_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_interviews: {
        Row: {
          cancellation_reason: string | null
          client_id: string | null
          created_at: string | null
          decision_date: string | null
          decision_notes: string | null
          dismissal_reason: string | null
          end_date: string | null
          feedback: string | null
          hiring_decision: Database["public"]["Enums"]["hiring_status"] | null
          id: string
          rating: number | null
          scheduled_date: string
          staff_id: string | null
          status: Database["public"]["Enums"]["interview_status"] | null
          suspension_reason: string | null
          updated_at: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          client_id?: string | null
          created_at?: string | null
          decision_date?: string | null
          decision_notes?: string | null
          dismissal_reason?: string | null
          end_date?: string | null
          feedback?: string | null
          hiring_decision?: Database["public"]["Enums"]["hiring_status"] | null
          id?: string
          rating?: number | null
          scheduled_date: string
          staff_id?: string | null
          status?: Database["public"]["Enums"]["interview_status"] | null
          suspension_reason?: string | null
          updated_at?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          client_id?: string | null
          created_at?: string | null
          decision_date?: string | null
          decision_notes?: string | null
          dismissal_reason?: string | null
          end_date?: string | null
          feedback?: string | null
          hiring_decision?: Database["public"]["Enums"]["hiring_status"] | null
          id?: string
          rating?: number | null
          scheduled_date?: string
          staff_id?: string | null
          status?: Database["public"]["Enums"]["interview_status"] | null
          suspension_reason?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_interviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_interviews_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_referral: {
        Row: {
          created_at: string
          documents: Json | null
          full_name: string
          home_address: string | null
          id: string
          occupation: string | null
          phone: string
          relationship: string | null
          staff_id: string | null
          updated_at: string
          work_address: string | null
        }
        Insert: {
          created_at?: string
          documents?: Json | null
          full_name: string
          home_address?: string | null
          id?: string
          occupation?: string | null
          phone: string
          relationship?: string | null
          staff_id?: string | null
          updated_at?: string
          work_address?: string | null
        }
        Update: {
          created_at?: string
          documents?: Json | null
          full_name?: string
          home_address?: string | null
          id?: string
          occupation?: string | null
          phone?: string
          relationship?: string | null
          staff_id?: string | null
          updated_at?: string
          work_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_referral_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_report: {
        Row: {
          action_date: string | null
          action_taken: string | null
          client_id: string
          created_at: string | null
          description: string
          id: string
          report_date: string
          report_file_url: string | null
          report_type: Database["public"]["Enums"]["report_type"]
          reviewed_by: string | null
          severity: string | null
          staff_id: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          action_date?: string | null
          action_taken?: string | null
          client_id: string
          created_at?: string | null
          description: string
          id?: string
          report_date: string
          report_file_url?: string | null
          report_type: Database["public"]["Enums"]["report_type"]
          reviewed_by?: string | null
          severity?: string | null
          staff_id: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          action_date?: string | null
          action_taken?: string | null
          client_id?: string
          created_at?: string | null
          description?: string
          id?: string
          report_date?: string
          report_file_url?: string | null
          report_type?: Database["public"]["Enums"]["report_type"]
          reviewed_by?: string | null
          severity?: string | null
          staff_id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_report_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_report_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_report_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_roles: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_selections: {
        Row: {
          client_id: string | null
          created_at: string | null
          id: string
          interview_date: string | null
          interview_notes: string | null
          rejection_reason: string | null
          staff_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          interview_date?: string | null
          interview_notes?: string | null
          rejection_reason?: string | null
          staff_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          interview_date?: string | null
          interview_notes?: string | null
          rejection_reason?: string | null
          staff_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_selections_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_selections_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_training_assignments: {
        Row: {
          assigned_at: string | null
          client_id: string | null
          completed_at: string | null
          id: string
          resource_id: string | null
          staff_id: string | null
          status: string | null
        }
        Insert: {
          assigned_at?: string | null
          client_id?: string | null
          completed_at?: string | null
          id?: string
          resource_id?: string | null
          staff_id?: string | null
          status?: string | null
        }
        Update: {
          assigned_at?: string | null
          client_id?: string | null
          completed_at?: string | null
          id?: string
          resource_id?: string | null
          staff_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_training_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_training_assignments_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_training_assignments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          allow_pdf_download: boolean | null
          created_at: string | null
          description: string | null
          duration_days: number
          features: Json | null
          id: string
          is_one_time: boolean | null
          max_staff_selections: number | null
          name: string
          plan_code: string | null
          price: number
          staff_access_percentage: number
          updated_at: string | null
        }
        Insert: {
          allow_pdf_download?: boolean | null
          created_at?: string | null
          description?: string | null
          duration_days: number
          features?: Json | null
          id?: string
          is_one_time?: boolean | null
          max_staff_selections?: number | null
          name: string
          plan_code?: string | null
          price: number
          staff_access_percentage?: number
          updated_at?: string | null
        }
        Update: {
          allow_pdf_download?: boolean | null
          created_at?: string | null
          description?: string | null
          duration_days?: number
          features?: Json | null
          id?: string
          is_one_time?: boolean | null
          max_staff_selections?: number | null
          name?: string
          plan_code?: string | null
          price?: number
          staff_access_percentage?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      users_profile: {
        Row: {
          accommodation_status: string | null
          account_status: string | null
          account_type: Database["public"]["Enums"]["account_type"]
          address_line1: string | null
          address_line2: string | null
          business_address: string | null
          city: string | null
          company_address: string | null
          company_city_state: string | null
          company_details: Json | null
          company_email: string | null
          company_name: string | null
          company_phone: string | null
          completion_step: number | null
          contact_preference: string | null
          created_at: string | null
          email: string
          full_name: string
          has_children: boolean | null
          has_pets: boolean | null
          id: string
          industry: string | null
          industry_type: string | null
          is_profile_complete: boolean | null
          is_verified: boolean | null
          location: string | null
          nin: string | null
          notification_preferences: Json | null
          number_of_household_members: number | null
          off_days: string[] | null
          phone_number: string | null
          preferred_contact:
            | Database["public"]["Enums"]["contact_preference"]
            | null
          rc_number: string | null
          referral_code: string | null
          registration_number: string | null
          representative_details: Json | null
          staff_requirements: Json | null
          subscription_settings: Json | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          tax_id: string | null
          terms_accepted: boolean | null
          updated_at: string | null
          user_id: string
          verification_status: string | null
          website: string | null
          whatsapp_number: string | null
          working_hours: string | null
        }
        Insert: {
          accommodation_status?: string | null
          account_status?: string | null
          account_type?: Database["public"]["Enums"]["account_type"]
          address_line1?: string | null
          address_line2?: string | null
          business_address?: string | null
          city?: string | null
          company_address?: string | null
          company_city_state?: string | null
          company_details?: Json | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          completion_step?: number | null
          contact_preference?: string | null
          created_at?: string | null
          email: string
          full_name: string
          has_children?: boolean | null
          has_pets?: boolean | null
          id?: string
          industry?: string | null
          industry_type?: string | null
          is_profile_complete?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          nin?: string | null
          notification_preferences?: Json | null
          number_of_household_members?: number | null
          off_days?: string[] | null
          phone_number?: string | null
          preferred_contact?:
            | Database["public"]["Enums"]["contact_preference"]
            | null
          rc_number?: string | null
          referral_code?: string | null
          registration_number?: string | null
          representative_details?: Json | null
          staff_requirements?: Json | null
          subscription_settings?: Json | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          tax_id?: string | null
          terms_accepted?: boolean | null
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
          website?: string | null
          whatsapp_number?: string | null
          working_hours?: string | null
        }
        Update: {
          accommodation_status?: string | null
          account_status?: string | null
          account_type?: Database["public"]["Enums"]["account_type"]
          address_line1?: string | null
          address_line2?: string | null
          business_address?: string | null
          city?: string | null
          company_address?: string | null
          company_city_state?: string | null
          company_details?: Json | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          completion_step?: number | null
          contact_preference?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          has_children?: boolean | null
          has_pets?: boolean | null
          id?: string
          industry?: string | null
          industry_type?: string | null
          is_profile_complete?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          nin?: string | null
          notification_preferences?: Json | null
          number_of_household_members?: number | null
          off_days?: string[] | null
          phone_number?: string | null
          preferred_contact?:
            | Database["public"]["Enums"]["contact_preference"]
            | null
          rc_number?: string | null
          referral_code?: string | null
          registration_number?: string | null
          representative_details?: Json | null
          staff_requirements?: Json | null
          subscription_settings?: Json | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          tax_id?: string | null
          terms_accepted?: boolean | null
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
          website?: string | null
          whatsapp_number?: string | null
          working_hours?: string | null
        }
        Relationships: []
      }
      verification_reports: {
        Row: {
          additional_notes: string | null
          address_correct: boolean | null
          address_notes: string | null
          created_at: string | null
          house_condition: string | null
          id: string
          marital_status_confirmed: boolean | null
          marital_status_notes: string | null
          matches_photo: boolean | null
          neighbors_feedback: string | null
          photo_notes: string | null
          recommendations: string | null
          report_photos: Json | null
          updated_at: string | null
          verification_task_id: string
        }
        Insert: {
          additional_notes?: string | null
          address_correct?: boolean | null
          address_notes?: string | null
          created_at?: string | null
          house_condition?: string | null
          id?: string
          marital_status_confirmed?: boolean | null
          marital_status_notes?: string | null
          matches_photo?: boolean | null
          neighbors_feedback?: string | null
          photo_notes?: string | null
          recommendations?: string | null
          report_photos?: Json | null
          updated_at?: string | null
          verification_task_id: string
        }
        Update: {
          additional_notes?: string | null
          address_correct?: boolean | null
          address_notes?: string | null
          created_at?: string | null
          house_condition?: string | null
          id?: string
          marital_status_confirmed?: boolean | null
          marital_status_notes?: string | null
          matches_photo?: boolean | null
          neighbors_feedback?: string | null
          photo_notes?: string | null
          recommendations?: string | null
          report_photos?: Json | null
          updated_at?: string | null
          verification_task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_reports_verification_task_id_fkey"
            columns: ["verification_task_id"]
            isOneToOne: false
            referencedRelation: "verification_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_tasks: {
        Row: {
          admin_approved: boolean | null
          admin_notes: string | null
          agent_id: string | null
          agent_notes: string | null
          completion_date: string | null
          created_at: string | null
          field_photos: Json | null
          id: string
          last_status_update: string | null
          location_visited: boolean | null
          scheduled_date: string | null
          staff_id: string | null
          status: string | null
          updated_at: string | null
          verification_notes: string | null
          verification_photos: Json | null
        }
        Insert: {
          admin_approved?: boolean | null
          admin_notes?: string | null
          agent_id?: string | null
          agent_notes?: string | null
          completion_date?: string | null
          created_at?: string | null
          field_photos?: Json | null
          id?: string
          last_status_update?: string | null
          location_visited?: boolean | null
          scheduled_date?: string | null
          staff_id?: string | null
          status?: string | null
          updated_at?: string | null
          verification_notes?: string | null
          verification_photos?: Json | null
        }
        Update: {
          admin_approved?: boolean | null
          admin_notes?: string | null
          agent_id?: string | null
          agent_notes?: string | null
          completion_date?: string | null
          created_at?: string | null
          field_photos?: Json | null
          id?: string
          last_status_update?: string | null
          location_visited?: boolean | null
          scheduled_date?: string | null
          staff_id?: string | null
          status?: string | null
          updated_at?: string | null
          verification_notes?: string | null
          verification_photos?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_tasks_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "field_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_tasks_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      vetting_searches: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          results_count: number | null
          search_date: string | null
          search_query: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          results_count?: number | null
          search_date?: string | null
          search_query: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          results_count?: number | null
          search_date?: string | null
          search_query?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vetting_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      vettings: {
        Row: {
          created_at: string | null
          email: string | null
          experience: number | null
          id: string
          location: string | null
          name: string
          phone: string | null
          role: string | null
          skills: string[] | null
          staff_id: string | null
          submission_date: string | null
          submitted_by: string | null
          updated_at: string | null
          verification_status: string | null
          vetting_status: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          experience?: number | null
          id?: string
          location?: string | null
          name: string
          phone?: string | null
          role?: string | null
          skills?: string[] | null
          staff_id?: string | null
          submission_date?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          verification_status?: string | null
          vetting_status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          experience?: number | null
          id?: string
          location?: string | null
          name?: string
          phone?: string | null
          role?: string | null
          skills?: string[] | null
          staff_id?: string | null
          submission_date?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          verification_status?: string | null
          vetting_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vettings_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vettings_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_active_subscription: {
        Args: { client_id: string }
        Returns: boolean
      }
      get_user_search_stats: {
        Args: { user_profile_id: string }
        Returns: {
          total_searches: number
          total_results: number
          avg_results_per_search: number
          searches_last_30_days: number
        }[]
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      send_notification: {
        Args: {
          p_user_id: string
          p_type: string
          p_title: string
          p_message: string
          p_metadata?: Json
        }
        Returns: string
      }
    }
    Enums: {
      accommodation_status: "Required" | "Non Required"
      account_type: "individual" | "corporate"
      admin_status: "active" | "suspended"
      assignment_status: "Active" | "Completed" | "Terminated"
      client_tier: "A" | "B" | "C"
      client_type: "Individual" | "Corporate"
      contact_preference: "Call" | "WhatsApp"
      gender_preference: "Male" | "Female" | "No Preference"
      hiring_status: "pending" | "hired" | "rejected" | "terminated"
      industry_type:
        | "Technology"
        | "Healthcare"
        | "Education"
        | "Manufacturing"
        | "Retail"
        | "Financial Services"
        | "Real Estate"
        | "Construction"
        | "Hospitality"
        | "Other"
      interview_status:
        | "scheduled"
        | "completed"
        | "cancelled"
        | "no_show"
        | "rescheduled"
        | "rejected"
      report_type:
        | "performance"
        | "incident"
        | "feedback"
        | "monthly_review"
        | "other"
      staff_duration_type: "Full-time" | "Part-time" | "Live-in" | "Temporary"
      staff_status: "active" | "inactive" | "suspended" | "blacklist"
      staff_type:
        | "Nanny"
        | "Housekeeper"
        | "Cook"
        | "Driver"
        | "Security"
        | "Chef"
        | "Cleaner"
        | "Ironing Man"
      subscription_tier: "free" | "basic" | "standard" | "premium"
      user_role: "super_admin" | "admin"
      user_status: "Active" | "Laid Off" | "Sacked" | "Blacklisted"
    }
    CompositeTypes: {
      company_detail: {
        registration_number: string | null
        industry: string | null
        company_size: string | null
        staff_count: number | null
        locations: string[] | null
        contract_types: string[] | null
      }
      staff_requirement: {
        staff_types: Database["public"]["Enums"]["staff_type"][] | null
        duration_type: Database["public"]["Enums"]["staff_duration_type"] | null
        preferred_gender:
          | Database["public"]["Enums"]["gender_preference"]
          | null
        preferred_age_range: unknown | null
        service_address: string | null
        start_date: string | null
        budget_range: unknown | null
      }
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      accommodation_status: ["Required", "Non Required"],
      account_type: ["individual", "corporate"],
      admin_status: ["active", "suspended"],
      assignment_status: ["Active", "Completed", "Terminated"],
      client_tier: ["A", "B", "C"],
      client_type: ["Individual", "Corporate"],
      contact_preference: ["Call", "WhatsApp"],
      gender_preference: ["Male", "Female", "No Preference"],
      hiring_status: ["pending", "hired", "rejected", "terminated"],
      industry_type: [
        "Technology",
        "Healthcare",
        "Education",
        "Manufacturing",
        "Retail",
        "Financial Services",
        "Real Estate",
        "Construction",
        "Hospitality",
        "Other",
      ],
      interview_status: [
        "scheduled",
        "completed",
        "cancelled",
        "no_show",
        "rescheduled",
        "rejected",
      ],
      report_type: [
        "performance",
        "incident",
        "feedback",
        "monthly_review",
        "other",
      ],
      staff_duration_type: ["Full-time", "Part-time", "Live-in", "Temporary"],
      staff_status: ["active", "inactive", "suspended", "blacklist"],
      staff_type: [
        "Nanny",
        "Housekeeper",
        "Cook",
        "Driver",
        "Security",
        "Chef",
        "Cleaner",
        "Ironing Man",
      ],
      subscription_tier: ["free", "basic", "standard", "premium"],
      user_role: ["super_admin", "admin"],
      user_status: ["Active", "Laid Off", "Sacked", "Blacklisted"],
    },
  },
} as const
