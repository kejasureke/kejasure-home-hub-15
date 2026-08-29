export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          meta: Json
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          meta?: Json
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          meta?: Json
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      booking_events: {
        Row: {
          actor_id: string | null
          booking_id: string
          created_at: string
          event: string
          id: string
          meta: Json
        }
        Insert: {
          actor_id?: string | null
          booking_id: string
          created_at?: string
          event: string
          id?: string
          meta?: Json
        }
        Update: {
          actor_id?: string | null
          booking_id?: string
          created_at?: string
          event?: string
          id?: string
          meta?: Json
        }
        Relationships: [
          {
            foreignKeyName: "booking_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          check_in: string | null
          check_out: string | null
          contact_unlocked_at: string | null
          created_at: string
          guest_id: string
          guests: number | null
          host_id: string
          id: string
          listing_id: string
          message: string | null
          status: Database["public"]["Enums"]["booking_status"]
          total_kes: number | null
          type: Database["public"]["Enums"]["booking_type"]
          updated_at: string
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          contact_unlocked_at?: string | null
          created_at?: string
          guest_id: string
          guests?: number | null
          host_id: string
          id?: string
          listing_id: string
          message?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          total_kes?: number | null
          type: Database["public"]["Enums"]["booking_type"]
          updated_at?: string
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          contact_unlocked_at?: string | null
          created_at?: string
          guest_id?: string
          guests?: number | null
          host_id?: string
          id?: string
          listing_id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          total_kes?: number | null
          type?: Database["public"]["Enums"]["booking_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      boost_purchases: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          listing_id: string
          mpesa_receipt: string | null
          package: string
          price_kes: number
          starts_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          listing_id: string
          mpesa_receipt?: string | null
          package: string
          price_kes: number
          starts_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          listing_id?: string
          mpesa_receipt?: string | null
          package?: string
          price_kes?: number
          starts_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boost_purchases_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          archived_by: Json
          created_at: string
          id: string
          last_message_at: string | null
          listing_id: string | null
          muted_by: Json
          participant_a: string
          participant_b: string
        }
        Insert: {
          archived_by?: Json
          created_at?: string
          id?: string
          last_message_at?: string | null
          listing_id?: string | null
          muted_by?: Json
          participant_a: string
          participant_b: string
        }
        Update: {
          archived_by?: Json
          created_at?: string
          id?: string
          last_message_at?: string | null
          listing_id?: string | null
          muted_by?: Json
          participant_a?: string
          participant_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          booking_id: string
          category: string
          created_at: string
          description: string | null
          id: string
          opener_id: string
          resolution: string | null
          status: Database["public"]["Enums"]["dispute_status"]
          updated_at: string
        }
        Insert: {
          booking_id: string
          category: string
          created_at?: string
          description?: string | null
          id?: string
          opener_id: string
          resolution?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          updated_at?: string
        }
        Update: {
          booking_id?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          opener_id?: string
          resolution?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_submissions: {
        Row: {
          business_docs: Json | null
          confidence: number | null
          created_at: string
          id: string
          id_number: string | null
          id_photo_url: string | null
          id_type: string | null
          provider: string | null
          provider_job_id: string | null
          provider_job_type: number | null
          provider_result: Json | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          selfie_url: string | null
          status: Database["public"]["Enums"]["kyc_status"]
          tier: Database["public"]["Enums"]["kyc_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          business_docs?: Json | null
          confidence?: number | null
          created_at?: string
          id?: string
          id_number?: string | null
          id_photo_url?: string | null
          id_type?: string | null
          provider?: string | null
          provider_job_id?: string | null
          provider_job_type?: number | null
          provider_result?: Json | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          selfie_url?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          tier: Database["public"]["Enums"]["kyc_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          business_docs?: Json | null
          confidence?: number | null
          created_at?: string
          id?: string
          id_number?: string | null
          id_photo_url?: string | null
          id_type?: string | null
          provider?: string | null
          provider_job_id?: string | null
          provider_job_type?: number | null
          provider_result?: Json | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          selfie_url?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          tier?: Database["public"]["Enums"]["kyc_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      listing_image_checks: {
        Row: {
          ai_verdict: Json | null
          byte_size: number | null
          camera_make: string | null
          captured_at: string | null
          checks: Json
          created_at: string
          duplicate_of: string | null
          has_exif: boolean
          has_gps: boolean
          height: number | null
          id: string
          listing_id: string | null
          mime_type: string | null
          phash: string | null
          score: number
          sha256: string
          status: string
          user_id: string
          width: number | null
        }
        Insert: {
          ai_verdict?: Json | null
          byte_size?: number | null
          camera_make?: string | null
          captured_at?: string | null
          checks?: Json
          created_at?: string
          duplicate_of?: string | null
          has_exif?: boolean
          has_gps?: boolean
          height?: number | null
          id?: string
          listing_id?: string | null
          mime_type?: string | null
          phash?: string | null
          score?: number
          sha256: string
          status?: string
          user_id: string
          width?: number | null
        }
        Update: {
          ai_verdict?: Json | null
          byte_size?: number | null
          camera_make?: string | null
          captured_at?: string | null
          checks?: Json
          created_at?: string
          duplicate_of?: string | null
          has_exif?: boolean
          has_gps?: boolean
          height?: number | null
          id?: string
          listing_id?: string | null
          mime_type?: string | null
          phash?: string | null
          score?: number
          sha256?: string
          status?: string
          user_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_image_checks_duplicate_of_fkey"
            columns: ["duplicate_of"]
            isOneToOne: false
            referencedRelation: "listing_image_checks"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_images: {
        Row: {
          created_at: string
          id: string
          is_cover: boolean
          listing_id: string
          sort_order: number
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_cover?: boolean
          listing_id: string
          sort_order?: number
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_cover?: boolean
          listing_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_verifications: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          notes: string | null
          photo_checks: Json
          reviewed_at: string | null
          reviewer_id: string | null
          status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          notes?: string | null
          photo_checks?: Json
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          notes?: string | null
          photo_checks?: Json
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "listing_verifications_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_videos: {
        Row: {
          chapters: Json
          created_at: string
          id: string
          listing_id: string
          url: string
        }
        Insert: {
          chapters?: Json
          created_at?: string
          id?: string
          listing_id: string
          url: string
        }
        Update: {
          chapters?: Json
          created_at?: string
          id?: string
          listing_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_videos_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          amenities: Json
          bathrooms: number | null
          bedrooms: number | null
          boost_expires_at: string | null
          county: string | null
          created_at: string
          description: string | null
          estate: string | null
          id: string
          landmark: string | null
          lat: number | null
          lng: number | null
          owner_id: string
          price_kes: number
          price_unit: Database["public"]["Enums"]["price_unit"]
          rules: Json
          segment: Database["public"]["Enums"]["listing_segment"]
          sqft: number | null
          status: Database["public"]["Enums"]["listing_status"]
          subcategory: string | null
          subcounty: string | null
          title: string
          updated_at: string
          verification: Database["public"]["Enums"]["verification_status"]
          view_count: number
          ward: string | null
        }
        Insert: {
          amenities?: Json
          bathrooms?: number | null
          bedrooms?: number | null
          boost_expires_at?: string | null
          county?: string | null
          created_at?: string
          description?: string | null
          estate?: string | null
          id?: string
          landmark?: string | null
          lat?: number | null
          lng?: number | null
          owner_id: string
          price_kes: number
          price_unit?: Database["public"]["Enums"]["price_unit"]
          rules?: Json
          segment: Database["public"]["Enums"]["listing_segment"]
          sqft?: number | null
          status?: Database["public"]["Enums"]["listing_status"]
          subcategory?: string | null
          subcounty?: string | null
          title: string
          updated_at?: string
          verification?: Database["public"]["Enums"]["verification_status"]
          view_count?: number
          ward?: string | null
        }
        Update: {
          amenities?: Json
          bathrooms?: number | null
          bedrooms?: number | null
          boost_expires_at?: string | null
          county?: string | null
          created_at?: string
          description?: string | null
          estate?: string | null
          id?: string
          landmark?: string | null
          lat?: number | null
          lng?: number | null
          owner_id?: string
          price_kes?: number
          price_unit?: Database["public"]["Enums"]["price_unit"]
          rules?: Json
          segment?: Database["public"]["Enums"]["listing_segment"]
          sqft?: number | null
          status?: Database["public"]["Enums"]["listing_status"]
          subcategory?: string | null
          subcounty?: string | null
          title?: string
          updated_at?: string
          verification?: Database["public"]["Enums"]["verification_status"]
          view_count?: number
          ward?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_url: string | null
          body: string | null
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          attachment_url?: string | null
          body?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          attachment_url?: string | null
          body?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      neighborhood_scores: {
        Row: {
          avg_rent_kes: number | null
          county: string
          estate: string
          id: string
          noise: number | null
          safety: number | null
          transport: number | null
          updated_at: string
          water: number | null
        }
        Insert: {
          avg_rent_kes?: number | null
          county: string
          estate: string
          id?: string
          noise?: number | null
          safety?: number | null
          transport?: number | null
          updated_at?: string
          water?: number | null
        }
        Update: {
          avg_rent_kes?: number | null
          county?: string
          estate?: string
          id?: string
          noise?: number | null
          safety?: number | null
          transport?: number | null
          updated_at?: string
          water?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          deep_link: string | null
          id: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          deep_link?: string | null
          id?: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          deep_link?: string | null
          id?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      otp_attempts: {
        Row: {
          created_at: string
          id: string
          ip: string
          phone: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip: string
          phone: string
        }
        Update: {
          created_at?: string
          id?: string
          ip?: string
          phone?: string
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          code: string
          created_at: string
          delivered_at: string | null
          delivery_failure_reason: string | null
          delivery_status: string | null
          expires_at: string
          id: string
          message_id: string | null
          phone: string
          used_at: string | null
        }
        Insert: {
          code: string
          created_at?: string
          delivered_at?: string | null
          delivery_failure_reason?: string | null
          delivery_status?: string | null
          expires_at: string
          id?: string
          message_id?: string | null
          phone: string
          used_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          delivered_at?: string | null
          delivery_failure_reason?: string | null
          delivery_status?: string | null
          expires_at?: string
          id?: string
          message_id?: string | null
          phone?: string
          used_at?: string | null
        }
        Relationships: []
      }
      otp_verify_attempts: {
        Row: {
          created_at: string
          id: string
          ip: string
          phone: string
          success: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          ip: string
          phone: string
          success?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          ip?: string
          phone?: string
          success?: boolean
        }
        Relationships: []
      }
      price_alerts: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          threshold_kes: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          threshold_kes?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          threshold_kes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_alerts_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      price_history: {
        Row: {
          changed_at: string
          id: string
          listing_id: string
          price_kes: number
        }
        Insert: {
          changed_at?: string
          id?: string
          listing_id: string
          price_kes: number
        }
        Update: {
          changed_at?: string
          id?: string
          listing_id?: string
          price_kes?: number
        }
        Relationships: [
          {
            foreignKeyName: "price_history_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_verified: boolean
          county: string | null
          created_at: string
          full_name: string | null
          id: string
          id_verified: boolean
          kyc_tier: Database["public"]["Enums"]["kyc_tier"]
          onboarding_completed: boolean
          phone: string | null
          phone_verified: boolean
          preferred_language: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          business_verified?: boolean
          county?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          id_verified?: boolean
          kyc_tier?: Database["public"]["Enums"]["kyc_tier"]
          onboarding_completed?: boolean
          phone?: string | null
          phone_verified?: boolean
          preferred_language?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          business_verified?: boolean
          county?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          id_verified?: boolean
          kyc_tier?: Database["public"]["Enums"]["kyc_tier"]
          onboarding_completed?: boolean
          phone?: string | null
          phone_verified?: boolean
          preferred_language?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      recently_viewed: {
        Row: {
          listing_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          listing_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          listing_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recently_viewed_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          reason: string
          reporter_id: string
          status: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          reason: string
          reporter_id: string
          status?: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          reason?: string
          reporter_id?: string
          status?: Database["public"]["Enums"]["report_status"]
          target_id?: string
          target_type?: Database["public"]["Enums"]["report_target"]
          updated_at?: string
        }
        Relationships: []
      }
      request_attempts: {
        Row: {
          action: string
          created_at: string
          device_id: string | null
          device_integrity: Json
          id: string
          ip: string | null
          meta: Json
          success: boolean
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          device_id?: string | null
          device_integrity?: Json
          id?: string
          ip?: string | null
          meta?: Json
          success?: boolean
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          device_id?: string | null
          device_integrity?: Json
          id?: string
          ip?: string | null
          meta?: Json
          success?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      review_helpful: {
        Row: {
          created_at: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_helpful_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string
          helpful_count: number
          id: string
          photos: Json
          rating: number
          reviewer_id: string
          target_id: string
          target_type: Database["public"]["Enums"]["review_target"]
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          photos?: Json
          rating: number
          reviewer_id: string
          target_id: string
          target_type: Database["public"]["Enums"]["review_target"]
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          photos?: Json
          rating?: number
          reviewer_id?: string
          target_id?: string
          target_type?: Database["public"]["Enums"]["review_target"]
          updated_at?: string
        }
        Relationships: []
      }
      saved_listings: {
        Row: {
          created_at: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_listings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string
          filters: Json
          id: string
          name: string
          notify: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          name: string
          notify?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          name?: string
          notify?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sms_delivery_reports: {
        Row: {
          created_at: string
          failure_reason: string | null
          id: string
          message_id: string | null
          network_code: string | null
          phone: string | null
          raw: Json | null
          status: string | null
        }
        Insert: {
          created_at?: string
          failure_reason?: string | null
          id?: string
          message_id?: string | null
          network_code?: string | null
          phone?: string | null
          raw?: Json | null
          status?: string | null
        }
        Update: {
          created_at?: string
          failure_reason?: string | null
          id?: string
          message_id?: string | null
          network_code?: string | null
          phone?: string | null
          raw?: Json | null
          status?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          active: boolean
          features: Json
          id: string
          listing_cap: number | null
          price_kes: number
          role: Database["public"]["Enums"]["app_role"]
          sort_order: number
          tier: string
        }
        Insert: {
          active?: boolean
          features?: Json
          id?: string
          listing_cap?: number | null
          price_kes: number
          role: Database["public"]["Enums"]["app_role"]
          sort_order?: number
          tier: string
        }
        Update: {
          active?: boolean
          features?: Json
          id?: string
          listing_cap?: number | null
          price_kes?: number
          role?: Database["public"]["Enums"]["app_role"]
          sort_order?: number
          tier?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          mpesa_receipt: string | null
          plan_id: string
          starts_at: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          mpesa_receipt?: string | null
          plan_id: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          mpesa_receipt?: string | null
          plan_id?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      purge_old_otp_attempts: { Args: never; Returns: undefined }
      purge_old_otp_codes: { Args: never; Returns: undefined }
      purge_old_otp_verify_attempts: { Args: never; Returns: undefined }
      purge_old_request_attempts: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role:
        | "tenant"
        | "landlord"
        | "agency"
        | "host"
        | "service_provider"
        | "admin"
      booking_status:
        | "requested"
        | "accepted"
        | "declined"
        | "cancelled"
        | "completed"
      booking_type: "viewing" | "short_stay" | "service"
      dispute_status: "open" | "reviewing" | "resolved" | "closed"
      kyc_status: "pending" | "approved" | "rejected"
      kyc_tier: "none" | "phone" | "id" | "business"
      listing_segment:
        | "rental"
        | "short_stay"
        | "commercial"
        | "corporate"
        | "service"
      listing_status: "draft" | "active" | "rented" | "archived" | "rejected"
      price_unit: "month" | "night" | "sqft" | "job" | "hour"
      report_status: "open" | "reviewing" | "resolved" | "dismissed"
      report_target: "listing" | "user" | "message" | "review"
      review_target: "listing" | "host" | "provider"
      subscription_status: "active" | "expired" | "cancelled" | "pending"
      verification_status: "unverified" | "pending" | "verified" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "tenant",
        "landlord",
        "agency",
        "host",
        "service_provider",
        "admin",
      ],
      booking_status: [
        "requested",
        "accepted",
        "declined",
        "cancelled",
        "completed",
      ],
      booking_type: ["viewing", "short_stay", "service"],
      dispute_status: ["open", "reviewing", "resolved", "closed"],
      kyc_status: ["pending", "approved", "rejected"],
      kyc_tier: ["none", "phone", "id", "business"],
      listing_segment: [
        "rental",
        "short_stay",
        "commercial",
        "corporate",
        "service",
      ],
      listing_status: ["draft", "active", "rented", "archived", "rejected"],
      price_unit: ["month", "night", "sqft", "job", "hour"],
      report_status: ["open", "reviewing", "resolved", "dismissed"],
      report_target: ["listing", "user", "message", "review"],
      review_target: ["listing", "host", "provider"],
      subscription_status: ["active", "expired", "cancelled", "pending"],
      verification_status: ["unverified", "pending", "verified", "rejected"],
    },
  },
} as const
