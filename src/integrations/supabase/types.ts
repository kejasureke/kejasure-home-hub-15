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
      profiles: {
        Row: {
          id: string
          auth_user_id: string | null
          phone: string | null
          role: "tenant" | "landlord" | "agency" | "stayhost" | "serviceprovider"
          first_name: string | null
          last_name: string | null
          display_name: string | null
          avatar: string | null
          agency_name: string | null
          service_category: string | null
          preferred_counties: string[] | null
          budget_range: string | null
          property_count: string | null
          stay_type: string | null
          bio: string | null
          kyc_verified: boolean
          plan_name: string | null
          plan_started_at: string | null
          plan_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id?: string | null
          phone?: string | null
          role?: "tenant" | "landlord" | "agency" | "stayhost" | "serviceprovider"
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          avatar?: string | null
          agency_name?: string | null
          service_category?: string | null
          preferred_counties?: string[] | null
          budget_range?: string | null
          property_count?: string | null
          stay_type?: string | null
          bio?: string | null
          kyc_verified?: boolean
          plan_name?: string | null
          plan_started_at?: string | null
          plan_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string | null
          phone?: string | null
          role?: "tenant" | "landlord" | "agency" | "stayhost" | "serviceprovider"
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          avatar?: string | null
          agency_name?: string | null
          service_category?: string | null
          preferred_counties?: string[] | null
          budget_range?: string | null
          property_count?: string | null
          stay_type?: string | null
          bio?: string | null
          kyc_verified?: boolean
          plan_name?: string | null
          plan_started_at?: string | null
          plan_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          id: string
          role: "tenant" | "landlord" | "agency" | "stayhost" | "serviceprovider"
          name: string
          price: number
          duration: string
          billing_interval: string
          features: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          role: "tenant" | "landlord" | "agency" | "stayhost" | "serviceprovider"
          name: string
          price?: number
          duration: string
          billing_interval: string
          features?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: "tenant" | "landlord" | "agency" | "stayhost" | "serviceprovider"
          name?: string
          price?: number
          duration?: string
          billing_interval?: string
          features?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          profile_id: string
          plan_id: string | null
          plan_name: string
          role: "tenant" | "landlord" | "agency" | "stayhost" | "serviceprovider"
          price: number
          currency: string
          duration: string
          status: "pending" | "active" | "cancelled" | "expired" | "failed"
          auto_renew: boolean
          started_at: string
          expires_at: string | null
          cancelled_at: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          plan_id?: string | null
          plan_name: string
          role: "tenant" | "landlord" | "agency" | "stayhost" | "serviceprovider"
          price: number
          currency?: string
          duration: string
          status?: "pending" | "active" | "cancelled" | "expired" | "failed"
          auto_renew?: boolean
          started_at?: string
          expires_at?: string | null
          cancelled_at?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          plan_id?: string | null
          plan_name?: string
          role?: "tenant" | "landlord" | "agency" | "stayhost" | "serviceprovider"
          price?: number
          currency?: string
          duration?: string
          status?: "pending" | "active" | "cancelled" | "expired" | "failed"
          auto_renew?: boolean
          started_at?: string
          expires_at?: string | null
          cancelled_at?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      listings: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string | null
          listing_type: "rental" | "shortstay" | "commercial" | "service" | "corporate"
          commercial_type: string | null
          rental_type: string | null
          stay_type: string | null
          corporate_type: string | null
          service_category: string | null
          price: number | null
          price_unit: string
          bedrooms: number | null
          bathrooms: number | null
          county: string | null
          subcounty: string | null
          estate: string | null
          amenities: string[] | null
          video_url: string | null
          furnished: boolean
          pet_friendly: boolean
          deposit: string | null
          move_in_date: string | null
          size: string | null
          size_sqft: string | null
          floor: string | null
          featured: boolean
          boost_days: number
          availability: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description?: string | null
          listing_type?: "rental" | "shortstay" | "commercial" | "service" | "corporate"
          commercial_type?: string | null
          rental_type?: string | null
          stay_type?: string | null
          corporate_type?: string | null
          service_category?: string | null
          price?: number | null
          price_unit?: string
          bedrooms?: number | null
          bathrooms?: number | null
          county?: string | null
          subcounty?: string | null
          estate?: string | null
          amenities?: string[] | null
          video_url?: string | null
          furnished?: boolean
          pet_friendly?: boolean
          deposit?: string | null
          move_in_date?: string | null
          size?: string | null
          size_sqft?: string | null
          floor?: string | null
          featured?: boolean
          boost_days?: number
          availability?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string | null
          listing_type?: "rental" | "shortstay" | "commercial" | "service" | "corporate"
          commercial_type?: string | null
          rental_type?: string | null
          stay_type?: string | null
          corporate_type?: string | null
          service_category?: string | null
          price?: number | null
          price_unit?: string
          bedrooms?: number | null
          bathrooms?: number | null
          county?: string | null
          subcounty?: string | null
          estate?: string | null
          amenities?: string[] | null
          video_url?: string | null
          furnished?: boolean
          pet_friendly?: boolean
          deposit?: string | null
          move_in_date?: string | null
          size?: string | null
          size_sqft?: string | null
          floor?: string | null
          featured?: boolean
          boost_days?: number
          availability?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      listing_photos: {
        Row: {
          id: string
          listing_id: string
          url: string
          caption: string | null
          is_cover: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          url: string
          caption?: string | null
          is_cover?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          url?: string
          caption?: string | null
          is_cover?: boolean
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      portfolio_projects: {
        Row: {
          id: string
          profile_id: string
          title: string
          description: string | null
          photos: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          title: string
          description?: string | null
          photos?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          title?: string
          description?: string | null
          photos?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          id: string
          listing_id: string
          requester_id: string
          owner_id: string
          check_in: string | null
          check_out: string | null
          guests: number | null
          status: "pending" | "confirmed" | "cancelled" | "completed" | "rejected"
          amount: number | null
          currency: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          requester_id: string
          owner_id: string
          check_in?: string | null
          check_out?: string | null
          guests?: number | null
          status?: "pending" | "confirmed" | "cancelled" | "completed" | "rejected"
          amount?: number | null
          currency?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          requester_id?: string
          owner_id?: string
          check_in?: string | null
          check_out?: string | null
          guests?: number | null
          status?: "pending" | "confirmed" | "cancelled" | "completed" | "rejected"
          amount?: number | null
          currency?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          author_id: string
          target_profile_id: string
          listing_id: string | null
          rating: number
          title: string | null
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          author_id: string
          target_profile_id: string
          listing_id?: string | null
          rating: number
          title?: string | null
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          target_profile_id?: string
          listing_id?: string | null
          rating?: number
          title?: string | null
          message?: string | null
          created_at?: string
        }
        Relationships: []
      }
      disputes: {
        Row: {
          id: string
          profile_id: string
          listing_id: string | null
          category: "listing-mismatch" | "billing" | "fraud" | "other"
          description: string
          status: "open" | "investigating" | "resolved" | "closed"
          resolution: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          listing_id?: string | null
          category?: "listing-mismatch" | "billing" | "fraud" | "other"
          description: string
          status?: "open" | "investigating" | "resolved" | "closed"
          resolution?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          listing_id?: string | null
          category?: "listing-mismatch" | "billing" | "fraud" | "other"
          description?: string
          status?: "open" | "investigating" | "resolved" | "closed"
          resolution?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          id: string
          profile_id: string
          type: string
          url: string
          status: string
          metadata: Json | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          type: string
          url: string
          status?: string
          metadata?: Json | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          type?: string
          url?: string
          status?: string
          metadata?: Json | null
          uploaded_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          profile_id: string
          subscription_id: string | null
          listing_id: string | null
          amount: number
          currency: string
          method: string
          status: "pending" | "completed" | "failed" | "refunded"
          transaction_id: string | null
          metadata: Json | null
          processed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          subscription_id?: string | null
          listing_id?: string | null
          amount: number
          currency?: string
          method: string
          status?: "pending" | "completed" | "failed" | "refunded"
          transaction_id?: string | null
          metadata?: Json | null
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          subscription_id?: string | null
          listing_id?: string | null
          amount?: number
          currency?: string
          method?: string
          status?: "pending" | "completed" | "failed" | "refunded"
          transaction_id?: string | null
          metadata?: Json | null
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      purge_old_otp_attempts: { Args: never; Returns: undefined }
      purge_old_otp_verify_attempts: { Args: never; Returns: undefined }
      current_auth_user_id: { Args: never; Returns: string | null }
      current_profile_id: { Args: never; Returns: string | null }
      current_profile: { Args: never; Returns: Database["public"]["Tables"]["profiles"]["Row"] | null }
      upsert_profile: {
        Args: {
          phone?: string | null
          role?: "tenant" | "landlord" | "agency" | "stayhost" | "serviceprovider"
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          avatar?: string | null
          agency_name?: string | null
          service_category?: string | null
          preferred_counties?: string[] | null
          budget_range?: string | null
          property_count?: string | null
          stay_type?: string | null
          bio?: string | null
        }
        Returns: Database["public"]["Tables"]["profiles"]["Row"]
      }
      create_subscription: {
        Args: {
          plan_id?: string | null
          plan_name: string
          role: "tenant" | "landlord" | "agency" | "stayhost" | "serviceprovider"
          price: number
          duration: string
          auto_renew?: boolean
          currency?: string
          metadata?: Json | null
        }
        Returns: Database["public"]["Tables"]["subscriptions"]["Row"]
      }
      cancel_subscription: {
        Args: {
          subscription_id: string
        }
        Returns: Database["public"]["Tables"]["subscriptions"]["Row"]
      }
      create_payment: {
        Args: {
          subscription_id?: string | null
          listing_id?: string | null
          amount: number
          currency?: string
          method: string
          status?: "pending" | "completed" | "failed" | "refunded"
          transaction_id?: string | null
          metadata?: Json | null
        }
        Returns: Database["public"]["Tables"]["payments"]["Row"]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
