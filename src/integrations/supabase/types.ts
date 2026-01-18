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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          add_ons: string[] | null
          created_at: string
          customer_email: string | null
          deposit_amount: number | null
          deposit_paid_at: string | null
          deposit_percentage: number | null
          event_date: string
          event_location: string
          final_amount: number | null
          final_paid_at: string | null
          id: string
          notes: string | null
          package_id: string
          payment_amount: number | null
          payment_status: string | null
          platform_fee_amount: number | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_deposit_payment_intent_id: string | null
          stripe_final_payment_intent_id: string | null
          stripe_payment_intent_id: string | null
          total_price: number
          units: number
          updated_at: string
          user_id: string
          vendor_id: string
          vendor_stripe_account_id: string | null
          vendor_user_id: string | null
        }
        Insert: {
          add_ons?: string[] | null
          created_at?: string
          customer_email?: string | null
          deposit_amount?: number | null
          deposit_paid_at?: string | null
          deposit_percentage?: number | null
          event_date: string
          event_location: string
          final_amount?: number | null
          final_paid_at?: string | null
          id?: string
          notes?: string | null
          package_id: string
          payment_amount?: number | null
          payment_status?: string | null
          platform_fee_amount?: number | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_deposit_payment_intent_id?: string | null
          stripe_final_payment_intent_id?: string | null
          stripe_payment_intent_id?: string | null
          total_price: number
          units?: number
          updated_at?: string
          user_id: string
          vendor_id: string
          vendor_stripe_account_id?: string | null
          vendor_user_id?: string | null
        }
        Update: {
          add_ons?: string[] | null
          created_at?: string
          customer_email?: string | null
          deposit_amount?: number | null
          deposit_paid_at?: string | null
          deposit_percentage?: number | null
          event_date?: string
          event_location?: string
          final_amount?: number | null
          final_paid_at?: string | null
          id?: string
          notes?: string | null
          package_id?: string
          payment_amount?: number | null
          payment_status?: string | null
          platform_fee_amount?: number | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_deposit_payment_intent_id?: string | null
          stripe_final_payment_intent_id?: string | null
          stripe_payment_intent_id?: string | null
          total_price?: number
          units?: number
          updated_at?: string
          user_id?: string
          vendor_id?: string
          vendor_stripe_account_id?: string | null
          vendor_user_id?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          user_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          vendor_id?: string
        }
        Relationships: []
      }
      payment_reminders: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          reminder_type: string
          sent_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          reminder_type: string
          sent_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          reminder_type?: string
          sent_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          identity_verification_session_id: string | null
          identity_verification_status: string | null
          is_vendor: boolean | null
          onboarding_completed_at: string | null
          phone: string | null
          stripe_account_id: string | null
          stripe_account_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          identity_verification_session_id?: string | null
          identity_verification_status?: string | null
          is_vendor?: boolean | null
          onboarding_completed_at?: string | null
          phone?: string | null
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          identity_verification_session_id?: string | null
          identity_verification_status?: string | null
          is_vendor?: boolean | null
          onboarding_completed_at?: string | null
          phone?: string | null
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string | null
          content: string | null
          created_at: string
          event_date: string | null
          event_type: string | null
          helpful_count: number | null
          id: string
          is_verified_booking: boolean | null
          package_id: string | null
          rating: number
          reviewer_avatar: string | null
          reviewer_name: string
          reviewer_user_id: string
          title: string | null
          updated_at: string
          vendor_user_id: string
        }
        Insert: {
          booking_id?: string | null
          content?: string | null
          created_at?: string
          event_date?: string | null
          event_type?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_booking?: boolean | null
          package_id?: string | null
          rating: number
          reviewer_avatar?: string | null
          reviewer_name: string
          reviewer_user_id: string
          title?: string | null
          updated_at?: string
          vendor_user_id: string
        }
        Update: {
          booking_id?: string | null
          content?: string | null
          created_at?: string
          event_date?: string | null
          event_type?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_booking?: boolean | null
          package_id?: string | null
          rating?: number
          reviewer_avatar?: string | null
          reviewer_name?: string
          reviewer_user_id?: string
          title?: string | null
          updated_at?: string
          vendor_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "vendor_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_availability: {
        Row: {
          created_at: string
          date: string
          id: string
          is_blocked: boolean
          reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          is_blocked?: boolean
          reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_blocked?: boolean
          reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vendor_details: {
        Row: {
          business_description: string | null
          business_name: string | null
          business_type: string | null
          created_at: string
          id: string
          service_area: string | null
          service_categories: string[] | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          business_description?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          id?: string
          service_area?: string | null
          service_categories?: string[] | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          business_description?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          id?: string
          service_area?: string | null
          service_categories?: string[] | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      vendor_packages: {
        Row: {
          add_ons: Json | null
          cancellation_policy: string | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          includes: string[] | null
          instant_book: boolean | null
          is_active: boolean | null
          min_units: number
          name: string
          price: number
          requirements: string[] | null
          sort_order: number | null
          travel_fee_per_mile: number | null
          travel_radius: number | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          add_ons?: Json | null
          cancellation_policy?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          includes?: string[] | null
          instant_book?: boolean | null
          is_active?: boolean | null
          min_units?: number
          name: string
          price: number
          requirements?: string[] | null
          sort_order?: number | null
          travel_fee_per_mile?: number | null
          travel_radius?: number | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          add_ons?: Json | null
          cancellation_policy?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          includes?: string[] | null
          instant_book?: boolean | null
          is_active?: boolean | null
          min_units?: number
          name?: string
          price?: number
          requirements?: string[] | null
          sort_order?: number | null
          travel_fee_per_mile?: number | null
          travel_radius?: number | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vendor_recurring_availability: {
        Row: {
          created_at: string
          day_of_week: number
          id: string
          is_blocked: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          id?: string
          is_blocked?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          id?: string
          is_blocked?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
