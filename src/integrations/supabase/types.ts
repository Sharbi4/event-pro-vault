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
      analytics_events: {
        Row: {
          category: string | null
          city: string | null
          created_at: string
          event_name: string
          id: string
          lead_id: string | null
          metadata: Json | null
          package_id: string | null
          page_path: string | null
          pro_id: string | null
          referral_code: string | null
          referrer: string | null
          session_id: string
          state: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          category?: string | null
          city?: string | null
          created_at?: string
          event_name: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          package_id?: string | null
          page_path?: string | null
          pro_id?: string | null
          referral_code?: string | null
          referrer?: string | null
          session_id: string
          state?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          category?: string | null
          city?: string | null
          created_at?: string
          event_name?: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          package_id?: string | null
          page_path?: string | null
          pro_id?: string | null
          referral_code?: string | null
          referrer?: string | null
          session_id?: string
          state?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_avatar: string | null
          author_id: string | null
          author_name: string
          category: string
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          published_at: string | null
          read_time_minutes: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_avatar?: string | null
          author_id?: string | null
          author_name: string
          category: string
          content: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          read_time_minutes?: number | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_avatar?: string | null
          author_id?: string | null
          author_name?: string
          category?: string
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          read_time_minutes?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          add_ons: string[] | null
          address_line1: string | null
          address_line2: string | null
          billing_address_line1: string | null
          billing_address_line2: string | null
          billing_city: string | null
          billing_same_as_event: boolean
          billing_state: string | null
          billing_zip: string | null
          booking_mode: string | null
          booking_type: string
          breakdown_minutes: number | null
          calendar_block_end: string | null
          calendar_block_start: string | null
          cancellation_deadline: string | null
          cancelled_at: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          deposit_amount: number | null
          deposit_paid_at: string | null
          deposit_percentage: number | null
          duration_minutes: number | null
          end_time: string | null
          event_city: string | null
          event_date: string
          event_end_at: string | null
          event_location: string
          event_start_at: string | null
          event_state: string | null
          event_timezone: string | null
          event_zip: string | null
          final_amount: number | null
          final_paid_at: string | null
          fulfillment_type: string | null
          id: string
          lifecycle_status: string | null
          notes: string | null
          package_id: string
          payment_amount: number | null
          payment_method: string | null
          payment_status: string | null
          platform_fee_amount: number | null
          private_package_id: string | null
          selected_add_ons: Json
          selected_menu_items: Json
          selected_variation_id: string | null
          setup_minutes: number | null
          start_time: string | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_deposit_payment_intent_id: string | null
          stripe_final_payment_intent_id: string | null
          stripe_payment_intent_id: string | null
          total_price: number
          units: number
          updated_at: string
          user_id: string | null
          vendor_id: string
          vendor_stripe_account_id: string | null
          vendor_user_id: string | null
        }
        Insert: {
          add_ons?: string[] | null
          address_line1?: string | null
          address_line2?: string | null
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_same_as_event?: boolean
          billing_state?: string | null
          billing_zip?: string | null
          booking_mode?: string | null
          booking_type?: string
          breakdown_minutes?: number | null
          calendar_block_end?: string | null
          calendar_block_start?: string | null
          cancellation_deadline?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          deposit_amount?: number | null
          deposit_paid_at?: string | null
          deposit_percentage?: number | null
          duration_minutes?: number | null
          end_time?: string | null
          event_city?: string | null
          event_date: string
          event_end_at?: string | null
          event_location: string
          event_start_at?: string | null
          event_state?: string | null
          event_timezone?: string | null
          event_zip?: string | null
          final_amount?: number | null
          final_paid_at?: string | null
          fulfillment_type?: string | null
          id?: string
          lifecycle_status?: string | null
          notes?: string | null
          package_id: string
          payment_amount?: number | null
          payment_method?: string | null
          payment_status?: string | null
          platform_fee_amount?: number | null
          private_package_id?: string | null
          selected_add_ons?: Json
          selected_menu_items?: Json
          selected_variation_id?: string | null
          setup_minutes?: number | null
          start_time?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_deposit_payment_intent_id?: string | null
          stripe_final_payment_intent_id?: string | null
          stripe_payment_intent_id?: string | null
          total_price: number
          units?: number
          updated_at?: string
          user_id?: string | null
          vendor_id: string
          vendor_stripe_account_id?: string | null
          vendor_user_id?: string | null
        }
        Update: {
          add_ons?: string[] | null
          address_line1?: string | null
          address_line2?: string | null
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_same_as_event?: boolean
          billing_state?: string | null
          billing_zip?: string | null
          booking_mode?: string | null
          booking_type?: string
          breakdown_minutes?: number | null
          calendar_block_end?: string | null
          calendar_block_start?: string | null
          cancellation_deadline?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          deposit_amount?: number | null
          deposit_paid_at?: string | null
          deposit_percentage?: number | null
          duration_minutes?: number | null
          end_time?: string | null
          event_city?: string | null
          event_date?: string
          event_end_at?: string | null
          event_location?: string
          event_start_at?: string | null
          event_state?: string | null
          event_timezone?: string | null
          event_zip?: string | null
          final_amount?: number | null
          final_paid_at?: string | null
          fulfillment_type?: string | null
          id?: string
          lifecycle_status?: string | null
          notes?: string | null
          package_id?: string
          payment_amount?: number | null
          payment_method?: string | null
          payment_status?: string | null
          platform_fee_amount?: number | null
          private_package_id?: string | null
          selected_add_ons?: Json
          selected_menu_items?: Json
          selected_variation_id?: string | null
          setup_minutes?: number | null
          start_time?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_deposit_payment_intent_id?: string | null
          stripe_final_payment_intent_id?: string | null
          stripe_payment_intent_id?: string | null
          total_price?: number
          units?: number
          updated_at?: string
          user_id?: string | null
          vendor_id?: string
          vendor_stripe_account_id?: string | null
          vendor_user_id?: string | null
        }
        Relationships: []
      }
      calendar_holds: {
        Row: {
          booking_id: string | null
          created_at: string
          customer_email: string | null
          customer_user_id: string | null
          expires_at: string
          hold_end: string
          hold_start: string
          id: string
          package_id: string | null
          source: string
          status: string
          updated_at: string
          vendor_user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_user_id?: string | null
          expires_at: string
          hold_end: string
          hold_start: string
          id?: string
          package_id?: string | null
          source?: string
          status?: string
          updated_at?: string
          vendor_user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_user_id?: string | null
          expires_at?: string
          hold_end?: string
          hold_start?: string
          id?: string
          package_id?: string | null
          source?: string
          status?: string
          updated_at?: string
          vendor_user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          booking_id: string | null
          client_email: string | null
          client_name: string | null
          client_unread_count: number | null
          client_user_id: string | null
          created_at: string
          id: string
          last_message_at: string | null
          status: string | null
          subject: string | null
          updated_at: string
          vendor_unread_count: number | null
          vendor_user_id: string
        }
        Insert: {
          booking_id?: string | null
          client_email?: string | null
          client_name?: string | null
          client_unread_count?: number | null
          client_user_id?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string
          vendor_unread_count?: number | null
          vendor_user_id: string
        }
        Update: {
          booking_id?: string | null
          client_email?: string | null
          client_name?: string | null
          client_unread_count?: number | null
          client_user_id?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string
          vendor_unread_count?: number | null
          vendor_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          booking_id: string
          created_at: string
          deposit_refund_ordered: boolean | null
          description: string | null
          evidence_urls: string[] | null
          filed_by_type: string
          id: string
          mediation_started_at: string | null
          payout_held: boolean | null
          reason: string
          reported_by_user_id: string
          requested_remedy: string | null
          requested_remedy_details: string | null
          resolution: string | null
          resolution_deadline: string | null
          resolution_notes: string | null
          resolution_outcome: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
          vendor_proposed_remedy: string | null
          vendor_responded_at: string | null
          vendor_response: string | null
          vendor_response_deadline: string | null
          vendor_user_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          deposit_refund_ordered?: boolean | null
          description?: string | null
          evidence_urls?: string[] | null
          filed_by_type?: string
          id?: string
          mediation_started_at?: string | null
          payout_held?: boolean | null
          reason: string
          reported_by_user_id: string
          requested_remedy?: string | null
          requested_remedy_details?: string | null
          resolution?: string | null
          resolution_deadline?: string | null
          resolution_notes?: string | null
          resolution_outcome?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
          vendor_proposed_remedy?: string | null
          vendor_responded_at?: string | null
          vendor_response?: string | null
          vendor_response_deadline?: string | null
          vendor_user_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          deposit_refund_ordered?: boolean | null
          description?: string | null
          evidence_urls?: string[] | null
          filed_by_type?: string
          id?: string
          mediation_started_at?: string | null
          payout_held?: boolean | null
          reason?: string
          reported_by_user_id?: string
          requested_remedy?: string | null
          requested_remedy_details?: string | null
          resolution?: string | null
          resolution_deadline?: string | null
          resolution_notes?: string | null
          resolution_outcome?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
          vendor_proposed_remedy?: string | null
          vendor_responded_at?: string | null
          vendor_response?: string | null
          vendor_response_deadline?: string | null
          vendor_user_id?: string
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
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
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
      identity_verification_events: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          session_id: string | null
          status: string
          stripe_event_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          status: string
          stripe_event_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          status?: string
          stripe_event_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          address: string | null
          budget_max: number | null
          budget_min: number | null
          category: string | null
          city: string | null
          created_at: string
          customer_name: string | null
          email: string
          event_end: string | null
          event_start: string | null
          event_time_end: string | null
          event_time_start: string | null
          event_type: string | null
          id: string
          matched_at: string | null
          matched_package_id: string | null
          notes: string | null
          phone: string | null
          search_query: Json | null
          source: string
          state: string | null
          status: string
          updated_at: string
          user_id: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          budget_max?: number | null
          budget_min?: number | null
          category?: string | null
          city?: string | null
          created_at?: string
          customer_name?: string | null
          email: string
          event_end?: string | null
          event_start?: string | null
          event_time_end?: string | null
          event_time_start?: string | null
          event_type?: string | null
          id?: string
          matched_at?: string | null
          matched_package_id?: string | null
          notes?: string | null
          phone?: string | null
          search_query?: Json | null
          source?: string
          state?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          budget_max?: number | null
          budget_min?: number | null
          category?: string | null
          city?: string | null
          created_at?: string
          customer_name?: string | null
          email?: string
          event_end?: string | null
          event_start?: string | null
          event_time_end?: string | null
          event_time_start?: string | null
          event_type?: string | null
          id?: string
          matched_at?: string | null
          matched_package_id?: string | null
          notes?: string | null
          phone?: string | null
          search_query?: Json | null
          source?: string
          state?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      markets: {
        Row: {
          approval_notes: string | null
          approval_reviewed_at: string | null
          approval_reviewed_by: string | null
          approval_status: string | null
          booking_mode: string | null
          bookings_enabled: boolean | null
          breakdown_window_minutes: number | null
          categories_allowed: string[] | null
          city: string | null
          cover_image_url: string | null
          created_at: string
          crowd_description: string | null
          description: string | null
          formatted_address: string | null
          id: string
          is_published: boolean | null
          lat: number | null
          lng: number | null
          market_status: string | null
          market_type: string
          media_items: Json | null
          name: string
          operating_season: string | null
          seasonal_months: string[] | null
          setup_window_minutes: number | null
          state: string | null
          stripe_account_id: string | null
          stripe_account_status: string | null
          timezone: string | null
          updated_at: string
          user_id: string
          weekly_schedule: Json | null
        }
        Insert: {
          approval_notes?: string | null
          approval_reviewed_at?: string | null
          approval_reviewed_by?: string | null
          approval_status?: string | null
          booking_mode?: string | null
          bookings_enabled?: boolean | null
          breakdown_window_minutes?: number | null
          categories_allowed?: string[] | null
          city?: string | null
          cover_image_url?: string | null
          created_at?: string
          crowd_description?: string | null
          description?: string | null
          formatted_address?: string | null
          id?: string
          is_published?: boolean | null
          lat?: number | null
          lng?: number | null
          market_status?: string | null
          market_type: string
          media_items?: Json | null
          name: string
          operating_season?: string | null
          seasonal_months?: string[] | null
          setup_window_minutes?: number | null
          state?: string | null
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
          weekly_schedule?: Json | null
        }
        Update: {
          approval_notes?: string | null
          approval_reviewed_at?: string | null
          approval_reviewed_by?: string | null
          approval_status?: string | null
          booking_mode?: string | null
          bookings_enabled?: boolean | null
          breakdown_window_minutes?: number | null
          categories_allowed?: string[] | null
          city?: string | null
          cover_image_url?: string | null
          created_at?: string
          crowd_description?: string | null
          description?: string | null
          formatted_address?: string | null
          id?: string
          is_published?: boolean | null
          lat?: number | null
          lng?: number | null
          market_status?: string | null
          market_type?: string
          media_items?: Json | null
          name?: string
          operating_season?: string | null
          seasonal_months?: string[] | null
          setup_window_minutes?: number | null
          state?: string | null
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
          weekly_schedule?: Json | null
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          name: string
          sort_order: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          name: string
          sort_order?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attached_private_package_id: string | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          read_at: string | null
          sender_type: string
          sender_user_id: string | null
        }
        Insert: {
          attached_private_package_id?: string | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          sender_type: string
          sender_user_id?: string | null
        }
        Update: {
          attached_private_package_id?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          sender_type?: string
          sender_user_id?: string | null
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
      package_availability: {
        Row: {
          created_at: string
          date: string
          id: string
          is_blocked: boolean
          package_id: string
          reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          is_blocked?: boolean
          package_id: string
          reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_blocked?: boolean
          package_id?: string
          reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_availability_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "vendor_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      package_variations: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          includes: string[] | null
          is_default: boolean
          max_guests: number | null
          min_guests: number | null
          name: string
          package_id: string
          price: number
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          includes?: string[] | null
          is_default?: boolean
          max_guests?: number | null
          min_guests?: number | null
          name: string
          package_id: string
          price?: number
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          includes?: string[] | null
          is_default?: boolean
          max_guests?: number | null
          min_guests?: number | null
          name?: string
          package_id?: string
          price?: number
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      package_weekly_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_enabled: boolean
          package_id: string
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_enabled?: boolean
          package_id: string
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_enabled?: boolean
          package_id?: string
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_weekly_availability_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "vendor_packages"
            referencedColumns: ["id"]
          },
        ]
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
      private_packages: {
        Row: {
          accepted_at: string | null
          add_ons: Json | null
          address_line1: string | null
          address_line2: string | null
          base_price: number
          booking_id: string | null
          breakdown_time_minutes: number | null
          calendar_block_end: string | null
          calendar_block_start: string | null
          cancellation_policy: string | null
          cancelled_at: string | null
          category: string | null
          conversation_id: string | null
          created_at: string
          customer_email: string | null
          customer_notes: string | null
          customer_user_id: string | null
          deposit_amount: number | null
          description: string | null
          end_time: string | null
          event_city: string | null
          event_date: string | null
          event_state: string | null
          event_zip: string | null
          guest_count: number | null
          id: string
          included_items: string[] | null
          location: string | null
          menu_details: string | null
          offer_expires_at: string | null
          package_name: string
          paid_at: string | null
          per_person_price: number | null
          sent_at: string | null
          service_duration_minutes: number | null
          setup_time_minutes: number | null
          start_time: string | null
          status: string
          total_price: number
          travel_fee: number | null
          updated_at: string
          vendor_notes: string | null
          vendor_user_id: string
          viewed_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          add_ons?: Json | null
          address_line1?: string | null
          address_line2?: string | null
          base_price?: number
          booking_id?: string | null
          breakdown_time_minutes?: number | null
          calendar_block_end?: string | null
          calendar_block_start?: string | null
          cancellation_policy?: string | null
          cancelled_at?: string | null
          category?: string | null
          conversation_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_notes?: string | null
          customer_user_id?: string | null
          deposit_amount?: number | null
          description?: string | null
          end_time?: string | null
          event_city?: string | null
          event_date?: string | null
          event_state?: string | null
          event_zip?: string | null
          guest_count?: number | null
          id?: string
          included_items?: string[] | null
          location?: string | null
          menu_details?: string | null
          offer_expires_at?: string | null
          package_name: string
          paid_at?: string | null
          per_person_price?: number | null
          sent_at?: string | null
          service_duration_minutes?: number | null
          setup_time_minutes?: number | null
          start_time?: string | null
          status?: string
          total_price?: number
          travel_fee?: number | null
          updated_at?: string
          vendor_notes?: string | null
          vendor_user_id: string
          viewed_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          add_ons?: Json | null
          address_line1?: string | null
          address_line2?: string | null
          base_price?: number
          booking_id?: string | null
          breakdown_time_minutes?: number | null
          calendar_block_end?: string | null
          calendar_block_start?: string | null
          cancellation_policy?: string | null
          cancelled_at?: string | null
          category?: string | null
          conversation_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_notes?: string | null
          customer_user_id?: string | null
          deposit_amount?: number | null
          description?: string | null
          end_time?: string | null
          event_city?: string | null
          event_date?: string | null
          event_state?: string | null
          event_zip?: string | null
          guest_count?: number | null
          id?: string
          included_items?: string[] | null
          location?: string | null
          menu_details?: string | null
          offer_expires_at?: string | null
          package_name?: string
          paid_at?: string | null
          per_person_price?: number | null
          sent_at?: string | null
          service_duration_minutes?: number | null
          setup_time_minutes?: number | null
          start_time?: string | null
          status?: string
          total_price?: number
          travel_fee?: number | null
          updated_at?: string
          vendor_notes?: string | null
          vendor_user_id?: string
          viewed_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approval_notes: string | null
          approval_reviewed_at: string | null
          approval_reviewed_by: string | null
          approval_status: string | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          identity_verification_session_id: string | null
          identity_verification_status: string | null
          identity_verified_at: string | null
          instagram_handle: string | null
          is_identity_verified: boolean
          is_published: boolean | null
          is_vendor: boolean | null
          last_name: string | null
          onboarding_completed_at: string | null
          onboarding_step: string | null
          online_payments_enabled: boolean
          phone: string | null
          primary_city: string | null
          profile_type: string | null
          short_bio: string | null
          stripe_account_id: string | null
          stripe_account_status: string | null
          subscription_ends_at: string | null
          subscription_tier: string | null
          trust_score: number
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          approval_notes?: string | null
          approval_reviewed_at?: string | null
          approval_reviewed_by?: string | null
          approval_status?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          identity_verification_session_id?: string | null
          identity_verification_status?: string | null
          identity_verified_at?: string | null
          instagram_handle?: string | null
          is_identity_verified?: boolean
          is_published?: boolean | null
          is_vendor?: boolean | null
          last_name?: string | null
          onboarding_completed_at?: string | null
          onboarding_step?: string | null
          online_payments_enabled?: boolean
          phone?: string | null
          primary_city?: string | null
          profile_type?: string | null
          short_bio?: string | null
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          subscription_ends_at?: string | null
          subscription_tier?: string | null
          trust_score?: number
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          approval_notes?: string | null
          approval_reviewed_at?: string | null
          approval_reviewed_by?: string | null
          approval_status?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          identity_verification_session_id?: string | null
          identity_verification_status?: string | null
          identity_verified_at?: string | null
          instagram_handle?: string | null
          is_identity_verified?: boolean
          is_published?: boolean | null
          is_vendor?: boolean | null
          last_name?: string | null
          onboarding_completed_at?: string | null
          onboarding_step?: string | null
          online_payments_enabled?: boolean
          phone?: string | null
          primary_city?: string | null
          profile_type?: string | null
          short_bio?: string | null
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          subscription_ends_at?: string | null
          subscription_tier?: string | null
          trust_score?: number
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      referral_invites: {
        Row: {
          category: string | null
          city: string | null
          clicks: number
          created_at: string
          created_by_user_id: string | null
          id: string
          is_active: boolean
          ref_code: string
          signups: number
        }
        Insert: {
          category?: string | null
          city?: string | null
          clicks?: number
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          is_active?: boolean
          ref_code: string
          signups?: number
        }
        Update: {
          category?: string | null
          city?: string | null
          clicks?: number
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          is_active?: boolean
          ref_code?: string
          signups?: number
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
          photo_urls: string[] | null
          rating: number
          reviewer_avatar: string | null
          reviewer_name: string
          reviewer_user_id: string
          tags: string[] | null
          title: string | null
          updated_at: string
          vendor_reply: string | null
          vendor_reply_at: string | null
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
          photo_urls?: string[] | null
          rating: number
          reviewer_avatar?: string | null
          reviewer_name: string
          reviewer_user_id: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          vendor_reply?: string | null
          vendor_reply_at?: string | null
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
          photo_urls?: string[] | null
          rating?: number
          reviewer_avatar?: string | null
          reviewer_name?: string
          reviewer_user_id?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          vendor_reply?: string | null
          vendor_reply_at?: string | null
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
      share_events: {
        Row: {
          channel: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          referrer: string | null
          share_link_id: string | null
          user_agent: string | null
          vendor_user_id: string
        }
        Insert: {
          channel?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          referrer?: string | null
          share_link_id?: string | null
          user_agent?: string | null
          vendor_user_id: string
        }
        Update: {
          channel?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          referrer?: string | null
          share_link_id?: string | null
          user_agent?: string | null
          vendor_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "share_events_share_link_id_fkey"
            columns: ["share_link_id"]
            isOneToOne: false
            referencedRelation: "share_links"
            referencedColumns: ["id"]
          },
        ]
      }
      share_invites: {
        Row: {
          channel: string
          converted_at: string | null
          created_at: string
          id: string
          message: string | null
          opened_at: string | null
          recipient_email: string | null
          recipient_name: string | null
          recipient_phone: string | null
          sent_at: string
          share_link_id: string | null
          status: string
          vendor_user_id: string
        }
        Insert: {
          channel: string
          converted_at?: string | null
          created_at?: string
          id?: string
          message?: string | null
          opened_at?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          sent_at?: string
          share_link_id?: string | null
          status?: string
          vendor_user_id: string
        }
        Update: {
          channel?: string
          converted_at?: string | null
          created_at?: string
          id?: string
          message?: string | null
          opened_at?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          sent_at?: string
          share_link_id?: string | null
          status?: string
          vendor_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "share_invites_share_link_id_fkey"
            columns: ["share_link_id"]
            isOneToOne: false
            referencedRelation: "share_links"
            referencedColumns: ["id"]
          },
        ]
      }
      share_links: {
        Row: {
          booking_count: number
          channel: string | null
          click_count: number
          code: string
          created_at: string
          id: string
          is_active: boolean
          package_id: string | null
          points_earned: number
          signup_count: number
          updated_at: string
          vendor_user_id: string
        }
        Insert: {
          booking_count?: number
          channel?: string | null
          click_count?: number
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          package_id?: string | null
          points_earned?: number
          signup_count?: number
          updated_at?: string
          vendor_user_id: string
        }
        Update: {
          booking_count?: number
          channel?: string | null
          click_count?: number
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          package_id?: string | null
          points_earned?: number
          signup_count?: number
          updated_at?: string
          vendor_user_id?: string
        }
        Relationships: []
      }
      slot_bookings: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          arrival_time: string | null
          base_amount: number | null
          booth_size: string | null
          created_at: string
          has_generator: boolean | null
          id: string
          is_recurring: boolean | null
          market_id: string
          needs_power: boolean | null
          needs_water: boolean | null
          needs_wifi: boolean | null
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          platform_fee_amount: number | null
          platform_fee_rate: number | null
          power_amps: number | null
          quantity: number
          recurring_parent_id: string | null
          recurring_week_number: number | null
          setup_notes: string | null
          slot_inventory_id: string
          slot_type_id: string
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          total_price: number
          truck_length_feet: number | null
          updated_at: string
          user_id: string | null
          vendor_category: string | null
          vendor_city: string | null
          vendor_email: string | null
          vendor_name: string | null
          vendor_phone: string | null
          vendor_state: string | null
          vendor_type: string | null
          vendor_user_id: string
          vendor_zip: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          arrival_time?: string | null
          base_amount?: number | null
          booth_size?: string | null
          created_at?: string
          has_generator?: boolean | null
          id?: string
          is_recurring?: boolean | null
          market_id: string
          needs_power?: boolean | null
          needs_water?: boolean | null
          needs_wifi?: boolean | null
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          platform_fee_amount?: number | null
          platform_fee_rate?: number | null
          power_amps?: number | null
          quantity?: number
          recurring_parent_id?: string | null
          recurring_week_number?: number | null
          setup_notes?: string | null
          slot_inventory_id: string
          slot_type_id: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          total_price: number
          truck_length_feet?: number | null
          updated_at?: string
          user_id?: string | null
          vendor_category?: string | null
          vendor_city?: string | null
          vendor_email?: string | null
          vendor_name?: string | null
          vendor_phone?: string | null
          vendor_state?: string | null
          vendor_type?: string | null
          vendor_user_id: string
          vendor_zip?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          arrival_time?: string | null
          base_amount?: number | null
          booth_size?: string | null
          created_at?: string
          has_generator?: boolean | null
          id?: string
          is_recurring?: boolean | null
          market_id?: string
          needs_power?: boolean | null
          needs_water?: boolean | null
          needs_wifi?: boolean | null
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          platform_fee_amount?: number | null
          platform_fee_rate?: number | null
          power_amps?: number | null
          quantity?: number
          recurring_parent_id?: string | null
          recurring_week_number?: number | null
          setup_notes?: string | null
          slot_inventory_id?: string
          slot_type_id?: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          total_price?: number
          truck_length_feet?: number | null
          updated_at?: string
          user_id?: string | null
          vendor_category?: string | null
          vendor_city?: string | null
          vendor_email?: string | null
          vendor_name?: string | null
          vendor_phone?: string | null
          vendor_state?: string | null
          vendor_type?: string | null
          vendor_user_id?: string
          vendor_zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "slot_bookings_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slot_bookings_recurring_parent_id_fkey"
            columns: ["recurring_parent_id"]
            isOneToOne: false
            referencedRelation: "slot_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slot_bookings_slot_inventory_id_fkey"
            columns: ["slot_inventory_id"]
            isOneToOne: false
            referencedRelation: "slot_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slot_bookings_slot_type_id_fkey"
            columns: ["slot_type_id"]
            isOneToOne: false
            referencedRelation: "slot_types"
            referencedColumns: ["id"]
          },
        ]
      }
      slot_inventory: {
        Row: {
          created_at: string
          date: string
          end_time: string
          id: string
          market_id: string
          notes: string | null
          price_override: number | null
          slot_type_id: string
          slots_remaining: number
          start_time: string
          total_slots: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          end_time: string
          id?: string
          market_id: string
          notes?: string | null
          price_override?: number | null
          slot_type_id: string
          slots_remaining?: number
          start_time: string
          total_slots?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          market_id?: string
          notes?: string | null
          price_override?: number | null
          slot_type_id?: string
          slots_remaining?: number
          start_time?: string
          total_slots?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "slot_inventory_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slot_inventory_slot_type_id_fkey"
            columns: ["slot_type_id"]
            isOneToOne: false
            referencedRelation: "slot_types"
            referencedColumns: ["id"]
          },
        ]
      }
      slot_types: {
        Row: {
          amenities: string[] | null
          category: string
          created_at: string
          id: string
          is_active: boolean | null
          length_feet: number | null
          market_id: string
          name: string
          notes: string | null
          price: number
          pricing_unit: string
          requirements: string[] | null
          size_preset: string | null
          sort_order: number | null
          updated_at: string
          user_id: string
          width_feet: number | null
        }
        Insert: {
          amenities?: string[] | null
          category: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          length_feet?: number | null
          market_id: string
          name: string
          notes?: string | null
          price: number
          pricing_unit?: string
          requirements?: string[] | null
          size_preset?: string | null
          sort_order?: number | null
          updated_at?: string
          user_id: string
          width_feet?: number | null
        }
        Update: {
          amenities?: string[] | null
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          length_feet?: number | null
          market_id?: string
          name?: string
          notes?: string | null
          price?: number
          pricing_unit?: string
          requirements?: string[] | null
          size_preset?: string | null
          sort_order?: number | null
          updated_at?: string
          user_id?: string
          width_feet?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "slot_types_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_chat_logs: {
        Row: {
          assistant_reply_masked: string | null
          completion_tokens: number | null
          conversation_id: string | null
          created_at: string
          error_message: string | null
          escalated: boolean
          escalation_reason: string | null
          history_length: number | null
          id: string
          latency_ms: number | null
          metadata: Json
          model: string | null
          prompt_tokens: number | null
          request_id: string | null
          status: string
          total_tokens: number | null
          user_id: string | null
          user_message_masked: string | null
        }
        Insert: {
          assistant_reply_masked?: string | null
          completion_tokens?: number | null
          conversation_id?: string | null
          created_at?: string
          error_message?: string | null
          escalated?: boolean
          escalation_reason?: string | null
          history_length?: number | null
          id?: string
          latency_ms?: number | null
          metadata?: Json
          model?: string | null
          prompt_tokens?: number | null
          request_id?: string | null
          status?: string
          total_tokens?: number | null
          user_id?: string | null
          user_message_masked?: string | null
        }
        Update: {
          assistant_reply_masked?: string | null
          completion_tokens?: number | null
          conversation_id?: string | null
          created_at?: string
          error_message?: string | null
          escalated?: boolean
          escalation_reason?: string | null
          history_length?: number | null
          id?: string
          latency_ms?: number | null
          metadata?: Json
          model?: string | null
          prompt_tokens?: number | null
          request_id?: string | null
          status?: string
          total_tokens?: number | null
          user_id?: string | null
          user_message_masked?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_chat_logs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      support_conversations: {
        Row: {
          created_at: string
          escalated_at: string | null
          id: string
          last_message_at: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          escalated_at?: string | null
          id?: string
          last_message_at?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          escalated_at?: string | null
          id?: string
          last_message_at?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_escalations: {
        Row: {
          conversation_id: string
          created_at: string
          delivery_error: string | null
          delivery_metadata: Json
          delivery_status: string
          id: string
          reason: string
          sent_at: string
          user_email: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          delivery_error?: string | null
          delivery_metadata?: Json
          delivery_status?: string
          id?: string
          reason: string
          sent_at?: string
          user_email?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          delivery_error?: string | null
          delivery_metadata?: Json
          delivery_status?: string
          id?: string
          reason?: string
          sent_at?: string
          user_email?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_escalations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          escalated: boolean
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          escalated?: boolean
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          escalated?: boolean
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
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
      vendor_achievements: {
        Row: {
          achievement_key: string
          description: string | null
          icon: string | null
          id: string
          title: string
          unlocked_at: string
          vendor_user_id: string
        }
        Insert: {
          achievement_key: string
          description?: string | null
          icon?: string | null
          id?: string
          title: string
          unlocked_at?: string
          vendor_user_id: string
        }
        Update: {
          achievement_key?: string
          description?: string | null
          icon?: string | null
          id?: string
          title?: string
          unlocked_at?: string
          vendor_user_id?: string
        }
        Relationships: []
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
      vendor_blocked_times: {
        Row: {
          block_end: string
          block_start: string
          created_at: string
          id: string
          is_full_day: boolean
          reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          block_end: string
          block_start: string
          created_at?: string
          id?: string
          is_full_day?: boolean
          reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          block_end?: string
          block_start?: string
          created_at?: string
          id?: string
          is_full_day?: boolean
          reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vendor_buffer_settings: {
        Row: {
          advance_booking_days: number
          available_by_request_only: boolean
          buffer_after_minutes: number
          buffer_before_minutes: number
          created_at: string
          id: string
          minimum_notice_hours: number
          respect_setup_breakdown: boolean
          updated_at: string
          user_id: string
          vendor_approval_expires_hours: number
        }
        Insert: {
          advance_booking_days?: number
          available_by_request_only?: boolean
          buffer_after_minutes?: number
          buffer_before_minutes?: number
          created_at?: string
          id?: string
          minimum_notice_hours?: number
          respect_setup_breakdown?: boolean
          updated_at?: string
          user_id: string
          vendor_approval_expires_hours?: number
        }
        Update: {
          advance_booking_days?: number
          available_by_request_only?: boolean
          buffer_after_minutes?: number
          buffer_before_minutes?: number
          created_at?: string
          id?: string
          minimum_notice_hours?: number
          respect_setup_breakdown?: boolean
          updated_at?: string
          user_id?: string
          vendor_approval_expires_hours?: number
        }
        Relationships: []
      }
      vendor_challenges: {
        Row: {
          challenge_key: string
          completed_at: string | null
          created_at: string
          description: string | null
          ends_at: string
          goal: number
          id: string
          progress: number
          reward_points: number
          starts_at: string
          title: string
          updated_at: string
          vendor_user_id: string
        }
        Insert: {
          challenge_key: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          ends_at: string
          goal: number
          id?: string
          progress?: number
          reward_points?: number
          starts_at?: string
          title: string
          updated_at?: string
          vendor_user_id: string
        }
        Update: {
          challenge_key?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string
          goal?: number
          id?: string
          progress?: number
          reward_points?: number
          starts_at?: string
          title?: string
          updated_at?: string
          vendor_user_id?: string
        }
        Relationships: []
      }
      vendor_details: {
        Row: {
          accepts_cash: boolean | null
          accepts_stripe: boolean | null
          address_line1: string | null
          address_line2: string | null
          base_location_lat: number | null
          base_location_lng: number | null
          business_description: string | null
          business_name: string | null
          business_type: string | null
          city: string | null
          cover_image_url: string | null
          created_at: string
          formatted_address: string | null
          id: string
          media_items: Json | null
          payment_methods: string[] | null
          service_area: string | null
          service_area_type: string | null
          service_categories: string[] | null
          state: string | null
          timezone: string | null
          travel_fee_enabled: boolean | null
          travel_radius_miles: number | null
          updated_at: string
          user_id: string
          website_url: string | null
          zip_code: string | null
        }
        Insert: {
          accepts_cash?: boolean | null
          accepts_stripe?: boolean | null
          address_line1?: string | null
          address_line2?: string | null
          base_location_lat?: number | null
          base_location_lng?: number | null
          business_description?: string | null
          business_name?: string | null
          business_type?: string | null
          city?: string | null
          cover_image_url?: string | null
          created_at?: string
          formatted_address?: string | null
          id?: string
          media_items?: Json | null
          payment_methods?: string[] | null
          service_area?: string | null
          service_area_type?: string | null
          service_categories?: string[] | null
          state?: string | null
          timezone?: string | null
          travel_fee_enabled?: boolean | null
          travel_radius_miles?: number | null
          updated_at?: string
          user_id: string
          website_url?: string | null
          zip_code?: string | null
        }
        Update: {
          accepts_cash?: boolean | null
          accepts_stripe?: boolean | null
          address_line1?: string | null
          address_line2?: string | null
          base_location_lat?: number | null
          base_location_lng?: number | null
          business_description?: string | null
          business_name?: string | null
          business_type?: string | null
          city?: string | null
          cover_image_url?: string | null
          created_at?: string
          formatted_address?: string | null
          id?: string
          media_items?: Json | null
          payment_methods?: string[] | null
          service_area?: string | null
          service_area_type?: string | null
          service_categories?: string[] | null
          state?: string | null
          timezone?: string | null
          travel_fee_enabled?: boolean | null
          travel_radius_miles?: number | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      vendor_packages: {
        Row: {
          add_ons: Json | null
          additional_fees: Json | null
          additional_per_person: number | null
          allow_in_person_balance: boolean
          available_days_override: number[] | null
          available_window_override: Json | null
          balance_due_timing: string | null
          best_for: string[] | null
          booking_mode: string
          breakdown_time_minutes: number | null
          buffer_after_minutes: number
          buffer_before_minutes: number
          cancellation_policy: string | null
          category: string | null
          catering_pricing_model: string | null
          cleanup_minutes: number
          cover_image_url: string | null
          created_at: string
          cuisine_styles: string[] | null
          customer_questions: string[] | null
          customer_requirements: string | null
          default_start_time: string | null
          deposit: number | null
          deposit_percentage: number
          description: string | null
          dietary_options: string[] | null
          duration_minutes: number | null
          featured_until: string | null
          fee_per_mile: number | null
          fulfillment_options: string[]
          fulfillment_pricing: Json
          id: string
          images: string[] | null
          included_guests: number | null
          included_miles: number | null
          included_travel_miles: number | null
          includes: string[] | null
          instant_book: boolean | null
          is_active: boolean | null
          is_featured: boolean | null
          is_published: boolean | null
          max_bookings_per_day: number | null
          max_guests: number | null
          max_items: number | null
          max_travel_miles: number | null
          menu_items: Json
          min_days: number | null
          min_guarantee_amount: number | null
          min_guests: number | null
          min_hours: number | null
          min_quantity: number | null
          min_spend: number | null
          min_units: number
          minimum_notice_hours: number | null
          name: string
          overtime_rate: number | null
          package_kind: string | null
          payment_mode: string
          payment_options: string
          pickup_only: boolean | null
          price: number
          price_per_mile: number | null
          pricing_type: string | null
          pull_up_pricing_model: string | null
          requirements: string[] | null
          requires_vendor_approval: boolean
          setup_minutes: number
          setup_time_minutes: number | null
          sort_order: number | null
          starting_at: number | null
          status: string
          travel_fee_per_mile: number | null
          travel_radius: number | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          add_ons?: Json | null
          additional_fees?: Json | null
          additional_per_person?: number | null
          allow_in_person_balance?: boolean
          available_days_override?: number[] | null
          available_window_override?: Json | null
          balance_due_timing?: string | null
          best_for?: string[] | null
          booking_mode?: string
          breakdown_time_minutes?: number | null
          buffer_after_minutes?: number
          buffer_before_minutes?: number
          cancellation_policy?: string | null
          category?: string | null
          catering_pricing_model?: string | null
          cleanup_minutes?: number
          cover_image_url?: string | null
          created_at?: string
          cuisine_styles?: string[] | null
          customer_questions?: string[] | null
          customer_requirements?: string | null
          default_start_time?: string | null
          deposit?: number | null
          deposit_percentage?: number
          description?: string | null
          dietary_options?: string[] | null
          duration_minutes?: number | null
          featured_until?: string | null
          fee_per_mile?: number | null
          fulfillment_options?: string[]
          fulfillment_pricing?: Json
          id?: string
          images?: string[] | null
          included_guests?: number | null
          included_miles?: number | null
          included_travel_miles?: number | null
          includes?: string[] | null
          instant_book?: boolean | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          max_bookings_per_day?: number | null
          max_guests?: number | null
          max_items?: number | null
          max_travel_miles?: number | null
          menu_items?: Json
          min_days?: number | null
          min_guarantee_amount?: number | null
          min_guests?: number | null
          min_hours?: number | null
          min_quantity?: number | null
          min_spend?: number | null
          min_units?: number
          minimum_notice_hours?: number | null
          name: string
          overtime_rate?: number | null
          package_kind?: string | null
          payment_mode?: string
          payment_options?: string
          pickup_only?: boolean | null
          price: number
          price_per_mile?: number | null
          pricing_type?: string | null
          pull_up_pricing_model?: string | null
          requirements?: string[] | null
          requires_vendor_approval?: boolean
          setup_minutes?: number
          setup_time_minutes?: number | null
          sort_order?: number | null
          starting_at?: number | null
          status?: string
          travel_fee_per_mile?: number | null
          travel_radius?: number | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          add_ons?: Json | null
          additional_fees?: Json | null
          additional_per_person?: number | null
          allow_in_person_balance?: boolean
          available_days_override?: number[] | null
          available_window_override?: Json | null
          balance_due_timing?: string | null
          best_for?: string[] | null
          booking_mode?: string
          breakdown_time_minutes?: number | null
          buffer_after_minutes?: number
          buffer_before_minutes?: number
          cancellation_policy?: string | null
          category?: string | null
          catering_pricing_model?: string | null
          cleanup_minutes?: number
          cover_image_url?: string | null
          created_at?: string
          cuisine_styles?: string[] | null
          customer_questions?: string[] | null
          customer_requirements?: string | null
          default_start_time?: string | null
          deposit?: number | null
          deposit_percentage?: number
          description?: string | null
          dietary_options?: string[] | null
          duration_minutes?: number | null
          featured_until?: string | null
          fee_per_mile?: number | null
          fulfillment_options?: string[]
          fulfillment_pricing?: Json
          id?: string
          images?: string[] | null
          included_guests?: number | null
          included_miles?: number | null
          included_travel_miles?: number | null
          includes?: string[] | null
          instant_book?: boolean | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          max_bookings_per_day?: number | null
          max_guests?: number | null
          max_items?: number | null
          max_travel_miles?: number | null
          menu_items?: Json
          min_days?: number | null
          min_guarantee_amount?: number | null
          min_guests?: number | null
          min_hours?: number | null
          min_quantity?: number | null
          min_spend?: number | null
          min_units?: number
          minimum_notice_hours?: number | null
          name?: string
          overtime_rate?: number | null
          package_kind?: string | null
          payment_mode?: string
          payment_options?: string
          pickup_only?: boolean | null
          price?: number
          price_per_mile?: number | null
          pricing_type?: string | null
          pull_up_pricing_model?: string | null
          requirements?: string[] | null
          requires_vendor_approval?: boolean
          setup_minutes?: number
          setup_time_minutes?: number | null
          sort_order?: number | null
          starting_at?: number | null
          status?: string
          travel_fee_per_mile?: number | null
          travel_radius?: number | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vendor_point_events: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          points: number
          related_id: string | null
          vendor_user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          points: number
          related_id?: string | null
          vendor_user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          points?: number
          related_id?: string | null
          vendor_user_id?: string
        }
        Relationships: []
      }
      vendor_points: {
        Row: {
          created_at: string
          current_streak_days: number
          last_activity_at: string | null
          lifetime_points: number
          longest_streak_days: number
          multiplier: number
          tier: string
          total_points: number
          updated_at: string
          vendor_user_id: string
        }
        Insert: {
          created_at?: string
          current_streak_days?: number
          last_activity_at?: string | null
          lifetime_points?: number
          longest_streak_days?: number
          multiplier?: number
          tier?: string
          total_points?: number
          updated_at?: string
          vendor_user_id: string
        }
        Update: {
          created_at?: string
          current_streak_days?: number
          last_activity_at?: string | null
          lifetime_points?: number
          longest_streak_days?: number
          multiplier?: number
          tier?: string
          total_points?: number
          updated_at?: string
          vendor_user_id?: string
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
      vendor_weekly_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_enabled: boolean
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_enabled?: boolean
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_enabled?: boolean
          start_time?: string
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
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_my_roles: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
